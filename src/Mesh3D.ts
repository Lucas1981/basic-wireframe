import { Polygon3D } from './Polygon3D';
import { Point3D } from './Point3D';

// Mesh3D class containing shared points, vertices (edges), and polygons
// This is pure geometry data that can be instanced multiple times
export class Mesh3D {
    private _points: Point3D[];
    private _vertices: [number, number][]; // Edges connecting points
    private _polygons: Polygon3D[];
    private _boundingRadius: number; // Pre-calculated bounding sphere radius

    constructor(points: Point3D[], vertices: [number, number][], polygons: Polygon3D[]) {
        this._points = points;
        this._vertices = vertices;
        this._polygons = polygons;
        this._boundingRadius = this.calculateBoundingRadius();
    }

    // Calculate bounding sphere radius (max distance from origin to any point)
    private calculateBoundingRadius(): number {
        let maxRadiusSquared = 0;
        
        for (const point of this._points) {
            const distSquared = point.x * point.x + point.y * point.y + point.z * point.z;
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

    // Getter for points
    public getPoints(): Point3D[] {
        return this._points;
    }

    // Setter for points (recalculates bounding radius)
    public setPoints(points: Point3D[]): void {
        this._points = points;
        this._boundingRadius = this.calculateBoundingRadius();
    }

    // Getter for vertices (edges)
    public getVertices(): [number, number][] {
        return this._vertices;
    }

    // Setter for vertices (edges)
    public setVertices(vertices: [number, number][]): void {
        this._vertices = vertices;
    }

    // Getter for polygons
    public getPolygons(): Polygon3D[] {
        return this._polygons;
    }

    // Setter for polygons
    public setPolygons(polygons: Polygon3D[]): void {
        this._polygons = polygons;
    }

    // For backward compatibility, keep polygons as a getter
    public get polygons(): Polygon3D[] {
        return this._polygons;
    }

    // For backward compatibility, keep points as a getter
    public get points(): Point3D[] {
        return this._points;
    }

    // For backward compatibility, keep vertices as a getter
    public get vertices(): [number, number][] {
        return this._vertices;
    }
}
