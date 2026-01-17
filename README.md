# 3D Wireframe Rendering Engine

A from-scratch 3D wireframe rendering engine built with TypeScript and HTML5 Canvas, demonstrating the complete graphics pipeline from model space to screen space.

## Features

- ✅ **Complete 3D Pipeline**: Model → World → Camera → Projection → Screen space transformations
- ✅ **Camera System**: Euler-based camera with orbital motion and look-at functionality
- ✅ **Scene Graph**: Efficient object instancing with per-instance transforms
- ✅ **Procedural Meshes**: Runtime mesh generation (grids, primitives)
- ✅ **Perspective Projection**: Proper FOV-based perspective with configurable parameters
- ✅ **Mesh Instancing**: Share geometry between multiple scene objects
- ✅ **Wireframe Rendering**: Clean edge-based rendering with shared vertices
- ✅ **Frustum Culling**: Bounding sphere-based visibility testing for performance optimization

## Architecture

### Core Classes

#### `Mesh3D`
Pure geometry data that can be instanced multiple times.
```typescript
class Mesh3D {
  points: Point3D[]            // Shared vertices
  vertices: [number, number][] // Edges (point index pairs)
  polygons: Polygon3D[]        // Faces (references edges)
  boundingRadius: number       // Pre-calculated for frustum culling
}
```

#### `SceneObject`
An instance of a mesh with its transform in the world.
```typescript
class SceneObject {
  mesh: Mesh3D                 // Reference to shared geometry
  position: {x, y, z}          // World position
  rotation: {x, y, z}          // Euler angles (degrees)
  scale: {x, y, z}             // Scale factors
  visibilityState: VisibilityState // VISIBLE or CULLED
}
```

#### `Camera`
Viewer's position and orientation in 3D space.
```typescript
class Camera {
  position: {x, y, z}       // Camera location
  rotation: {x, y, z}       // Euler angles (pitch, yaw, roll)
  
  static createOrbital(distance, angleY, angleX, target)
}
```

#### `World`
Scene container managing all scene objects.
```typescript
class World {
  addObject(sceneObject)
  removeObject(sceneObject)
  getObjects(): SceneObject[]
}
```

## Rendering Pipeline

### Complete 5-Stage Transformation

```
┌─────────────────┐
│  MODEL SPACE    │  Mesh vertices in local coordinate system
│  (Local/Object) │  Origin typically at object center
└────────┬────────┘
         │ applyTransformToPoint()
         │ • Scale → Rotate (X→Y→Z) → Translate
         ↓
┌─────────────────┐
│  WORLD SPACE    │  All objects in shared coordinate system
│                 │  Objects positioned relative to world origin
└────────┬────────┘
         │ worldToCameraSpace()
         │ • Translate by -camera.position
         │ • Rotate by -camera.rotation (Y→X→Z order)
         ↓
┌─────────────────┐
│  CAMERA SPACE   │  Camera at origin, looking down +Z axis
│  (View Space)   │  Y axis points UP ↑
└────────┬────────┘
         │ cullSceneObject() [FRUSTUM CULLING]
         │ • Bounding sphere test against frustum planes
         │ • Updates object visibility state
         │
         │ projectToNDC()
         │ • Perspective division: x/z, y/z
         │ • Apply focal length (based on FOV)
         ↓
┌─────────────────┐
│ PROJECTION      │  Normalized Device Coordinates (NDC)
│ SPACE (NDC)     │  Typical range: [-1, 1] for visible area
│                 │  Y axis points UP ↑ (mathematical convention)
└────────┬────────┘
         │ ndcToScreenSpace()
         │ • Scale to pixel dimensions
         │ • Flip Y axis (UP → DOWN)
         │ • Center on screen
         ↓
┌─────────────────┐
│  SCREEN SPACE   │  Pixel coordinates [0, width] × [0, height]
│  (Pixels)       │  Y axis points DOWN ↓ (canvas convention)
│                 │  Origin at top-left corner
└─────────────────┘
```

### Coordinate System Conventions

#### Y-Axis Orientation

**Mathematical Spaces (Model, World, Camera, Projection):**
```
        +Y (UP)
         ↑
         |
         |
-X ------+------ +X
         |
         |
         ↓
        -Y (DOWN)
```

**Screen Space:**
```
(0,0) --------→ +X
  |
  |
  ↓ +Y (DOWN)
```

### Rotation Orders

**Object Transforms:** X → Y → Z (standard Euler)
- Minimizes gimbal lock for most object orientations
- Natural for object manipulation

**Camera Transforms:** Y → X → Z (yaw → pitch → roll)
- Gimbal lock only at ±90° pitch (straight up/down)
- Standard for FPS/orbital cameras
- Most natural for camera controls

