import { Point3D } from "./Point3D";
import { Point2D } from "./Point2D";
import { Polygon3D } from "./Polygon3D";
import { Mesh3D } from "./Mesh3D";
import { SceneObject } from "./SceneObject";
import { Canvas } from "./Canvas";
import { World } from "./World";
import { Camera } from "./Camera";
import { VisibilityState } from "./VisibilityState";
import {
  HALF_SCREEN_WIDTH,
  HALF_SCREEN_HEIGHT,
  FOCAL_LENGTH,
  FOV,
  ASPECT_RATIO,
} from "./constants";

// Interface for JSON 3D object data
interface Mesh3DData {
  vertices: { x: number; y: number; z: number }[];
  polygons: {
    color: string;
    vertexIndices: number[]; // Indices into the vertices array
  }[];
}

// Function to create a 3D mesh from JSON data (compile-time loading)
export function createMesh3DFromJSONData(jsonData: Mesh3DData): Mesh3D {
  const vertices = jsonData.vertices.map(
    (v) => new Point3D(v.x, v.y, v.z)
  );

  const polygons = jsonData.polygons.map(
    (p) => new Polygon3D(p.color, p.vertexIndices)
  );

  return new Mesh3D(vertices, polygons);
}

// Simple orthographic projection from 3D to 2D (ignores depth)
// Useful for 2D-like views, UI elements, or debugging
const orthographicProjectionScale = 200;
export function project3DPointOrthographic(point3D: Point3D): Point2D {
  // Orthographic projection: just drop Z coordinate
  // Apply screen space transform (scale, center, flip Y)
  const screenX = HALF_SCREEN_WIDTH + point3D.x * orthographicProjectionScale;
  const screenY = HALF_SCREEN_HEIGHT - point3D.y * orthographicProjectionScale; // Flip Y axis

  return new Point2D(screenX, screenY);
}

// Perspective projection from camera space to normalized device coordinates (NDC)
// Returns coordinates in [-1, 1] range where:
//   x: -1 (left) to +1 (right)
//   y: -1 (bottom) to +1 (top)  ← Y axis points UP in projection space!
//   z: depth value (for future depth sorting/clipping)
export function projectToNDC(cameraPoint: Point3D): Point3D {
  // Prevent division by zero or negative z (behind camera)
  const safeZ = Math.max(cameraPoint.z, 0.1);

  // Perspective division using pre-calculated focal length
  const perspectiveFactor = FOCAL_LENGTH / safeZ;
  const ndcX = cameraPoint.x * perspectiveFactor;
  const ndcY = cameraPoint.y * perspectiveFactor;

  // Return NDC coordinates (keeping z for potential depth sorting)
  return new Point3D(ndcX, ndcY, safeZ);
}

// Transform from projection space (NDC) to screen space
// Handles:
//   1. Scaling from [-1, 1] to screen dimensions
//   2. Flipping Y axis (NDC Y goes up, screen Y goes down)
//   3. Centering on screen

// Scale factor to map from NDC-like coordinates to pixels
// Adjust this based on desired visible range
const ndcToScreenSpaceScale = 200;
export function ndcToScreenSpace(ndcPoint: Point3D): Point2D {
  // NDC is typically in range [-1, 1], but our FOV and perspective
  // might give us values outside this range. We'll scale appropriately.

  // Transform to screen coordinates:
  // 1. Scale NDC coordinates
  // 2. Flip Y axis: NDC Y goes up (+1 = top), screen Y goes down (0 = top)
  // 3. Translate to center of screen
  const screenX = HALF_SCREEN_WIDTH + ndcPoint.x * ndcToScreenSpaceScale;
  const screenY = HALF_SCREEN_HEIGHT - ndcPoint.y * ndcToScreenSpaceScale; // Flip Y: subtract instead of add

  return new Point2D(screenX, screenY);
}

// Combined projection pipeline: camera space → NDC → screen space
// This is a convenience function that combines both steps
export function project3DPoint(cameraPoint: Point3D): Point2D {
  const ndcPoint = projectToNDC(cameraPoint);
  return ndcToScreenSpace(ndcPoint);
}

