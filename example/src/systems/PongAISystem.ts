import { System, Entity, Transform2D, Velocity2D } from "@kenji-engine/core";
import { PongGameState, GAME_CONFIG } from "../PongGame";

export class PongAISystem extends System {
  public priority = 15; // After input, before collision

  constructor(private gameState: PongGameState) {
    super();
  }

  getRelevantEntities(entities: Entity[]): Entity[] {
    // Get Player 2 paddle and ball for AI control
    return entities.filter(
      (entity) => entity.hasTag("player2") || entity.hasTag("ball")
    );
  }

  update(deltaTime: number, entities: Entity[]): void {
    // Only process AI during gameplay and when AI is enabled
    if (this.gameState.gameState !== "playing" || !this.gameState.isAIEnabled) {
      return;
    }

    const player2Paddle = entities.find((entity) => entity.hasTag("player2"));
    const ball = entities.find((entity) => entity.hasTag("ball"));

    if (!player2Paddle || !ball) return;

    const paddleTransform = player2Paddle.getComponent(Transform2D);
    const paddleVelocity = player2Paddle.getComponent(Velocity2D);
    const ballTransform = ball.getComponent(Transform2D);
    const ballVelocity = ball.getComponent(Velocity2D);

    if (
      !paddleTransform ||
      !paddleVelocity ||
      !ballTransform ||
      !ballVelocity
    ) {
      return;
    }

    // AI logic: Move paddle towards ball with some imperfection
    this.updateAIPaddle(
      paddleTransform,
      paddleVelocity,
      ballTransform,
      ballVelocity,
      deltaTime
    );
  }

  private updateAIPaddle(
    paddleTransform: Transform2D,
    paddleVelocity: Velocity2D,
    ballTransform: Transform2D,
    ballVelocity: Velocity2D,
    deltaTime: number
  ): void {
    // Calculate paddle center and ball center
    const paddleCenter = paddleTransform.y + GAME_CONFIG.PADDLE_HEIGHT / 2;
    const ballCenter = ballTransform.y + GAME_CONFIG.BALL_SIZE / 2;

    // Predict where the ball will be when it reaches the paddle
    const predictedBallY = this.predictBallPosition(
      ballTransform,
      ballVelocity,
      paddleTransform.x
    );

    // Use predicted position for better AI
    const targetY = predictedBallY - GAME_CONFIG.PADDLE_HEIGHT / 2;
    const currentY = paddleTransform.y;

    // Calculate desired movement
    const difference = targetY - currentY;
    const deadZone = 5; // Pixels of "good enough" positioning

    // Add some imperfection based on difficulty setting
    const imperfection = this.addAIImperfection(difference);
    const adjustedDifference = difference + imperfection;

    // Determine movement direction
    let moveDirection = 0;
    if (Math.abs(adjustedDifference) > deadZone) {
      moveDirection = adjustedDifference > 0 ? 1 : -1;
    }

    // Apply movement with speed scaling based on distance
    const distanceScale = Math.min(Math.abs(adjustedDifference) / 50, 1);
    const aiSpeed = GAME_CONFIG.PADDLE_SPEED * 0.8 * distanceScale; // Slightly slower than player

    paddleVelocity.y = moveDirection * aiSpeed;

    // Apply boundary constraints
    this.constrainAIPaddleMovement(paddleTransform, paddleVelocity);
  }

  private predictBallPosition(
    ballTransform: Transform2D,
    ballVelocity: Velocity2D,
    paddleX: number
  ): number {
    // Only predict if ball is moving towards the AI paddle
    if (ballVelocity.x <= 0) {
      return ballTransform.y + GAME_CONFIG.BALL_SIZE / 2;
    }

    // Calculate time for ball to reach paddle X position
    const timeToReach = (paddleX - ballTransform.x) / ballVelocity.x;

    // Predict Y position (accounting for wall bounces)
    let predictedY = ballTransform.y + ballVelocity.y * timeToReach;

    // Simple wall bounce prediction
    const topWall = GAME_CONFIG.WALL_THICKNESS;
    const bottomWall =
      GAME_CONFIG.CANVAS_HEIGHT -
      GAME_CONFIG.WALL_THICKNESS -
      GAME_CONFIG.BALL_SIZE;

    // Handle bounces (simplified - assumes one bounce max)
    if (predictedY < topWall) {
      predictedY = topWall + (topWall - predictedY);
    } else if (predictedY > bottomWall) {
      predictedY = bottomWall - (predictedY - bottomWall);
    }

    return predictedY + GAME_CONFIG.BALL_SIZE / 2;
  }

  private addAIImperfection(difference: number): number {
    // Add random imperfection based on AI difficulty
    // Lower difficulty = more imperfection
    const imperfectionFactor = 1 - GAME_CONFIG.AI_DIFFICULTY;
    const maxImperfection = 30 * imperfectionFactor;

    // Add some randomness
    const randomImperfection = (Math.random() - 0.5) * maxImperfection;

    // Add reaction delay simulation
    const reactionDelay =
      Math.sin(Date.now() * 0.001) * 10 * imperfectionFactor;

    return randomImperfection + reactionDelay;
  }

  private constrainAIPaddleMovement(
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