## Data Structure Design

### Mesh Representation

```
Object3D (Now: Mesh3D)
  ├─ Points: [P0, P1, P2, ..., Pn]        # 8 points for a cube
  ├─ Vertices (Edges): [                  # 12 edges for a cube
  │    [0, 1],  // Edge from P0 to P1
  │    [1, 2],  // Edge from P1 to P2
  │    ...
  │  ]
  └─ Polygons: [                          # 12 triangular faces for a cube
       { color: "#ff0000", 
         vertexIndices: [0, 1, 12] },     # Triangle using edges 0, 1, 12
       ...
     ]
```

**Benefits:**
- ✅ No point duplication (8 points vs 36 for naive approach)
- ✅ No edge duplication (shared edges between faces)
- ✅ Memory efficient for complex meshes
- ✅ Easy to apply transformations (transform points once)

### Scene Graph Pattern

Similar to Unity/Three.js architecture:

```
World
  ├─ SceneObject1 (Floor)
  │    ├─ mesh: FloorMesh (shared)
  │    └─ transform: {pos, rot, scale}
  │
  ├─ SceneObject2 (Cube1)
  │    ├─ mesh: CubeMesh (shared)
  │    └─ transform: {x: -4, ...}
  │
  ├─ SceneObject3 (Cube2)
  │    ├─ mesh: CubeMesh (same instance!)
  │    └─ transform: {x: 0, ...}
  │
  └─ SceneObject4 (Cube3)
       ├─ mesh: CubeMesh (same instance!)
       └─ transform: {x: 4, ...}
```

**Instancing:** One `CubeMesh` shared by three `SceneObjects` = 3× memory savings!

## Key Functions

### Mesh Creation

```typescript
// Load mesh from JSON
createMesh3DFromJSONData(jsonData): Mesh3D

// Generate procedural grid
createGridMesh(gridSize, cellSize, color): Mesh3D
```

### Transformations

```typescript
// Model → World space
applyTransformToPoint(point, sceneObject): Point3D

// World → Camera space
worldToCameraSpace(worldPoint, camera): Point3D

// Camera → Projection space
projectToNDC(cameraPoint): Point3D

// Projection → Screen space
ndcToScreenSpace(ndcPoint): Point2D

// Combined camera → screen
project3DPoint(cameraPoint): Point2D
```

### Rendering

```typescript
// Frustum culling
cullSceneObject(sceneObject, camera): void
isObjectInFrustum(cameraSpaceCenter, boundingRadius): boolean

// Draw single object
drawSceneObject(canvas, sceneObject, camera): void

// Draw entire scene (includes culling pass)
drawWorld(canvas, world, camera): void
```

## Frustum Culling System

### Bounding Sphere Culling

Each mesh pre-calculates its bounding radius on construction:

```typescript
boundingRadius = max(distance(origin, point)) for all points
```

Scene objects account for scale:

```typescript
worldBoundingRadius = meshRadius × max(scale.x, scale.y, scale.z)
```

### Culling Pipeline

**Performed in Camera Space** (after world transform, before projection):

