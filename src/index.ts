import { Canvas } from "./Canvas";
import { createMesh3DFromJSONData, drawWorld, rotateMesh3DY } from "./3d-utils";
import { createGridMesh } from "./3d-object-generators";
import { World } from "./World";
import { SceneObject } from "./SceneObject";
import { Camera } from "./Camera";
import cubeData from "./assets/cube.json";
import pyramidData from "./assets/pyramid.json";

// Global variables for animation
let canvas: Canvas;
let world: World;
let camera: Camera;
let cubeObjects: SceneObject[];
let lastFrameTime = 0;
const ROTATION_SPEED = 20; // Degrees per second
const CAMERA_ORBIT_SPEED = 30; // Degrees per second for camera rotation
let cameraAngle = 0; // Current camera angle around the scene

// Animation loop function (time-based, frame-rate independent)
const loop = (currentTime: number = 0): void => {
  // Calculate delta time in seconds
  const deltaTime =
    lastFrameTime === 0 ? 0 : (currentTime - lastFrameTime) / 1000;
  lastFrameTime = currentTime;

  // Clear the canvas
  canvas.clearScreen();

  // Rotate all cube meshes based on elapsed time (frame-rate independent)
  const rotationAmount = ROTATION_SPEED * deltaTime;
  cubeObjects.forEach((cubeObj) =>
    rotateMesh3DY(cubeObj.getMesh(), rotationAmount)
  );

  // Orbit camera around the scene
  cameraAngle += CAMERA_ORBIT_SPEED * deltaTime;
  camera = Camera.createOrbital(
    10, // Distance from center (radius of orbit)
    cameraAngle, // Horizontal angle (orbits on X/Z plane)
    0, // Vertical angle (keep at same height)
    { x: 0, y: 0, z: 0 } // Look at origin (center of scene)
  );

  // Draw the entire world from camera's perspective
  // (includes frustum culling inside drawWorld)
  drawWorld(canvas, world, camera);

  // Debug: Log culled objects every 60 frames (~1 second)
  if (Math.floor(currentTime / 1000) !== Math.floor(lastFrameTime / 1000)) {
    const visibleCount = world
      .getObjects()
      .filter((obj) => obj.isVisible()).length;
    const totalCount = world.getObjects().length;
    console.log(
      `Visible: ${visibleCount}/${totalCount} objects | Camera angle: ${Math.round(
        cameraAngle
      )}°`
    );
  }

  // Request next frame
  requestAnimationFrame(loop);
};

// Entry point for the 3D engine
async function main(): Promise<void> {
  canvas = new Canvas("canvas");
  world = new World();

  // Create initial camera position
  camera = Camera.createOrbital(10, 0, 0);

  // Create one shared cube mesh (instancing!)
  const cubeMesh = createMesh3DFromJSONData(cubeData);

  // Create pyramid mesh for frustum culling test
  const pyramidMesh = createMesh3DFromJSONData(pyramidData);

  // Create a floor grid mesh (16x16 squares, each 0.5 units)
  const floorMesh = createGridMesh(16, 0.5, "#404040");

  // Create three scene objects that share the same cube mesh
  const cube1 = new SceneObject(
    cubeMesh,
    { x: -4, y: 0, z: 0 },
    { x: 0, y: 0, z: 0 },
    { x: 0.8, y: 0.8, z: 0.8 }
  );

  const cube2 = new SceneObject(
    cubeMesh,
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 0, z: 0 },
    { x: 1, y: 1, z: 1 }
  );

  const cube3 = new SceneObject(
    cubeMesh,
    { x: 4, y: 0, z: 0 },
    { x: 0, y: 45, z: 0 },
    { x: 1.2, y: 1.2, z: 1.2 }
  );

  // Create floor object (static - doesn't rotate)
  const floor = new SceneObject(
    floorMesh,
    { x: 0, y: -2, z: 0 }, // Position below the cubes
    { x: 0, y: 0, z: 0 },
    { x: 1, y: 1, z: 1 }
  );

  // Create pyramid for frustum culling test
  // Place it at radius 12 (just outside camera orbit of 10)
  // At 0 degrees (positive Z), so visible when camera is at 180 degrees
  const pyramid = new SceneObject(
    pyramidMesh,
    { x: 0, y: 0, z: 13 }, // Behind the scene from initial camera position
    { x: 0, y: 0, z: 0 },
    { x: 1.5, y: 1.5, z: 1.5 } // Slightly larger for visibility
  );

  // Store references for rotation (only cubes rotate, not floor or pyramid)
  cubeObjects = [cube1, cube2, cube3];

  // Add floor first (draw order - floor drawn first, then cubes on top)
  world.addObject(floor);

  // Add all cubes to the world
  world.addObject(cube1);
  world.addObject(cube2);
  world.addObject(cube3);

  // Add pyramid for frustum culling test
  world.addObject(pyramid);

  console.log(
    "3D engine started - camera orbiting around three rotating cubes on a static grid floor!"
  );
  console.log(
    "Watch the orange pyramid appear/disappear as camera rotates (frustum culling test)"
  );

  // Start the animation loop
  loop();
}

// Initialize the engine when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  main().catch((error) => {
    console.error("Failed to run program:", error);
  });
});
