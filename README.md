QuietKnight
====================

This project is a 3D interactive game where players control the Batmobile to navigate through a procedurally generated city, avoiding obstacles and collecting randomly spawned items. The scene features dynamic rain, realistic lighting, and an interactive compass to guide players toward objectives.

FEATURES
--------
1. Procedurally Generated City
   - Buildings are generated using Perlin noise to create a realistic skyline.
   - Includes both box-shaped and cylindrical buildings.
   - Roads are procedurally placed by skipping specific grid points.

2. Dynamic Rain Effect
   - Rain particles fall continuously over the city.
   - Raindrops reset their position once they hit the ground to simulate endless rain.

3. Interactive Gameplay
   - Control the Batmobile with the keyboard:
     - W: Move forward
     - S: Move backward
     - A: Turn left
     - D: Turn right
   - Adjustments for acceleration, friction, and turning for smooth car physics.
   - Collision detection with buildings ensures realistic movement constraints.

4. Random Item Collection
   - Items spawn randomly in valid positions around the city.
   - Players must navigate to the item while avoiding collisions.
   - A timer tracks how long it takes to find the item.
   - After collection, a new item spawns after a short delay.

5. Dynamic Compass
   - A compass indicates the relative direction of the item.
   - Compass dynamically updates based on the Batmobile's orientation and the item's location.

6. Camera
   - A smooth third-person camera follows the Batmobile.
   - Camera position and look-at target smoothly interpolate to provide a cinematic feel.

SETUP INSTRUCTIONS
------------------
Prerequisites:
   - Node.js and npm installed
   - A local server to serve the project (e.g., Live Server)
   - Three.js installed
   - GLTFLoader included for model loading

Installation:
   1. Clone the repository:
      git clone <repository-url>
   2. Navigate to the project directory:
      cd batmobile-city-chase
   3. Install dependencies:
      npm install
   4. Start a local server:
      npx http-server .
   5. Open the project in your browser (e.g., http://localhost:8080).

Asset Setup:
   - Place the `batmobile.glb` model in the root directory of the project.

PROJECT STRUCTURE
-----------------
- index.html: Entry point for the project.
- script.js: Main game logic, including scene setup, Batmobile physics, and gameplay mechanics.
- batmobile.glb: The 3D model of the Batmobile.

GAMEPLAY INSTRUCTIONS
---------------------
1. Use W, A, S, D to control the Batmobile.
2. Follow the compass to locate the item.
3. Avoid collisions with buildings to maintain smooth movement.
4. Once the item is collected, a new item will spawn after 2 seconds.
5. The timer on-screen tracks your performance.

CUSTOMIZATION
-------------
Adjusting City Size:
   - Modify the `citySize` and `blockSpacing` variables to change the city layout.

Changing Rain Density:
   - Adjust the `rainCount` variable to increase or decrease the number of raindrops.

Tweaking Car Physics:
   - Modify `maxSpeed`, `acceleration`, `deceleration`, `friction`, and `turnSpeed` to fine-tune the Batmobile's behavior.

DEPENDENCIES
------------
- Three.js: Core 3D rendering library
- SimplexNoise: Perlin noise generation for building heights
- GLTFLoader: For loading the Batmobile model

CREDITS
-------
- Batmobile model: Provided by external source
- Developed using Three.js for 3D rendering.

FUTURE ENHANCEMENTS
-------------------
- Add more interactivity, such as power-ups or penalties.
- Improve building textures for a more immersive environment.
- Include sound effects and background music.
- Multiplayer mode for competitive gameplay.

LICENSE
-------
This project is open-source and available under the MIT License.
