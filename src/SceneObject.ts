import { Mesh3D } from "./Mesh3D";
import { VisibilityState } from "./VisibilityState";

// SceneObject class representing an instance of a mesh with its transform in the scene
// This follows the Three.js/Unity pattern: shared geometry + per-instance transform
export class SceneObject {
  private _mesh: Mesh3D;
  private _visibilityState: VisibilityState;
  
  // Transform properties (directly accessible for intuitive API)
  public position: { x: number; y: number; z: number };
  public rotation: { x: number; y: number; z: number }; // Euler angles in degrees
  public scale: { x: number; y: number; z: number };

  constructor(
    mesh: Mesh3D,
    position = { x: 0, y: 0, z: 0 },
    rotation = { x: 0, y: 0, z: 0 },
    scale = { x: 1, y: 1, z: 1 }
  ) {
    this._mesh = mesh;
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
    this._visibilityState = VisibilityState.VISIBLE; // Default to visible
  }

  // Getter for mesh
  public getMesh(): Mesh3D {
    return this._mesh;
  }

  // Setter for mesh (allows swapping geometry)
  public setMesh(mesh: Mesh3D): void {
    this._mesh = mesh;
  }

  // Convenience getter for backward compatibility
  public get mesh(): Mesh3D {
    return this._mesh;
  }

  // Visibility state getters/setters
  public getVisibilityState(): VisibilityState {
    return this._visibilityState;
  }

  public setVisibilityState(state: VisibilityState): void {
    this._visibilityState = state;
  }

  public isVisible(): boolean {
    return this._visibilityState === VisibilityState.VISIBLE;
  }

  // Calculate world-space bounding radius (accounting for scale)
  public getWorldBoundingRadius(): number {
    const meshRadius = this._mesh.getBoundingRadius();
    // Use the maximum scale component for conservative bounds
    const maxScale = Math.max(
      Math.abs(this.scale.x),
      Math.abs(this.scale.y),
      Math.abs(this.scale.z)
    );
    return meshRadius * maxScale;
  }

  // Helper methods for common operations
  public setPosition(x: number, y: number, z: number): void {
    this.position = { x, y, z };
  }

  public setRotation(x: number, y: number, z: number): void {
    this.rotation = { x, y, z };
  }

  public setScale(x: number, y: number, z: number): void {
    this.scale = { x, y, z };
  }

  public setUniformScale(scale: number): void {
    this.scale = { x: scale, y: scale, z: scale };
  }
}
