// Polygon2D class containing vertex indices that reference edges in the parent Object2D
// Mirrors the structure of Polygon3D for consistency
export class Polygon2D {
  public color: string;
  private _vertexIndices: number[]; // Array of indices referencing vertices (edges) in Object2D

  constructor(color: string, vertexIndices: number[]) {
    this.color = color;
    this._vertexIndices = vertexIndices;
  }

  // Getter for vertex indices
  public getVertexIndices(): number[] {
    return this._vertexIndices;
  }

  // Setter for vertex indices
  public setVertexIndices(vertexIndices: number[]): void {
    this._vertexIndices = vertexIndices;
  }

  // For backward compatibility, keep vertexIndices as a getter
  public get vertexIndices(): number[] {
    return this._vertexIndices;
  }
}
