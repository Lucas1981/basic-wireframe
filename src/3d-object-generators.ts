import { Point3D } from "./Point3D";
import { Polygon3D } from "./Polygon3D";
import { Mesh3D } from "./Mesh3D";

/**
 * Procedural 3D Object Generators
 * 
 * Functions to generate meshes at runtime.
 * All generators return Mesh3D objects ready for instancing.
 */

// Function to create a grid mesh procedurally (for floors, terrains, etc.)
export function createGridMesh(
  gridSize: number, // Number of squares along each axis (e.g., 16 = 16x16 grid)
  cellSize: number, // Size of each square
  color: string = "#808080" // Default gray color
): Mesh3D {
  const points: Point3D[] = [];
  const vertices: [number, number][] = [];
  const polygons: Polygon3D[] = [];

  // Generate points (grid vertices)
  // For a 16x16 grid, we need 17x17 = 289 points
  const pointsPerSide = gridSize + 1;
  const halfSize = (gridSize * cellSize) / 2;

  for (let z = 0; z < pointsPerSide; z++) {
    for (let x = 0; x < pointsPerSide; x++) {
      const posX = x * cellSize - halfSize;
      const posZ = z * cellSize - halfSize;
      points.push(new Point3D(posX, 0, posZ)); // y = 0 for flat floor
    }
  }

  // Helper to get point index from grid coordinates
  const getPointIndex = (x: number, z: number): number => {
    return z * pointsPerSide + x;
  };

  // Generate edges (vertices in our system)
  const edgeMap = new Map<string, number>(); // Map edge key to edge index
  let edgeIndex = 0;

  const addEdge = (p1: number, p2: number): number => {
    // Create a consistent key (smaller index first)
    const key = p1 < p2 ? `${p1}-${p2}` : `${p2}-${p1}`;

    if (!edgeMap.has(key)) {
      vertices.push([p1, p2]);
      edgeMap.set(key, edgeIndex);
      edgeIndex++;
    }

    return edgeMap.get(key)!;
  };

  // Generate triangles and their edges
  for (let z = 0; z < gridSize; z++) {
    for (let x = 0; x < gridSize; x++) {
      // Get the four corners of this grid square
      const topLeft = getPointIndex(x, z);
      const topRight = getPointIndex(x + 1, z);
      const bottomLeft = getPointIndex(x, z + 1);
      const bottomRight = getPointIndex(x + 1, z + 1);

      // Split square into two triangles
      // Triangle 1: topLeft -> topRight -> bottomLeft
      const edge1 = addEdge(topLeft, topRight);
      const edge2 = addEdge(topRight, bottomLeft);
      const edge3 = addEdge(bottomLeft, topLeft);
      polygons.push(new Polygon3D(color, [edge1, edge2, edge3]));

      // Triangle 2: topRight -> bottomRight -> bottomLeft
      const edge4 = addEdge(topRight, bottomRight);
      const edge5 = addEdge(bottomRight, bottomLeft);
      const edge6 = addEdge(bottomLeft, topRight);
      polygons.push(new Polygon3D(color, [edge4, edge5, edge6]));
    }
  }

  return new Mesh3D(points, vertices, polygons);
}
