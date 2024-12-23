// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050005); // A much darker purple background

// Add fog to the scene
scene.fog = new THREE.Fog(0x050005, 2, 10); // Darker and more dense fog

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true; // Enable shadows
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadows
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting setup
const hemisphereLight = new THREE.HemisphereLight(0x333333, 0x111111, 1.2); // Dimmer and softer lighting
scene.add(hemisphereLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
directionalLight.position.set(0, 50, 0);
directionalLight.castShadow = false;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 500;
directionalLight.shadow.camera.far = 500;
scene.add(directionalLight);

// Ground plane
const planeGeometry = new THREE.PlaneGeometry(300, 300);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
const ground = new THREE.Mesh(planeGeometry, planeMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Initialize Perlin noise generator
const noise = new SimplexNoise();

// Generate city
const citySize = 50;
const blockSpacing = 4;
const collidableObjects = []; // Array to store collidable objects

for (let x = -citySize / 2; x < citySize / 2; x++) {
  for (let z = -citySize / 2; z < citySize / 2; z++) {
    if (x % blockSpacing === 0 || z % blockSpacing === 0) {
      continue; // Skip roads
    }

    const width = Math.random() * 2 + 1;
    const depth = Math.random() * 2 + 1;
    const height = Math.abs(noise.noise2D(x / 10, z / 10)) * 10 + 1;

    const isCylinder = Math.random() > 0.5; // Randomly decide between box or cylinder
    let geometry, building;

    if (isCylinder) {
      // Cylindrical building
      geometry = new THREE.CylinderGeometry(width / 2, width / 2, height, 16);
      const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(Math.random() * 0.3, Math.random() * 0.3, Math.random() * 0.3) });
      building = new THREE.Mesh(geometry, material);
      building.castShadow = true;
      building.receiveShadow = true;

      const offsetX = Math.random() * 2 - 1;
      const offsetZ = Math.random() * 2 - 1;

      const positionX = x * blockSpacing + offsetX;
      const positionZ = z * blockSpacing + offsetZ;

      building.position.set(positionX, height / 2, positionZ);

      // Create bounding cylinder
      collidableObjects.push({
        type: 'cylinder',
        position: building.position.clone(),
        radius: width / 2,
        height: height,
      });

    } else {
      // Box-shaped building
      geometry = new THREE.BoxGeometry(width, height, depth);
      const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(Math.random() * 0.3, Math.random() * 0.3, Math.random() * 0.3) });
      building = new THREE.Mesh(geometry, material);
      building.castShadow = true;
      building.receiveShadow = true;

      const offsetX = Math.random() * 2 - 1;
      const offsetZ = Math.random() * 2 - 1;

      const positionX = x * blockSpacing + offsetX;
      const positionZ = z * blockSpacing + offsetZ;

      building.position.set(positionX, height / 2, positionZ);

      // Create bounding box
      building.geometry.computeBoundingBox();
      const box = new THREE.Box3().setFromObject(building);
      collidableObjects.push({
        type: 'box',
        box,
      });
    }

    scene.add(building);
  }
}

// Rain setup
const rainCount = 50000; // Number of raindrops
const rainGeometry = new THREE.BufferGeometry();
const rainPositions = new Float32Array(rainCount * 3); // x, y, z for each raindrop

// Initialize raindrop positions
for (let i = 0; i < rainCount; i++) {
  rainPositions[i * 3] = (Math.random() - 0.5) * 300; // Random x position
  rainPositions[i * 3 + 1] = Math.random() * 100 + 50; // Random y position (above the city)
  rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 300; // Random z position
}

rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));

// Material for the raindrops
const rainMaterial = new THREE.PointsMaterial({
  color: 0xaaaaaa,
  size: 0.1,
  transparent: true,
  opacity: 0.8,
});

// Create the rain particle system
const rain = new THREE.Points(rainGeometry, rainMaterial);
scene.add(rain);

// Animate the rain
function animateRain() {
  const positions = rainGeometry.attributes.position.array;

  for (let i = 0; i < rainCount; i++) {
    positions[i * 3 + 1] -= 0.5; // Move raindrops down

    // Reset raindrop to the top if it falls below the ground
    if (positions[i * 3 + 1] < 0) {
      positions[i * 3 + 1] = Math.random() * 100 + 50;
    }
  }

  rainGeometry.attributes.position.needsUpdate = true; // Notify Three.js of position changes
}

// Load the Batmobile model
const loader = new THREE.GLTFLoader();
let batmobile;
let batmobileBox = new THREE.Box3();

