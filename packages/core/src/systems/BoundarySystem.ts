import { System } from "../ecs/System";
import { Entity } from "../ecs/Entity";
import { Transform2D } from "../components/Transform2D";
import { Velocity2D } from "../components/Velocity2D";
import { Sprite2D } from "../components/Sprite2D";

export class BoundarySystem extends System {
  requiredComponents = [Transform2D, Velocity2D, Sprite2D];

  constructor(
    private canvasWidth: number,
    private canvasHeight: number,
    private bounceSound?: () => void
  ) {
    super();
    this.priority = 50; // Run after movement but before rendering
  }

  update(deltaTime: number, entities: Entity[]): void {
    entities.forEach((entity) => {
      const transform = entity.getComponent(Transform2D)!;
      const velocity = entity.getComponent(Velocity2D)!;
      const sprite = entity.getComponent(Sprite2D)!;

      const halfWidth = sprite.width / 2;
      const halfHeight = sprite.height / 2;
      let bounced = false;

      // Left boundary
      if (transform.x - halfWidth <= 0) {
        transform.x = halfWidth;
        if (velocity.x < 0) {
          // Only reverse if moving left
          velocity.x = -velocity.x;
          bounced = true;
        }
      }

      // Right boundary
      if (transform.x + halfWidth >= this.canvasWidth) {
        transform.x = this.canvasWidth - halfWidth;
        if (velocity.x > 0) {
          // Only reverse if moving right
          velocity.x = -velocity.x;
          bounced = true;
        }
      }

      // Top boundary
      if (transform.y - halfHeight <= 0) {
        transform.y = halfHeight;
        if (velocity.y < 0) {
          // Only reverse if moving up
          velocity.y = -velocity.y;
          bounced = true;
        }
      }

      // Bottom boundary
      if (transform.y + halfHeight >= this.canvasHeight) {
        transform.y = this.canvasHeight - halfHeight;
        if (velocity.y > 0) {
          // Only reverse if moving down
          velocity.y = -velocity.y;
          bounced = true;
        }
      }

      // Always ensure minimum speed to prevent getting stuck
      const currentSpeed = Math.sqrt(
        velocity.x * velocity.x + velocity.y * velocity.y
      );
      const minSpeed = 100; // Minimum speed

      // Handle very low speed or zero velocity
      if (currentSpeed < minSpeed) {
        if (currentSpeed > 0) {
          // Scale up existing velocity
          const scale = minSpeed / currentSpeed;
          velocity.x *= scale;
          velocity.y *= scale;
        } else {
          // Generate new random velocity for zero velocity case
          const angle = Math.random() * Math.PI * 2;
          velocity.x = Math.cos(angle) * minSpeed;
          velocity.y = Math.sin(angle) * minSpeed;
        }
      }

      if (bounced) {
        this.bounceSound?.();
      }
    });
  }
}
