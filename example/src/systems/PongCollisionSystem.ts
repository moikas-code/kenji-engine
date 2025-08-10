import {
  System,
  Entity,
  Transform2D,
  Velocity2D,
  Collider2D,
} from "@kenji-engine/core";
import { PongGameState, GAME_CONFIG } from "../PongGame";

export class PongCollisionSystem extends System {
  public priority = 20; // After input, before scoring

  constructor(private gameState: PongGameState) {
    super();
  }

  getRelevantEntities(entities: Entity[]): Entity[] {
    // Get all entities with collision components
    return entities.filter((entity) =>
      entity.hasComponents(Transform2D, Collider2D)
    );
  }

  update(deltaTime: number, entities: Entity[]): void {
    // Only process collisions during gameplay
    if (this.gameState.gameState !== "playing") return;

    // Find the ball
    const ball = entities.find((entity) => entity.hasTag("ball"));
    if (!ball) return;

    const ballTransform = ball.getComponent(Transform2D);
    const ballVelocity = ball.getComponent(Velocity2D);
    const ballCollider = ball.getComponent(Collider2D);

    if (!ballTransform || !ballVelocity || !ballCollider) return;

    // Check collisions with walls
    this.checkWallCollisions(ball, ballTransform, ballVelocity, entities);

    // Check collisions with paddles
    this.checkPaddleCollisions(
      ball,
      ballTransform,
      ballVelocity,
      ballCollider,
      entities
    );
  }

  private checkWallCollisions(
    ball: Entity,
    ballTransform: Transform2D,
    ballVelocity: Velocity2D,
    entities: Entity[]
  ): void {
    // Top wall collision
    if (ballTransform.y <= GAME_CONFIG.WALL_THICKNESS) {
      ballTransform.y = GAME_CONFIG.WALL_THICKNESS;
      ballVelocity.y = Math.abs(ballVelocity.y); // Bounce down
      this.addBounceEffect(ballVelocity);
      this.triggerCollisionEvent("wall");
    }

    // Bottom wall collision
    const bottomBoundary =
      GAME_CONFIG.CANVAS_HEIGHT -
      GAME_CONFIG.WALL_THICKNESS -
      GAME_CONFIG.BALL_SIZE;
    if (ballTransform.y >= bottomBoundary) {
      ballTransform.y = bottomBoundary;
      ballVelocity.y = -Math.abs(ballVelocity.y); // Bounce up
      this.addBounceEffect(ballVelocity);
      this.triggerCollisionEvent("wall");
    }
  }

  private checkPaddleCollisions(
    ball: Entity,
    ballTransform: Transform2D,
    ballVelocity: Velocity2D,
    ballCollider: Collider2D,
    entities: Entity[]
  ): void {
    const paddles = entities.filter((entity) => entity.hasTag("paddle"));

    for (const paddle of paddles) {
      const paddleTransform = paddle.getComponent(Transform2D);
      const paddleCollider = paddle.getComponent(Collider2D);

      if (!paddleTransform || !paddleCollider) continue;

      // Check for collision using AABB (Axis-Aligned Bounding Box)
      if (
        this.checkAABBCollision(
          ballTransform,
          ballCollider,
          paddleTransform,
          paddleCollider
        )
      ) {
        this.handlePaddleCollision(
          ball,
          ballTransform,
          ballVelocity,
          paddle,
          paddleTransform
        );
        break; // Only handle one collision per frame
      }
    }
  }

  private checkAABBCollision(
    transform1: Transform2D,
    collider1: Collider2D,
    transform2: Transform2D,
    collider2: Collider2D
  ): boolean {
    return (
      transform1.x < transform2.x + collider2.width &&
      transform1.x + collider1.width > transform2.x &&
      transform1.y < transform2.y + collider2.height &&
      transform1.y + collider1.height > transform2.y
    );
  }

  private handlePaddleCollision(
    ball: Entity,
    ballTransform: Transform2D,
    ballVelocity: Velocity2D,
    paddle: Entity,
    paddleTransform: Transform2D
  ): void {
    // Calculate collision point relative to paddle center
    const paddleCenter = paddleTransform.y + GAME_CONFIG.PADDLE_HEIGHT / 2;
    const ballCenter = ballTransform.y + GAME_CONFIG.BALL_SIZE / 2;
    const relativeIntersectY = ballCenter - paddleCenter;

    // Normalize the intersection (-1 to 1)
    const normalizedIntersectY =
      relativeIntersectY / (GAME_CONFIG.PADDLE_HEIGHT / 2);

    // Calculate bounce angle (max 60 degrees)
    const bounceAngle = (normalizedIntersectY * Math.PI) / 3; // 60 degrees in radians

    // Determine direction based on which paddle was hit
    const direction = paddle.hasTag("player1") ? 1 : -1;

    // Apply new velocity with angle
    const speed = Math.sqrt(
      ballVelocity.x * ballVelocity.x + ballVelocity.y * ballVelocity.y
    );
    ballVelocity.x = direction * speed * Math.cos(bounceAngle);
    ballVelocity.y = speed * Math.sin(bounceAngle);

    // Ensure minimum horizontal speed
    const minSpeed = GAME_CONFIG.BALL_SPEED * 0.7;
    if (Math.abs(ballVelocity.x) < minSpeed) {
      ballVelocity.x = direction * minSpeed;
    }

    // Move ball away from paddle to prevent sticking
    if (paddle.hasTag("player1")) {
      ballTransform.x = paddleTransform.x + GAME_CONFIG.PADDLE_WIDTH + 1;
    } else {
      ballTransform.x = paddleTransform.x - GAME_CONFIG.BALL_SIZE - 1;
    }

    // Add slight speed increase for excitement
    this.addBounceEffect(ballVelocity);
    this.triggerCollisionEvent("paddle");
  }

  private addBounceEffect(velocity: Velocity2D): void {
    // Slightly increase speed with each bounce (max 1.5x original speed)
    const currentSpeed = Math.sqrt(
      velocity.x * velocity.x + velocity.y * velocity.y
    );
    const maxSpeed = GAME_CONFIG.BALL_SPEED * 1.5;

    if (currentSpeed < maxSpeed) {
      const speedMultiplier = 1.02; // 2% speed increase
      velocity.x *= speedMultiplier;
      velocity.y *= speedMultiplier;
    }
  }

  private triggerCollisionEvent(type: "wall" | "paddle"): void {
    // Dispatch custom event for audio system
    const event = new CustomEvent("pongCollision", {
      detail: { type },
    });
    window.dispatchEvent(event);
  }
}
