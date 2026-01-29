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
  const vertices: Point3D[] = [];
  const polygons: Polygon3D[] = [];

  // Generate vertices (grid positions)
  const pointsPerSide = gridSize + 1;
  const halfSize = (gridSize * cellSize) / 2;

  for (let z = 0; z < pointsPerSide; z++) {
    for (let x = 0; x < pointsPerSide; x++) {
      const posX = x * cellSize - halfSize;
      const posZ = z * cellSize - halfSize;
      vertices.push(new Point3D(posX, 0, posZ));
    }
  }

  const getVertexIndex = (x: number, z: number): number => {
    return z * pointsPerSide + x;
  };

  // Generate two triangles per grid square (polygons with vertex indices)
  for (let z = 0; z < gridSize; z++) {
    for (let x = 0; x < gridSize; x++) {
      const topLeft = getVertexIndex(x, z);
      const topRight = getVertexIndex(x + 1, z);
      const bottomLeft = getVertexIndex(x, z + 1);
      const bottomRight = getVertexIndex(x + 1, z + 1);

      // Triangle 1: topLeft -> topRight -> bottomLeft
      polygons.push(new Polygon3D(color, [topLeft, topRight, bottomLeft]));

      // Triangle 2: topRight -> bottomRight -> bottomLeft
      polygons.push(new Polygon3D(color, [topRight, bottomRight, bottomLeft]));
    }
  }

  return new Mesh3D(vertices, polygons);
}