1. Transform object center to camera space
2. Get world-space bounding radius
3. Test against 6 frustum planes:
   - Near plane (Z < nearPlane - radius)
   - Far plane (Z > farPlane + radius)
   - Left/Right planes (±X bounds at object's depth)
   - Top/Bottom planes (±Y bounds at object's depth)
4. Update visibility state: `VISIBLE` or `CULLED`

### Frustum Math

```typescript
// Frustum dimensions at depth Z
halfHeight = tan(FOV/2) × Z
halfWidth = halfHeight × aspectRatio

// Sphere-plane tests
if (center.x - radius > halfWidth) → culled (outside right)
if (center.x + radius < -halfWidth) → culled (outside left)
// ... similar for top, bottom, near, far
```

### Performance Impact

- **Visible objects**: Full rendering pipeline
- **Culled objects**: Skip projection + drawing (90%+ cost saved)
- **Overhead**: 1 transform + 6 plane tests per object (minimal)

**Conservative culling:** May show partially off-screen objects, but never hides visible ones.

## Projection Math

### Perspective Projection

```typescript
FOV = 60°  // Field of view (adjustable)
focalLength = 1 / tan(FOV / 2)

// Perspective division
ndcX = (cameraX × focalLength) / cameraZ
ndcY = (cameraY × focalLength) / cameraZ
```

### Screen Transform

```typescript
screenX = centerX + (ndcX × scale)
screenY = centerY - (ndcY × scale)  // Flip Y axis
```

**Scale Factor:** Determines how much NDC space maps to screen pixels. Higher scale = larger objects.

## Camera System

### Orbital Camera

Creates a camera that orbits around a target point:

```typescript
Camera.createOrbital(
  distance,   // Radius of orbit
  angleY,     // Horizontal angle (degrees)
  angleX,     // Vertical angle/elevation (degrees)
  target      // Look-at point {x, y, z}
)
```

**Look-At Calculation:**
```typescript
// Calculate direction from camera to target
direction = target - cameraPosition

// Compute rotation angles
yaw = atan2(direction.x, direction.z)
pitch = -atan2(direction.y, distance_xz)
```

This ensures the camera always faces the target while orbiting.

## Usage Example

```typescript
// Create geometry
const cubeMesh = createMesh3DFromJSONData(cubeData);
const floorMesh = createGridMesh(16, 0.5, "#404040");

// Create scene objects with transforms
const cube1 = new SceneObject(
  cubeMesh,
  { x: -4, y: 0, z: 0 },     // position
  { x: 0, y: 0, z: 0 },      // rotation
  { x: 1, y: 1, z: 1 }       // scale
);

const floor = new SceneObject(
  floorMesh,
  { x: 0, y: -2, z: 0 },
  { x: 0, y: 0, z: 0 },
  { x: 1, y: 1, z: 1 }
);

// Build scene
const world = new World();
world.addObject(floor);
world.addObject(cube1);

// Setup camera
const camera = Camera.createOrbital(10, 0, 0);

// Render
drawWorld(canvas, world, camera);
```

## Performance Considerations

### Mesh Instancing
- **1 mesh + 100 objects** = Memory for 1 mesh + 100 transforms
- **100 separate meshes** = Memory for 100 complete meshes
- **Savings:** ~90-95% memory reduction for repeated objects

### Transform Caching
- Points transformed once per object per frame
- Projections cached during rendering pass
- O(n) complexity where n = total vertices in scene

### Edge Deduplication
- Shared edges between triangles stored once
- Reduces edge count by ~50% for closed meshes
- Example: Cube with 12 triangles = 18 unique edges (vs 36 without sharing)

### Frustum Culling
- Objects outside view frustum skipped entirely
- Bounding sphere test in camera space (6 plane tests)
- Typical savings: 50-90% reduction in draw calls for large scenes
- Pre-calculated bounding radius per mesh (one-time cost)

## Technical Decisions

### Why Euler Angles?
- ✅ Intuitive for beginners
- ✅ Simple to implement
- ✅ Sufficient for camera and basic object rotation
- ⚠️ Gimbal lock possible at extreme angles
- 🔮 Future: Quaternions for robust rotation

### Why Y-Up in 3D Space?
- Industry standard (OpenGL, DirectX, Unity, Blender)
- Mathematical convention (+Y = up)
- Natural for height/elevation
- Screen space flips Y for canvas rendering

### Why Separate Projection Stages?
- **Modularity:** Each stage testable independently
- **Flexibility:** Easy to add clipping, post-processing
- **Clarity:** Clear separation of concerns
- **Future-proof:** Ready for advanced features (shadows, culling)

## Future Enhancements

- [x] Frustum culling (reject objects outside view) ✅ **Implemented**
- [ ] Backface culling (don't draw back-facing polygons)
- [ ] Z-buffering / depth sorting
- [ ] Quaternion rotations (no gimbal lock)
- [ ] Matrix-based transforms (GPU-ready)
- [ ] Lighting and shading
- [ ] Texture mapping
- [ ] Multiple viewports
- [ ] Camera controls (FPS, orbit controls)

## Building & Running

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Production build
npm run build
```

## Project Structure

```
src/
├── index.ts                   # Entry point, animation loop
├── Canvas.ts                  # Canvas wrapper with drawing utilities
├── Camera.ts                  # Camera class with orbital helper
├── World.ts                   # Scene graph container
├── SceneObject.ts             # Mesh instance with transform & visibility
├── Mesh3D.ts                  # Geometry data structure with bounding sphere
├── Polygon3D.ts               # Polygon/face definition
├── Point3D.ts                 # 3D point/vector
├── Point2D.ts                 # 2D point for screen coordinates
├── VisibilityState.ts         # Enum for object visibility (VISIBLE/CULLED)
├── 3d-utils.ts                # Core rendering pipeline & frustum culling
├── 3d-object-generators.ts    # Procedural mesh generators
├── 2d-utils.ts                # 2D drawing utilities
├── constants.ts               # Configuration (FOV, screen size, etc.)
└── assets/
    ├── cube.json              # Cube mesh data
    └── pyramid.json           # Pyramid mesh data (frustum test)
```

## License

MIT
# basic-wireframe
