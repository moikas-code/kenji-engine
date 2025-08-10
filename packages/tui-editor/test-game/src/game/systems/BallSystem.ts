import { System, Entity, Transform2D, Velocity2D } from "@kenji-engine/core";

export class BallSystem extends System {
  priority = 20;

  getRelevantEntities(entities: Entity[]): Entity[] {
    return entities.filter(entity => 
      entity.hasTag("ball") && 
      entity.hasComponents(Transform2D, Velocity2D)
    );
  }

  update(deltaTime: number, entities: Entity[]): void {
    for (const entity of entities) {
      const transform = entity.getComponent(Transform2D)!;
      const velocity = entity.getComponent(Velocity2D)!;

      // TODO: Add collision detection
      // TODO: Add boundary bouncing
      
      // Update position
      transform.x += velocity.x * deltaTime;
      transform.y += velocity.y * deltaTime;
    }
  }
}
