// Camera class representing the viewer's position and orientation in the 3D world
export class Camera {
  public position: { x: number; y: number; z: number };
  public rotation: { x: number; y: number; z: number }; // Euler angles in degrees (pitch, yaw, roll)

  constructor(
    position = { x: 0, y: 0, z: 0 },
    rotation = { x: 0, y: 0, z: 0 }
  ) {
    this.position = position;
    this.rotation = rotation;
  }

  // Helper to set position
  public setPosition(x: number, y: number, z: number): void {
    this.position = { x, y, z };
  }

  // Helper to set rotation
  public setRotation(x: number, y: number, z: number): void {
    this.rotation = { x, y, z };
  }

  // Create an orbital camera that looks at a target point
  public static createOrbital(
    distance: number,
    angleY: number, // Horizontal angle around target
    angleX: number = 0, // Vertical angle (elevation)
    target = { x: 0, y: 0, z: 0 }
  ): Camera {
    // Convert angles to radians
    const yRad = (angleY * Math.PI) / 180;
    const xRad = (angleX * Math.PI) / 180;

    // Calculate camera position on a sphere around the target
    const cosX = Math.cos(xRad);
    const x = target.x + distance * Math.sin(yRad) * cosX;
    const y = target.y + distance * Math.sin(xRad);
    const z = target.z + distance * Math.cos(yRad) * cosX;

    // Calculate the direction vector from camera to target
    const dx = target.x - x;
    const dy = target.y - y;
    const dz = target.z - z;

    // Calculate rotation angles to look at target (look-at calculation)
    // Yaw (Y rotation): angle in the XZ plane
    const rotY = Math.atan2(dx, dz) * (180 / Math.PI);

    // Pitch (X rotation): angle from XZ plane to target
    const distanceXZ = Math.sqrt(dx * dx + dz * dz);
    const rotX = -Math.atan2(dy, distanceXZ) * (180 / Math.PI);

    const camera = new Camera({ x, y, z }, { x: rotX, y: rotY, z: 0 });

    return camera;
  }
}