loader.load('./batmobile.glb', (gltf) => {
  batmobile = gltf.scene;
  batmobile.scale.set(0.05, 0.05, 0.05); // Smaller size
  batmobile.position.set(0, 0.1, 0); // Closer to the ground
  batmobile.rotation.y = Math.PI; // Rotate to face the correct direction
  batmobile.traverse((node) => {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });

  // Add headlights
  const headlightLeft = new THREE.SpotLight(0xffffaa, 0.6, 20, Math.PI / 8, 0.3);
  const headlightRight = new THREE.SpotLight(0xffffaa, 0.6, 20, Math.PI / 8, 0.3);

  headlightLeft.position.set(-0.25, 0.1, 0.5);
  headlightRight.position.set(0.25, 0.1, 0.5);

  headlightLeft.target.position.set(-0.25, 0.1, 1.5);
  headlightRight.target.position.set(0.25, 0.1, 1.5);

  batmobile.add(headlightLeft);
  batmobile.add(headlightLeft.target);
  batmobile.add(headlightRight);
  batmobile.add(headlightRight.target);

  scene.add(batmobile);
});

// Function to update Batmobile bounding box
function updateBatmobileBoundingBox() {
  if (batmobile) {
    batmobileBox.setFromObject(batmobile);
    batmobileBox.expandByScalar(-0.1); // Slightly shrink the bounding box
  }
}

// Check collisions with buildings
function checkCollisions() {
  for (const object of collidableObjects) {
    if (object.type === 'box') {
      if (batmobileBox.intersectsBox(object.box)) {
        velocity = 0; // Stop movement on collision
        return true; // Collision detected
      }
    } else if (object.type === 'cylinder') {
      const dx = batmobile.position.x - object.position.x;
      const dz = batmobile.position.z - object.position.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance < object.radius && Math.abs(batmobile.position.y - object.position.y) < object.height / 2) {
        velocity = 0; // Stop movement on collision
        return true; // Collision detected
      }
    }
  }
  return false;
}

// Control setup
let forward = false, backward = false, left = false, right = false;

window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyW') forward = true;
  if (e.code === 'KeyS') backward = true;
  if (e.code === 'KeyA') left = true;
  if (e.code === 'KeyD') right = true;
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'KeyW') forward = false;
  if (e.code === 'KeyS') backward = false;
  if (e.code === 'KeyA') left = false;
  if (e.code === 'KeyD') right = false;
});

// Car physics variables
let velocity = 0; // Current speed of the car
let maxSpeed = 0.25; // Maximum forward speed
let acceleration = 0.0005; // Acceleration rate
let deceleration = 0.001; // Deceleration rate
let friction = 0.0025; // Friction to slow the car naturally
let turnSpeed = 0.07; // Base turning speed
let shiftPressed = false; // Track if Shift is pressed

// Update Batmobile movement
function updateBatmobile() {
  if (!batmobile) return;

  // Save the current position for collision rollback
  const previousPosition = batmobile.position.clone();

  // Acceleration and deceleration
  if (forward) {
    velocity += acceleration;
    if (velocity > maxSpeed) velocity = maxSpeed;
  } else if (backward) {
    velocity -= acceleration;
    if (velocity < -maxSpeed / 2) velocity = -maxSpeed / 2; // Reverse is slower
  } else {
    if (velocity > 0) {
      velocity -= friction;
      if (velocity < 0) velocity = 0;
    } else if (velocity < 0) {
      velocity += friction;
      if (velocity > 0) velocity = 0;
    }
  }

  // Turning
  if (left) {
    batmobile.rotation.y += turnSpeed * (velocity / maxSpeed);
  }
  if (right) {
    batmobile.rotation.y -= turnSpeed * (velocity / maxSpeed);
  }

  // Apply velocity to movement
  batmobile.translateZ(velocity);

  // Update bounding box
  updateBatmobileBoundingBox();

  // Check for collisions
  if (checkCollisions()) {
    // Revert to the previous position if a collision occurred
    batmobile.position.copy(previousPosition);
  }
}

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Lerp parameters
const cameraTargetPosition = new THREE.Vector3();
const cameraCurrentPosition = new THREE.Vector3();
const cameraTargetLookAt = new THREE.Vector3();
const cameraCurrentLookAt = new THREE.Vector3();
const lerpSpeed = 0.1; // Adjust for faster/slower camera movement

function updateCamera() {
  if (batmobile) {
    // Desired position and look-at target
    const offset = new THREE.Vector3(0, 0.2, -0.5); // Adjust to follow the car
    offset.applyQuaternion(batmobile.quaternion);

    cameraTargetPosition.copy(batmobile.position.clone().add(offset));
    cameraTargetLookAt.copy(batmobile.position.clone());

    // Smoothly interpolate position
    cameraCurrentPosition.lerp(cameraTargetPosition, lerpSpeed);
    camera.position.copy(cameraCurrentPosition);

    // Smoothly interpolate look-at direction
    cameraCurrentLookAt.lerp(cameraTargetLookAt, lerpSpeed);
    camera.lookAt(cameraCurrentLookAt);
  }
}