// Function to rotate a mesh around the Y-axis (modifies the mesh directly)
export function rotateMesh3DY(mesh: Mesh3D, angleInDegrees: number): void {
  // Convert degrees to radians
  const angleInRadians = (angleInDegrees * Math.PI) / 180;
  const cosAngle = Math.cos(angleInRadians);
  const sinAngle = Math.sin(angleInRadians);

  // Rotate all vertices in the mesh
  const rotatedVertices = mesh.getVertices().map((vertex) => {
    // Y-axis rotation matrix:
    // x' = x * cos(θ) + z * sin(θ)
    // y' = y (unchanged)
    // z' = -x * sin(θ) + z * cos(θ)
    const newX = vertex.x * cosAngle + vertex.z * sinAngle;
    const newY = vertex.y; // Y remains unchanged for Y-axis rotation
    const newZ = -vertex.x * sinAngle + vertex.z * cosAngle;

    return new Point3D(newX, newY, newZ);
  });

  mesh.setVertices(rotatedVertices);
}

// Apply a transform to a point (scale, rotate, translate)
// This uses the SceneObject's transform properties directly
export function applyTransformToPoint(
  point: Point3D,
  sceneObject: SceneObject
): Point3D {
  // Step 1: Apply scale
  let x = point.x * sceneObject.scale.x;
  let y = point.y * sceneObject.scale.y;
  let z = point.z * sceneObject.scale.z;

  // Step 2: Apply rotation (X -> Y -> Z order, Euler angles)
  // Rotation around X-axis
  if (sceneObject.rotation.x !== 0) {
    const angleX = (sceneObject.rotation.x * Math.PI) / 180;
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    const tempY = y * cosX - z * sinX;
    const tempZ = y * sinX + z * cosX;
    y = tempY;
    z = tempZ;
  }

  // Rotation around Y-axis
  if (sceneObject.rotation.y !== 0) {
    const angleY = (sceneObject.rotation.y * Math.PI) / 180;
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);
    const tempX = x * cosY + z * sinY;
    const tempZ = -x * sinY + z * cosY;
    x = tempX;
    z = tempZ;
  }

  // Rotation around Z-axis
  if (sceneObject.rotation.z !== 0) {
    const angleZ = (sceneObject.rotation.z * Math.PI) / 180;
    const cosZ = Math.cos(angleZ);
    const sinZ = Math.sin(angleZ);
    const tempX = x * cosZ - y * sinZ;
    const tempY = x * sinZ + y * cosZ;
    x = tempX;
    y = tempY;
  }

  // Step 3: Apply translation
  x += sceneObject.position.x;
  y += sceneObject.position.y;
  z += sceneObject.position.z;

  return new Point3D(x, y, z);
}

// Transform a point from world space to camera space
// Uses inverse transform: translate by -cameraPos, then rotate by -cameraRot
// Rotation order: Y->X->Z (inverse of Z->X->Y) to avoid gimbal lock
export function worldToCameraSpace(
  worldPoint: Point3D,
  camera: Camera
): Point3D {
  // Step 1: Translate to camera-relative coordinates
  let x = worldPoint.x - camera.position.x;
  let y = worldPoint.y - camera.position.y;
  let z = worldPoint.z - camera.position.z;

  // Step 2: Apply inverse rotation (opposite order: Y -> X -> Z becomes Z -> X -> Y inverse)
  // This is the standard view transformation

  // Inverse rotation around Y-axis (yaw)
  if (camera.rotation.y !== 0) {
    const angleY = (-camera.rotation.y * Math.PI) / 180; // Negative for inverse
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);
    const tempX = x * cosY + z * sinY;
    const tempZ = -x * sinY + z * cosY;
    x = tempX;
    z = tempZ;
  }

  // Inverse rotation around X-axis (pitch)
  if (camera.rotation.x !== 0) {
    const angleX = (-camera.rotation.x * Math.PI) / 180; // Negative for inverse
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    const tempY = y * cosX - z * sinX;
    const tempZ = y * sinX + z * cosX;
    y = tempY;
    z = tempZ;
  }

  // Inverse rotation around Z-axis (roll)
  if (camera.rotation.z !== 0) {
    const angleZ = (-camera.rotation.z * Math.PI) / 180; // Negative for inverse
    const cosZ = Math.cos(angleZ);
    const sinZ = Math.sin(angleZ);
    const tempX = x * cosZ - y * sinZ;
    const tempY = x * sinZ + y * cosZ;
    x = tempX;
    y = tempY;
  }

  return new Point3D(x, y, z);
}

