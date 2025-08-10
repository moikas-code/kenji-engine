import { Component } from "./Component";
import { Entity } from "./Entity";

export abstract class System {
  abstract requiredComponents: (new (...args: any[]) => Component)[];
  priority: number = 0;
  enabled: boolean = true;

  abstract update(deltaTime: number, entities: Entity[]): void;

  getRelevantEntities(entities: Entity[]): Entity[] {
    return entities.filter(
      (entity) =>
        entity.active &&
        this.requiredComponents.every((component) =>
          entity.hasComponent(component)
        )
    );
  }
}
