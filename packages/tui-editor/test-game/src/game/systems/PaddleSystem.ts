import { System, Entity, Transform2D, Velocity2D } from "@kuuzuki-ge/core";

export class PaddleSystem extends System {
  priority = 10;

  getRelevantEntities(entities: Entity[]): Entity[] {
    return entities.filter(entity => 
      entity.hasTag("paddle") && 
      entity.hasComponents(Transform2D, Velocity2D)
    );
  }

  update(deltaTime: number, entities: Entity[]): void {
    for (const entity of entities) {
      const transform = entity.getComponent(Transform2D)!;
      const velocity = entity.getComponent(Velocity2D)!;

      // TODO: Add paddle input handling
      // TODO: Add boundary constraints
      
      // Update position
      transform.x += velocity.x * deltaTime;
      transform.y += velocity.y * deltaTime;
    }
  }
}
