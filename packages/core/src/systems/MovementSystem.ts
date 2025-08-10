import { System } from '../ecs/System';
import { Entity } from '../ecs/Entity';
import { Transform2D } from '../components/Transform2D';
import { Velocity2D } from '../components/Velocity2D';

export class MovementSystem extends System {
  requiredComponents = [Transform2D, Velocity2D];

  update(deltaTime: number, entities: Entity[]): void {
    entities.forEach(entity => {
      const transform = entity.getComponent(Transform2D)!;
      const velocity = entity.getComponent(Velocity2D)!;
      
      transform.x += velocity.x * deltaTime;
      transform.y += velocity.y * deltaTime;
    });
  }
}