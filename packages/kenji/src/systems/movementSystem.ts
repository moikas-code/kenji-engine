import { World } from '../ecs/world';
import { ComponentTypes } from '../components';
import type { Position, Velocity } from '../components';

export class MovementSystem {
  update(world: World, deltaTime: number): void {
    const entities = world.query(ComponentTypes.Position, ComponentTypes.Velocity);
    
    for (const entity of entities) {
      const position = world.getComponent(entity, ComponentTypes.Position) as Position | undefined;
      const velocity = world.getComponent(entity, ComponentTypes.Velocity) as Velocity | undefined;
      
      if (position && velocity) {
        position.x += velocity.vx * (deltaTime / 1000);
        position.y += velocity.vy * (deltaTime / 1000);
      }
    }
  }
}