// Frustum culling using bounding sphere test in camera space
// Tests if a sphere is inside the view frustum
// Returns true if visible, false if culled

const nearPlane = 0.1; // Minimum Z distance
const farPlane = 1000; // Maximum Z distance
const halfFovRad = (FOV * Math.PI) / 360; // FOV/2 in radians
export function isObjectInFrustum(
  cameraSpaceCenter: Point3D,
  boundingRadius: number
): boolean {
  if (cameraSpaceCenter.z + boundingRadius < nearPlane) {
    return false; // Behind or touching near plane
  }

  // Far plane test (optional - you might not want one)
  if (cameraSpaceCenter.z - boundingRadius > farPlane) {
    return false; // Too far away
  }

  // Calculate frustum dimensions at the sphere's depth
  // Using half-angle: tan(FOV/2) = halfHeight / z
  const halfHeight = Math.tan(halfFovRad) * cameraSpaceCenter.z;
  const halfWidth = halfHeight * ASPECT_RATIO;

  // Right plane test
  if (cameraSpaceCenter.x - boundingRadius > halfWidth) {
    return false;
  }

  // Left plane test
  if (cameraSpaceCenter.x + boundingRadius < -halfWidth) {
    return false;
  }

  // Top plane test
  if (cameraSpaceCenter.y - boundingRadius > halfHeight) {
    return false;
  }

  // Bottom plane test
  if (cameraSpaceCenter.y + boundingRadius < -halfHeight) {
    return false;
  }

  // Object is visible
  return true;
}

// Perform frustum culling on a scene object
// Updates the object's visibility state
export function cullSceneObject(
  sceneObject: SceneObject,
  camera: Camera
): void {
  // Transform object center to camera space
  const worldCenter = new Point3D(
    sceneObject.position.x,
    sceneObject.position.y,
    sceneObject.position.z
  );
  const cameraSpaceCenter = worldToCameraSpace(worldCenter, camera);

  // Get world-space bounding radius (accounts for scale)
  const boundingRadius = sceneObject.getWorldBoundingRadius();

  // Test frustum visibility
  const visible = isObjectInFrustum(cameraSpaceCenter, boundingRadius);

  // Update visibility state
  sceneObject.setVisibilityState(
    visible ? VisibilityState.VISIBLE : VisibilityState.CULLED
  );
}

// Function to draw a scene object by projecting vertices and rendering polygon edges
export function drawSceneObject(
  canvas: Canvas,
  sceneObject: SceneObject,
  camera: Camera
): void {
  const mesh = sceneObject.getMesh();

  const vertices3D = mesh.getVertices();
  const polygons = mesh.getPolygons();

  // Project all vertices: object transform -> camera -> screen
  const projectedPoints = vertices3D.map((vertex) => {
    const worldPoint = applyTransformToPoint(vertex, sceneObject);
    const cameraPoint = worldToCameraSpace(worldPoint, camera);
    return project3DPoint(cameraPoint);
  });

  // Draw each polygon's edges (consecutive vertex index pairs, closing the loop)
  for (const polygon of polygons) {
    const indices = polygon.getVertexIndices();
    const n = indices.length;

    for (let i = 0; i < n; i++) {
      const a = indices[i];
      const b = indices[(i + 1) % n];
      const start = projectedPoints[a];
      const end = projectedPoints[b];

      canvas.drawLine(start.x, start.y, end.x, end.y, polygon.color);
    }
  }
}

// Function to draw the entire world by rendering all scene objects
export function drawWorld(canvas: Canvas, world: World, camera: Camera): void {
  // Culling pass: Test all objects against frustum
  for (const sceneObject of world.getObjects()) {
    cullSceneObject(sceneObject, camera);
  }

  // Rendering pass: Draw only visible objects
  for (const sceneObject of world.getObjects()) {
    if (sceneObject.isVisible()) {
      drawSceneObject(canvas, sceneObject, camera);
    }
  }
}
