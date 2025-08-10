import { Entity } from "./Entity";
import { System } from "./System";
import { Component } from "./Component";

export class World {
  private entities = new Set<Entity>();
  private systems = new Map<string, System>();
  private systemsArray: System[] = [];

  addEntity(entity: Entity): this {
    this.entities.add(entity);
    return this;
  }

  removeEntity(entity: Entity): this {
    this.entities.delete(entity);
    return this;
  }

  addSystem<T extends System>(system: T): this {
    this.systems.set(system.constructor.name, system);
    this.updateSystemsArray();
    return this;
  }

  removeSystem<T extends System>(systemClass: new () => T): this {
    this.systems.delete(systemClass.name);
    this.updateSystemsArray();
    return this;
  }

  private updateSystemsArray(): void {
    this.systemsArray = Array.from(this.systems.values()).sort(
      (a, b) => a.priority - b.priority
    );
  }

  update(deltaTime: number): void {
    const entitiesArray = Array.from(this.entities);

    for (const system of this.systemsArray) {
      if (system.enabled) {
        const relevantEntities = system.getRelevantEntities(entitiesArray);
        system.update(deltaTime, relevantEntities);
      }
    }
  }

  getEntitiesWith(
    ...components: (new (...args: any[]) => Component)[]
  ): Entity[] {
    return Array.from(this.entities).filter((entity) =>
      components.every((component) => entity.hasComponent(component))
    );
  }

  getEntityById(id: string): Entity | undefined {
    return Array.from(this.entities).find((entity) => entity.id === id);
  }

  getAllEntities(): Entity[] {
    return Array.from(this.entities);
  }
}
