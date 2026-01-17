import { SceneObject } from "./SceneObject";

// World class manages a collection of SceneObjects
export class World {
  private _objects: SceneObject[];

  constructor() {
    this._objects = [];
  }

  // Add a scene object to the world
  public addObject(sceneObject: SceneObject): void {
    this._objects.push(sceneObject);
  }

  // Remove a scene object from the world
  public removeObject(sceneObject: SceneObject): void {
    this._objects = this._objects.filter((obj) => obj !== sceneObject);
  }

  // Get all objects in the world
  public getObjects(): SceneObject[] {
    return this._objects;
  }

  // Clear all objects from the world
  public clear(): void {
    this._objects = [];
  }

  // Get number of objects in the world
  public get objectCount(): number {
    return this._objects.length;
  }
}
