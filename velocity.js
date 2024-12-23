// Car dynamics variables
export let carSpeed = 0;              // Base speed of the car in m/s
export let carRotationSpeed = 0.05;   // Car rotation speed
export let carAcceleration = 0.02;    // Initial acceleration value
export let carRPM = 1000;             // Initial RPM
export let carGear = 1;               // Initial gear

// Constants
const MAX_RPM = 9000;                 // Increased Maximum RPM to allow shifting at 8500
const RPM_DECAY_RATE = 0.8;           // 20% slower RPM increase after each gear shift
const MAX_GEAR = 6;                   // Maximum gear
const SHIFT_DELAY = 500;              // Delay in milliseconds during upshifts
const DECELERATION_RATE = 0.003;      // Deceleration rate reduced by a factor of 10

// Gear speed factors (max speed per gear in m/s, scaled down by 10)
const GEAR_SPEED_FACTORS = [0, 1, 2, 3, 4, 5, 6];

// State variables
let isAccelerating = false;
let isShiftDelaying = false;
let isShiftKeyPressed = false;        // Track if the shift key is pressed

// Rotation speeds
const BASE_ROTATION_SPEED = 0.05;
const TIGHT_ROTATION_SPEED = 0.1;     // Tighter rotation speed when shift key is held

/**
 * Sets up event listeners for the shift key to adjust the turning radius dynamically.
 */
function setupShiftKeyListener() {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Shift') {
            isShiftKeyPressed = true;
            carRotationSpeed = TIGHT_ROTATION_SPEED;
        }
    });

    document.addEventListener('keyup', (event) => {
        if (event.key === 'Shift') {
            isShiftKeyPressed = false;
            carRotationSpeed = BASE_ROTATION_SPEED;
        }
    });
}

// Call the function to set up the listeners
setupShiftKeyListener();

/**
 * Updates car dynamics (RPM, gear, speed, and acceleration) when accelerating or decelerating.
 */
export function updateCarDynamics() {
    if (isShiftDelaying) return; // Skip updates during shift delay

    if (isAccelerating) {
        // Increase RPM based on gear and decay rate
        carRPM += 50 / carGear * RPM_DECAY_RATE;

        // Adjust acceleration based on current gear and RPM
        updateAcceleration();

        // Calculate speed based on RPM and gear
        updateSpeed();

        // Check if we need to shift up
        if (shouldShiftUp()) {
            shiftUp();
        }
    } else {
        // Gradually reduce RPM when not accelerating
        carRPM -= 10;

        // Ensure RPM does not go below 1000
        if (carRPM <= 1000) {
            carRPM = 1000;
            if (carGear > 1 && shouldShiftDown()) {
                shiftDown();
            }
        }

        // Gradually reduce speed when not accelerating
        carSpeed = Math.max(0, carSpeed - DECELERATION_RATE);
    }

    // Ensure RPM stays within bounds
    carRPM = Math.max(1000, Math.min(carRPM, MAX_RPM));
}

/**
 * Updates the car's speed based on RPM and gear.
 */
function updateSpeed() {
    // Calculate speed based on gear's max speed and current RPM ratio
    const maxGearSpeed = GEAR_SPEED_FACTORS[carGear];
    carSpeed = (carRPM / MAX_RPM) * maxGearSpeed;
}

/**
 * Updates acceleration based on the current gear and RPM.
 * Higher gears and RPM reduce acceleration.
 */
function updateAcceleration() {
    // Base acceleration decreases with higher gears and higher RPM
    const gearFactor = 1 / (carGear * 1.5); // Acceleration decreases with higher gear
    const rpmFactor = 1 - (carRPM / MAX_RPM) * 0.6; // Reduces acceleration up to 60% at max RPM

    carAcceleration = 0.005 * gearFactor * rpmFactor; // Base acceleration scaled down by 10
}

/**
 * Checks if the car should shift up based on RPM and gear.
 */
function shouldShiftUp() {
    const shiftUpThreshold = 8500; // Shift up when RPM exceeds 8500
    return carRPM >= shiftUpThreshold && carGear < MAX_GEAR;
}

/**
 * Checks if the car should shift down based on RPM and gear.
 */
function shouldShiftDown() {
    const shiftDownThreshold = 2000; // Shift down when RPM drops below 2000
    return carRPM <= shiftDownThreshold && carGear > 1;
}

/**
 * Handles upshifting and recalculates RPM to match the current speed.
 * Applies a shift delay to simulate upshift pause.
 */
function shiftUp() {
    carGear += 1;
    recalculateRPM();
    applyShiftDelay();
}

/**
 * Handles downshifting and recalculates RPM to match the current speed.
 * No shift delay for downshifting.
 */
function shiftDown() {
    carGear -= 1;
    recalculateRPM();
}

/**
 * Recalculates RPM based on current speed and new gear.
 */
function recalculateRPM() {
    const maxGearSpeed = GEAR_SPEED_FACTORS[carGear];
    carRPM = Math.min(MAX_RPM, (carSpeed / maxGearSpeed) * MAX_RPM);
}

/**
 * Applies a delay during gear shifts to simulate the shifting pause.
 * Automatically resumes acceleration after the delay.
 */
function applyShiftDelay() {
    isShiftDelaying = true;
    const wasAccelerating = isAccelerating;
    stopAcceleration(); // Stop accelerating during the delay
    setTimeout(() => {
        isShiftDelaying = false;
        if (wasAccelerating) {
            startAcceleration(); // Automatically resume acceleration if it was active before the shift
        }
    }, SHIFT_DELAY);
}

/**
 * Starts accelerating the car (sets the accelerating state to true).
 */
export function startAcceleration() {
    if (!isShiftDelaying && !(carGear === MAX_GEAR && carRPM >= MAX_RPM)) {
        isAccelerating = true;
    }
}

/**
 * Stops accelerating the car (sets the accelerating state to false).
 */
export function stopAcceleration() {
    isAccelerating = false;
}
