// Transform class representing position, rotation, and scale in 3D space
export class Transform {
  public position: { x: number; y: number; z: number };
  public rotation: { x: number; y: number; z: number }; // Euler angles in degrees
  public scale: { x: number; y: number; z: number };

  constructor(
    position = { x: 0, y: 0, z: 0 },
    rotation = { x: 0, y: 0, z: 0 },
    scale = { x: 1, y: 1, z: 1 }
  ) {
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
  }

  // Create a transform with just position (common case)
  public static fromPosition(x: number, y: number, z: number): Transform {
    return new Transform({ x, y, z });
  }
}
