import { World } from '../ecs/world';
import { ComponentTypes } from '../components';
import type { Position, Dimensions, Collider } from '../components';

export class CollisionSystem {
  checkCollision(
    pos1: Position,
    dim1: Dimensions,
    pos2: Position,
    dim2: Dimensions
  ): boolean {
    return (
      pos1.x < pos2.x + dim2.width &&
      pos1.x + dim1.width > pos2.x &&
      pos1.y < pos2.y + dim2.height &&
      pos1.y + dim1.height > pos2.y
    );
  }

  update(world: World): void {
    const entities = world.query(
      ComponentTypes.Position,
      ComponentTypes.Dimensions,
      ComponentTypes.Collider
    );
    
    for (let i = 0; i < entities.length; i++) {
      const entity1 = entities[i];
      if (entity1 === undefined) continue;
      
      const pos1 = world.getComponent(entity1, ComponentTypes.Position) as Position | undefined;
      const dim1 = world.getComponent(entity1, ComponentTypes.Dimensions) as Dimensions | undefined;
      const col1 = world.getComponent(entity1, ComponentTypes.Collider) as Collider | undefined;
      
      if (!pos1 || !dim1 || !col1 || !col1.active) continue;
      
      for (let j = i + 1; j < entities.length; j++) {
        const entity2 = entities[j];
        if (entity2 === undefined) continue;
        
        const pos2 = world.getComponent(entity2, ComponentTypes.Position) as Position | undefined;
        const dim2 = world.getComponent(entity2, ComponentTypes.Dimensions) as Dimensions | undefined;
        const col2 = world.getComponent(entity2, ComponentTypes.Collider) as Collider | undefined;
        
        if (!pos2 || !dim2 || !col2 || !col2.active) continue;
        
        if (this.checkCollision(pos1, dim1, pos2, dim2)) {
          // Handle collision - emit event or apply physics
          this.handleCollision(world, entity1, entity2);
        }
      }
    }
  }
  
  private handleCollision(_world: World, _entity1: number, _entity2: number): void {
    // This will be customized per game
    // For Pong, we'll bounce the ball when it hits a paddle
  }
}