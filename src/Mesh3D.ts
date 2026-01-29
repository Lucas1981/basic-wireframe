import { Polygon3D } from './Polygon3D';
import { Point3D } from './Point3D';

// Mesh3D class containing vertices (positions) and polygons (with vertex indices)
// This is pure geometry data that can be instanced multiple times
export class Mesh3D {
    private _vertices: Point3D[];
    private _polygons: Polygon3D[];
    private _boundingRadius: number; // Pre-calculated bounding sphere radius

    constructor(vertices: Point3D[], polygons: Polygon3D[]) {
        this._vertices = vertices;
        this._polygons = polygons;
        this._boundingRadius = this.calculateBoundingRadius();
    }

    // Calculate bounding sphere radius (max distance from origin to any vertex)
    private calculateBoundingRadius(): number {
        let maxRadiusSquared = 0;

        for (const vertex of this._vertices) {
            const distSquared = vertex.x * vertex.x + vertex.y * vertex.y + vertex.z * vertex.z;
            if (distSquared > maxRadiusSquared) {
                maxRadiusSquared = distSquared;
            }
        }

        return Math.sqrt(maxRadiusSquared);
    }

    // Getter for bounding radius
    public getBoundingRadius(): number {
        return this._boundingRadius;
    }

    // Getter for vertices (positions)
    public getVertices(): Point3D[] {
        return this._vertices;
    }

    // Setter for vertices (recalculates bounding radius)
    public setVertices(vertices: Point3D[]): void {
        this._vertices = vertices;
        this._boundingRadius = this.calculateBoundingRadius();
    }

    // Getter for polygons
    public getPolygons(): Polygon3D[] {
        return this._polygons;
    }

    // Setter for polygons
    public setPolygons(polygons: Polygon3D[]): void {
        this._polygons = polygons;
    }

    // For backward compatibility
    public get polygons(): Polygon3D[] {
        return this._polygons;
    }
}
