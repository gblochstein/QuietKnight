export function setupMovementControls() {
    const movement = {
      forward: false,
      backward: false,
      left: false,
      right: false,
    };
  
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyW') movement.forward = true;
      if (e.code === 'KeyS') movement.backward = true;
      if (e.code === 'KeyA') movement.left = true;
      if (e.code === 'KeyD') movement.right = true;
    });
  
    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyW') movement.forward = false;
      if (e.code === 'KeyS') movement.backward = false;
      if (e.code === 'KeyA') movement.left = false;
      if (e.code === 'KeyD') movement.right = false;
    });
  
    return movement;
  }
  
  export function updateBatmobile(batmobile, movement, speed = 0.2, turnSpeed = 0.03) {
    if (!batmobile) return;
  
    if (movement.forward) batmobile.translateZ(speed);
    if (movement.backward) batmobile.translateZ(-speed);
    if (movement.left) batmobile.rotation.y += turnSpeed;
    if (movement.right) batmobile.rotation.y -= turnSpeed;
  }
  
  export function updateCamera(camera, batmobile) {
    if (batmobile) {
      const offset = new THREE.Vector3(0, 1.2, -2.5);
      offset.applyQuaternion(batmobile.quaternion);
      camera.position.copy(batmobile.position.clone().add(offset));
      camera.lookAt(batmobile.position);
    }
  }
  