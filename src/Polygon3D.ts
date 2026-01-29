// Polygon3D class containing vertex indices that reference vertices in the parent Mesh3D
export class Polygon3D {
    public color: string;
    private _vertexIndices: number[]; // Array of indices referencing vertices (edges) in Object3D

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