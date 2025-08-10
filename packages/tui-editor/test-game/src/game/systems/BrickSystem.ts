import { System, Entity, Transform2D, Collider2D } from "@kuuzuki-ge/core";

export class BrickSystem extends System {
  priority = 30;

  getRelevantEntities(entities: Entity[]): Entity[] {
    return entities.filter(entity => 
      entity.hasTag("brick") && 
      entity.hasComponents(Transform2D, Collider2D)
    );
  }

  update(deltaTime: number, entities: Entity[]): void {
    // TODO: Add brick collision detection
    // TODO: Add brick destruction logic
    // TODO: Add score tracking
  }
}
