import { Point2D } from "./Point2D";
import { Polygon2D } from "./Polygon2D";
import { Object2D } from "./Object2D";
import { Canvas } from "./Canvas";

// Interface for JSON 2D object data
interface Object2DData {
  points: { x: number; y: number }[];
  vertices: number[][]; // Array of [point_index1, point_index2] pairs
  polygons: {
    color: string;
    vertexIndices: number[]; // Indices into the vertices array
  }[];
}

// Function to create a 2D object from JSON data (compile-time loading)
export function create2DObjectFromJSONData(jsonData: Object2DData): Object2D {
  // Convert plain objects to Point2D instances
  const points = jsonData.points.map((point) => new Point2D(point.x, point.y));

  // Convert number[][] to [number, number][] with validation
  const vertices: [number, number][] = jsonData.vertices.map((vertex) => {
    if (vertex.length !== 2) {
      throw new Error(
        `Invalid vertex: expected 2 elements, got ${vertex.length}`
      );
    }
    return [vertex[0], vertex[1]];
  });

  // Create polygons with vertex indices
  const polygons = jsonData.polygons.map(
    (polygonData) => new Polygon2D(polygonData.color, polygonData.vertexIndices)
  );

  return new Object2D(points, vertices, polygons);
}

// Function to draw a 2D object by rendering all polygons
export function draw2DObject(canvas: Canvas, object2D: Object2D): void {
  const allPoints = object2D.getPoints();
  const allVertices = object2D.getVertices();

  // Iterate through all polygons in the object
  for (const polygon2D of object2D.getPolygons()) {
    // Get the vertex indices for this polygon
    const vertexIndices = polygon2D.getVertexIndices();

    // Draw each edge defined in the polygon's vertices
    for (const vertexIdx of vertexIndices) {
      const vertex = allVertices[vertexIdx];
      const startPoint = allPoints[vertex[0]];
      const endPoint = allPoints[vertex[1]];

      canvas.drawLine(
        startPoint.x,
        startPoint.y,
        endPoint.x,
        endPoint.y,
        polygon2D.color
      );
    }
  }
}

// Legacy function to draw a single 2D polygon (kept for backward compatibility if needed)
// This is now primarily used internally by the projection system
export function draw2DPolygon(
  canvas: Canvas,
  polygon: Polygon2D,
  points: Point2D[],
  vertices: [number, number][]
): void {
  // Get the vertex indices for this polygon
  const vertexIndices = polygon.getVertexIndices();

  // Draw each edge defined in the polygon's vertices
  for (const vertexIdx of vertexIndices) {
    const vertex = vertices[vertexIdx];
    const startPoint = points[vertex[0]];
    const endPoint = points[vertex[1]];

    canvas.drawLine(
      startPoint.x,
      startPoint.y,
      endPoint.x,
      endPoint.y,
      polygon.color
    );
  }
}
