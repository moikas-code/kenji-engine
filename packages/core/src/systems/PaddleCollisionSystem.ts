import { System } from "../ecs/System";
import { Entity } from "../ecs/Entity";
import { Transform2D } from "../components/Transform2D";
import { Velocity2D } from "../components/Velocity2D";
import { Sprite2D } from "../components/Sprite2D";

export class PaddleCollisionSystem extends System {
  requiredComponents = [Transform2D, Sprite2D]; // Removed Velocity2D requirement

  constructor() {
    super();
    this.priority = 55; // Run after movement, before brick collision
  }

  update(_deltaTime: number, entities: Entity[]): void {
    // Get all entities, then filter by tags
    const allEntities = entities;
    const balls = allEntities.filter(
      (e) => e.hasTag("ball") && e.hasComponent(Velocity2D)
    );
    const paddles = allEntities.filter((e) => e.hasTag("paddle"));

    // Debug logging every few seconds
    if (Math.random() < 0.01) {
      // 1% chance per frame
      console.log(
        `🦇 PaddleCollision: ${balls.length} balls, ${paddles.length} paddles, ${allEntities.length} total entities`
      );
    }

    balls.forEach((ball) => {
      const ballTransform = ball.getComponent(Transform2D)!;
      const ballVelocity = ball.getComponent(Velocity2D)!;

      paddles.forEach((paddle) => {
        if (this.checkCollision(ball, paddle)) {
          // Calculate hit position for angle reflection
          const paddleTransform = paddle.getComponent(Transform2D)!;
          const paddleSprite = paddle.getComponent(Sprite2D)!;
          const ballSprite = ball.getComponent(Sprite2D)!;

          // Normalize hit position (-1 to 1) using center-based coordinates
          const hitPos =
            (ballTransform.x - paddleTransform.x) / (paddleSprite.width / 2);
          const clampedHitPos = Math.max(-1, Math.min(1, hitPos));

          // Calculate reflection angle (max 45 degrees for more predictable gameplay)
          const maxAngle = Math.PI / 4; // 45 degrees (reduced from 60)
          const angle = clampedHitPos * maxAngle;

          // Calculate new velocity maintaining speed but with minimum upward component
          const speed = Math.sqrt(
            ballVelocity.x * ballVelocity.x + ballVelocity.y * ballVelocity.y
          );

          // Ensure minimum upward velocity to prevent ball getting stuck
          const minUpwardSpeed = speed * 0.5; // At least 50% of speed goes upward

          ballVelocity.x = Math.sin(angle) * speed * 0.8; // Horizontal component
          ballVelocity.y = -Math.max(
            minUpwardSpeed,
            Math.abs(Math.cos(angle) * speed)
          ); // Always upward with minimum

          // Ensure ball doesn't get stuck in paddle (using center-based coordinates)
          ballTransform.y =
            paddleTransform.y - paddleSprite.height / 2 - ballSprite.height / 2;

          // Limit ball speed to prevent tunneling
          const maxSpeed = 400;
          const currentSpeed = Math.sqrt(
            ballVelocity.x * ballVelocity.x + ballVelocity.y * ballVelocity.y
          );
          if (currentSpeed > maxSpeed) {
            const scale = maxSpeed / currentSpeed;
            ballVelocity.x *= scale;
            ballVelocity.y *= scale;
          }

          console.log(
            `🦇 Paddle hit! Angle: ${((angle * 180) / Math.PI).toFixed(
              1
            )}° Hit pos: ${clampedHitPos.toFixed(2)} Speed: ${Math.round(
              currentSpeed
            )}`
          );
        }
      });
    });
  }

  private checkCollision(ball: Entity, paddle: Entity): boolean {
    const ballTransform = ball.getComponent(Transform2D)!;
    const ballSprite = ball.getComponent(Sprite2D)!;
    const paddleTransform = paddle.getComponent(Transform2D)!;
    const paddleSprite = paddle.getComponent(Sprite2D)!;

    // Check if ball is moving downward (to prevent multiple collisions)
    const ballVelocity = ball.getComponent(Velocity2D)!;
    if (ballVelocity.y <= 0) return false;

    // Convert center-based coordinates to bounds for AABB collision
    const ballLeft = ballTransform.x - ballSprite.width / 2;
    const ballRight = ballTransform.x + ballSprite.width / 2;
    const ballTop = ballTransform.y - ballSprite.height / 2;
    const ballBottom = ballTransform.y + ballSprite.height / 2;

    const paddleLeft = paddleTransform.x - paddleSprite.width / 2;
    const paddleRight = paddleTransform.x + paddleSprite.width / 2;
    const paddleTop = paddleTransform.y - paddleSprite.height / 2;
    const paddleBottom = paddleTransform.y + paddleSprite.height / 2;

    // AABB collision detection with center-based coordinates
    return (
      ballLeft < paddleRight &&
      ballRight > paddleLeft &&
      ballTop < paddleBottom &&
      ballBottom > paddleTop
    );
  }
}
