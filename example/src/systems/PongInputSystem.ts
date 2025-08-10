import {
  System,
  Entity,
  Transform2D,
  Velocity2D,
  InputManager,
} from "@kenji-engine/core";
import { PongGameState, GAME_CONFIG } from "../PongGame";

export class PongInputSystem extends System {
  public priority = 10; // High priority for input handling

  constructor(
    private inputManager: InputManager,
    private gameState: PongGameState
  ) {
    super();
  }

  getRelevantEntities(entities: Entity[]): Entity[] {
    // Get paddle entities for input control
    return entities.filter(
      (entity) =>
        entity.hasTag("paddle") && entity.hasComponents(Transform2D, Velocity2D)
    );
  }

  update(deltaTime: number, entities: Entity[]): void {
    // Only process input during gameplay
    if (this.gameState.gameState !== "playing") {
      // Stop all paddle movement when not playing
      entities.forEach((entity) => {
        const velocity = entity.getComponent(Velocity2D);
        if (velocity) {
          velocity.y = 0;
        }
      });
      return;
    }

    // Find player paddles
    const player1Paddle = entities.find((entity) => entity.hasTag("player1"));
    const player2Paddle = entities.find((entity) => entity.hasTag("player2"));

    // Handle Player 1 input (W/S keys)
    if (player1Paddle) {
      this.handlePlayer1Input(player1Paddle);
    }

    // Handle Player 2 input (Arrow keys) - only if AI is disabled
    if (player2Paddle && !this.gameState.isAIEnabled) {
      this.handlePlayer2Input(player2Paddle);
    }
  }

  private handlePlayer1Input(paddle: Entity): void {
    const velocity = paddle.getComponent(Velocity2D);
    const transform = paddle.getComponent(Transform2D);

    if (!velocity || !transform) return;

    let moveY = 0;

    // W key - move up
    if (this.inputManager.isKeyPressed("KeyW")) {
      moveY = -GAME_CONFIG.PADDLE_SPEED;
    }

    // S key - move down
    if (this.inputManager.isKeyPressed("KeyS")) {
      moveY = GAME_CONFIG.PADDLE_SPEED;
    }

    // Apply movement with boundary checking
    velocity.y = moveY;

    // Prevent paddle from going out of bounds
    this.constrainPaddleMovement(transform, velocity);
  }

  private handlePlayer2Input(paddle: Entity): void {
    const velocity = paddle.getComponent(Velocity2D);
    const transform = paddle.getComponent(Transform2D);

    if (!velocity || !transform) return;

    let moveY = 0;

    // Arrow Up - move up
    if (this.inputManager.isKeyPressed("ArrowUp")) {
      moveY = -GAME_CONFIG.PADDLE_SPEED;
    }

    // Arrow Down - move down
    if (this.inputManager.isKeyPressed("ArrowDown")) {
      moveY = GAME_CONFIG.PADDLE_SPEED;
    }

    // Apply movement with boundary checking
    velocity.y = moveY;

    // Prevent paddle from going out of bounds
    this.constrainPaddleMovement(transform, velocity);
  }

  private constrainPaddleMovement(
    transform: Transform2D,
    velocity: Velocity2D
  ): void {
    const topBoundary = GAME_CONFIG.WALL_THICKNESS;
    const bottomBoundary =
      GAME_CONFIG.CANVAS_HEIGHT -
      GAME_CONFIG.WALL_THICKNESS -
      GAME_CONFIG.PADDLE_HEIGHT;

    // Check if paddle would go out of bounds and stop movement
    if (transform.y <= topBoundary && velocity.y < 0) {
      velocity.y = 0;
      transform.y = topBoundary;
    }

    if (transform.y >= bottomBoundary && velocity.y > 0) {
      velocity.y = 0;
      transform.y = bottomBoundary;
    }
  }
}
