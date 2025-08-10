import { System } from "../ecs/System";
import { Entity } from "../ecs/Entity";
import { Transform2D } from "../components/Transform2D";
import { Velocity2D } from "../components/Velocity2D";
import { Sprite2D } from "../components/Sprite2D";

export class BrickCollisionSystem extends System {
  requiredComponents = [Transform2D, Sprite2D];

  constructor(private onBrickDestroyed?: (brick: Entity) => void) {
    super();
    this.priority = 60; // Run after movement but before rendering
  }

  update(_deltaTime: number, entities: Entity[]): void {
    // Get all entities, then filter by tags
    const allEntities = entities;
    const balls = allEntities.filter(
      (e) => e.hasTag("ball") && e.hasComponent(Velocity2D)
    );
    const bricks = allEntities.filter((e) => e.hasTag("brick") && e.active);

    // Debug logging to track collision issues
    if (Math.random() < 0.02) {
      console.log(
        `🦇 BrickCollision: ${balls.length} balls, ${bricks.length} active bricks`
      );

      if (balls.length > 0) {
        const ballTransform = balls[0].getComponent(Transform2D)!;
        const ballVelocity = balls[0].getComponent(Velocity2D)!;
        const ballSprite = balls[0].getComponent(Sprite2D)!;
        const speed = Math.sqrt(
          ballVelocity.x * ballVelocity.x + ballVelocity.y * ballVelocity.y
        );
        console.log(
          `🦇 Ball: pos(${Math.round(ballTransform.x)}, ${Math.round(
            ballTransform.y
          )}) vel(${Math.round(ballVelocity.x)}, ${Math.round(
            ballVelocity.y
          )}) speed=${Math.round(speed)} size(${ballSprite.width}x${
            ballSprite.height
          })`
        );

        // Check if ball is in brick area (y: 60-230 based on brick positions)
        if (ballTransform.y >= 60 && ballTransform.y <= 230) {
          console.log(
            `🦇 Ball is in BRICK ZONE! Testing collision with ${bricks.length} bricks...`
          );
        }
      }
    }

    balls.forEach((ball) => {
      const ballTransform = ball.getComponent(Transform2D)!;
      const ballVelocity = ball.getComponent(Velocity2D)!;
      const ballSprite = ball.getComponent(Sprite2D)!;

      // Track collisions to prevent multiple hits per frame
      let collisionThisFrame = false;

      bricks.forEach((brick) => {
        if (collisionThisFrame) return; // Only one collision per frame

        if (this.checkCollision(ball, brick)) {
          const brickTransform = brick.getComponent(Transform2D)!;
          const brickSprite = brick.getComponent(Sprite2D)!;

          // Calculate collision details for better physics
          const ballCenterX = ballTransform.x;
          const ballCenterY = ballTransform.y;
          const brickCenterX = brickTransform.x;
          const brickCenterY = brickTransform.y;

          // Determine collision side for better physics
          const deltaX = ballCenterX - brickCenterX;
          const deltaY = ballCenterY - brickCenterY;
          const overlapX =
            (ballSprite.width + brickSprite.width) / 2 - Math.abs(deltaX);
          const overlapY =
            (ballSprite.height + brickSprite.height) / 2 - Math.abs(deltaY);

          // Reflect based on smallest overlap (most likely collision side)
          if (overlapX < overlapY) {
            // Horizontal collision (left/right side of brick)
            ballVelocity.x *= -1;
            // Move ball out of brick
            ballTransform.x =
              brickCenterX +
              ((deltaX > 0 ? 1 : -1) * (brickSprite.width + ballSprite.width)) /
                2;
          } else {
            // Vertical collision (top/bottom of brick)
            ballVelocity.y *= -1;
            // Move ball out of brick
            ballTransform.y =
              brickCenterY +
              ((deltaY > 0 ? 1 : -1) *
                (brickSprite.height + ballSprite.height)) /
                2;
          }

          // Add some horizontal variation for more interesting gameplay
          const hitPos = (ballCenterX - brickCenterX) / (brickSprite.width / 2);
          const variation = hitPos * 30; // Reduced variation
          ballVelocity.x += variation;

          // Limit ball speed to prevent tunneling (increased for faster gameplay)
          const maxSpeed = 500;
          const currentSpeed = Math.sqrt(
            ballVelocity.x * ballVelocity.x + ballVelocity.y * ballVelocity.y
          );
          if (currentSpeed > maxSpeed) {
            const scale = maxSpeed / currentSpeed;
            ballVelocity.x *= scale;
            ballVelocity.y *= scale;
          }

          // Remove brick from world
          brick.active = false;
          this.onBrickDestroyed?.(brick);
          collisionThisFrame = true;

          console.log(
            `🦇 COLLISION! Brick at (${Math.round(brickCenterX)}, ${Math.round(
              brickCenterY
            )}) destroyed by ball at (${Math.round(ballCenterX)}, ${Math.round(
              ballCenterY
            )}). Overlap: X=${overlapX.toFixed(1)}, Y=${overlapY.toFixed(
              1
            )}. Speed: ${Math.round(currentSpeed)}`
          );
        }
      });
    });
  }

  private checkCollision(ball: Entity, brick: Entity): boolean {
    const ballTransform = ball.getComponent(Transform2D)!;
    const ballSprite = ball.getComponent(Sprite2D)!;
    const brickTransform = brick.getComponent(Transform2D)!;
    const brickSprite = brick.getComponent(Sprite2D)!;

    // Convert center-based coordinates to bounds for AABB collision
    const ballLeft = ballTransform.x - ballSprite.width / 2;
    const ballRight = ballTransform.x + ballSprite.width / 2;
    const ballTop = ballTransform.y - ballSprite.height / 2;
    const ballBottom = ballTransform.y + ballSprite.height / 2;

    const brickLeft = brickTransform.x - brickSprite.width / 2;
    const brickRight = brickTransform.x + brickSprite.width / 2;
    const brickTop = brickTransform.y - brickSprite.height / 2;
    const brickBottom = brickTransform.y + brickSprite.height / 2;

    // AABB collision detection with center-based coordinates
    const collision =
      ballLeft < brickRight &&
      ballRight > brickLeft &&
      ballTop < brickBottom &&
      ballBottom > brickTop;

    // Add some tolerance for edge cases
    if (collision) {
      const overlapX = Math.min(ballRight - brickLeft, brickRight - ballLeft);
      const overlapY = Math.min(ballBottom - brickTop, brickBottom - ballTop);

      // Only register collision if there's meaningful overlap (prevents edge case glitches)
      return overlapX > 0.1 && overlapY > 0.1;
    }

    return false;
  }
}
