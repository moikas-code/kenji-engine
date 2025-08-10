import { System } from '../ecs/System';
import { Entity } from '../ecs/Entity';
import { Transform2D } from '../components/Transform2D';
import { Collider2D } from '../components/Collider2D';

export class CollisionSystem extends System {
  requiredComponents = [Transform2D, Collider2D];
  private collisionCallbacks = new Map<string, (a: Entity, b: Entity) => void>();

  update(deltaTime: number, entities: Entity[]): void {
    // Basic O(n²) collision detection - optimize later with spatial partitioning
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const entityA = entities[i];
        const entityB = entities[j];
        
        if (this.checkCollision(entityA, entityB)) {
          this.handleCollision(entityA, entityB);
        }
      }
    }
  }

  private checkCollision(entityA: Entity, entityB: Entity): boolean {
    const transformA = entityA.getComponent(Transform2D)!;
    const colliderA = entityA.getComponent(Collider2D)!;
    const transformB = entityB.getComponent(Transform2D)!;
    const colliderB = entityB.getComponent(Collider2D)!;

    const boundsA = colliderA.getBounds(transformA);
    const boundsB = colliderB.getBounds(transformB);

    return boundsA.left < boundsB.right &&
           boundsA.right > boundsB.left &&
           boundsA.top < boundsB.bottom &&
           boundsA.bottom > boundsB.top;
  }

  private handleCollision(entityA: Entity, entityB: Entity): void {
    // Emit collision events or call registered callbacks
    const callbackKey = `${entityA.constructor.name}-${entityB.constructor.name}`;
    const callback = this.collisionCallbacks.get(callbackKey);
    if (callback) {
      callback(entityA, entityB);
    }
  }

  registerCollisionCallback(entityTypeA: string, entityTypeB: string, callback: (a: Entity, b: Entity) => void): void {
    const key = `${entityTypeA}-${entityTypeB}`;
    this.collisionCallbacks.set(key, callback);
  }
}