// Random item setup
const itemGeometry = new THREE.SphereGeometry(0.3, 16, 16);
const itemMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 });
const item = new THREE.Mesh(itemGeometry, itemMaterial);

// Timer display setup
const timerDisplay = document.createElement('div');
timerDisplay.style = "position: absolute; top: 40px; left: 50%; transform: translateX(-50%); font-size: 18px; font-family: Arial; text-align: center; color: white; z-index: 1000;";
timerDisplay.textContent = '';
document.body.appendChild(timerDisplay);

let startTime;
let found = false;

function spawnItem() {
  let validPosition = false;
  let randomX, randomZ;

  while (!validPosition) {
    randomX = (Math.random() - 0.5) * citySize * blockSpacing;
    randomZ = (Math.random() - 0.5) * citySize * blockSpacing;

    const itemBox = new THREE.Box3().setFromCenterAndSize(
      new THREE.Vector3(randomX, 0.15, randomZ),
      new THREE.Vector3(0.3, 0.3, 0.3)
    );

    validPosition = !collidableObjects.some((object) => {
      if (object.type === 'box') {
        return itemBox.intersectsBox(object.box);
      } else if (object.type === 'cylinder') {
        const dx = randomX - object.position.x;
        const dz = randomZ - object.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        return (
          distance < object.radius &&
          Math.abs(0.15 - object.position.y) < object.height / 2
        );
      }
      return false;
    });
  }

  item.position.set(randomX, 0.15, randomZ);
  scene.add(item);
  startTime = performance.now();
}

spawnItem();

function checkItemPickup() {
  if (found || !batmobile) return;

  const itemBox = new THREE.Box3().setFromObject(item);
  if (batmobileBox.intersectsBox(itemBox)) {
    found = true;
    const timeTaken = ((performance.now() - startTime) / 1000).toFixed(2);
    timerDisplay.textContent = `Time taken: ${timeTaken} seconds`;
    console.log(`Item found in ${timeTaken}s`);
    scene.remove(item);

    setTimeout(() => {
      found = false;
      timerDisplay.textContent = '';
      spawnItem();
    }, 2000);
  }
}

// Compass setup
const compass = document.createElement('div');
compass.style = "position: absolute; top: 10px; left: 50%; transform: translateX(-50%); font-size: 20px; font-family: Arial; text-align: center; color: white; z-index: 1000;";
compass.textContent = '↑';
document.body.appendChild(compass);

function updateCompass() {
  if (!batmobile || !item) return;

  // Calculate direction from Batmobile to item
  const direction = new THREE.Vector3().subVectors(item.position, batmobile.position).normalize();
  const batmobileDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(batmobile.quaternion).normalize();

  // Calculate the angle between the Batmobile's forward direction and the item's direction
  const angle = Math.atan2(
    direction.x * batmobileDirection.z - direction.z * batmobileDirection.x,
    direction.x * batmobileDirection.x + direction.z * batmobileDirection.z
  );

  // Convert angle to compass direction
  const normalizedAngle = (angle + 2 * Math.PI) % (2 * Math.PI); // Normalize to 0 - 2*PI

  if (normalizedAngle >= Math.PI / 8 && normalizedAngle < 3 * Math.PI / 8) {
    compass.textContent = '↘'; // South-East
  } else if (normalizedAngle >= 3 * Math.PI / 8 && normalizedAngle < 5 * Math.PI / 8) {
    compass.textContent = '→'; // East
  } else if (normalizedAngle >= 5 * Math.PI / 8 && normalizedAngle < 7 * Math.PI / 8) {
    compass.textContent = '↗'; // North-East
  } else if (normalizedAngle >= 7 * Math.PI / 8 && normalizedAngle < 9 * Math.PI / 8) {
    compass.textContent = '↑'; // North
  } else if (normalizedAngle >= 9 * Math.PI / 8 && normalizedAngle < 11 * Math.PI / 8) {
    compass.textContent = '↖'; // North-West
  } else if (normalizedAngle >= 11 * Math.PI / 8 && normalizedAngle < 13 * Math.PI / 8) {
    compass.textContent = '←'; // West
  } else if (normalizedAngle >= 13 * Math.PI / 8 && normalizedAngle < 15 * Math.PI / 8) {
    compass.textContent = '↙'; // South-West
  } else {
    compass.textContent = '↓'; // South
  }
}

// Animation loop
function animate() {
  animateRain();
  updateBatmobile();
  updateCamera();
  updateCompass();
  checkItemPickup();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// Handle resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
