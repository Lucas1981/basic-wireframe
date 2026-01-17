import { Polygon2D } from './Polygon2D';
import { Point2D } from './Point2D';

// Object2D class containing shared points, vertices (edges), and polygons
// Mirrors the structure of Object3D for consistency
export class Object2D {
    private _points: Point2D[];
    private _vertices: [number, number][]; // Edges connecting points
    private _polygons: Polygon2D[];

    constructor(points: Point2D[], vertices: [number, number][], polygons: Polygon2D[]) {
        this._points = points;
        this._vertices = vertices;
        this._polygons = polygons;
    }

    // Getter for points
    public getPoints(): Point2D[] {
        return this._points;
    }

    // Setter for points
    public setPoints(points: Point2D[]): void {
        this._points = points;
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
    public getPolygons(): Polygon2D[] {
        return this._polygons;
    }

    // Setter for polygons
    public setPolygons(polygons: Polygon2D[]): void {
        this._polygons = polygons;
    }

    // For backward compatibility, keep polygons as a getter
    public get polygons(): Polygon2D[] {
        return this._polygons;
    }

    // For backward compatibility, keep points as a getter
    public get points(): Point2D[] {
        return this._points;
    }

    // For backward compatibility, keep vertices as a getter
    public get vertices(): [number, number][] {
        return this._vertices;
    }
}
