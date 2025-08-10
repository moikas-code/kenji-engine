import { System } from "../ecs/System";
import { Entity } from "../ecs/Entity";
import { Transform2D } from "../components/Transform2D";
import { Velocity2D } from "../components/Velocity2D";

export class GameStateSystem extends System {
  requiredComponents = [Transform2D];
  private ballLostTriggered = false;
  private gameWonTriggered = false;
  private lastBallLostFrame = -1;
  private lastGameWonFrame = -1;
  private frameCounter = 0;

  constructor(
    private canvasHeight: number,
    private onBallLost?: () => void,
    private onGameWon?: () => void
  ) {
    super();
    this.priority = 70; // Run last to check game state
  }

  update(_deltaTime: number, entities: Entity[]): void {
    this.frameCounter++;

    const balls = entities.filter(
      (e) => e.hasTag("ball") && e.active && e.hasComponent(Transform2D)
    );
    const bricks = entities.filter((e) => e.hasTag("brick") && e.active);

    // Reset flags if ball is back on screen
    const ballOnScreen = balls.some((ball) => {
      const transform = ball.getComponent(Transform2D);
      return transform && transform.y <= this.canvasHeight + 50;
    });

    if (ballOnScreen) {
      this.ballLostTriggered = false;
    }

    // Reset game won flag if bricks exist
    if (bricks.length > 0) {
      this.gameWonTriggered = false;
    }

    // Check for ball going off bottom (prevent spam but allow multiple legitimate triggers)
    if (
      !this.ballLostTriggered ||
      this.frameCounter - this.lastBallLostFrame > 60
    ) {
      balls.forEach((ball) => {
        const transform = ball.getComponent(Transform2D);
        if (transform && transform.y > this.canvasHeight + 50) {
          console.log("🦇 Ball lost! Game Over!");
          this.ballLostTriggered = true;
          this.lastBallLostFrame = this.frameCounter;
          this.onBallLost?.();
        }
      });
    }

    // Check win condition - no active bricks left (prevent spam but allow multiple legitimate triggers)
    if (
      (!this.gameWonTriggered ||
        this.frameCounter - this.lastGameWonFrame > 60) &&
      bricks.length === 0
    ) {
      console.log("🦇 All bricks destroyed! Victory!");
      this.gameWonTriggered = true;
      this.lastGameWonFrame = this.frameCounter;
      this.onGameWon?.();
    }
  }

  resetBall(ball: Entity, paddle: Entity): void {
    const ballTransform = ball.getComponent(Transform2D);
    const ballVelocity = ball.getComponent(Velocity2D);
    const paddleTransform = paddle.getComponent(Transform2D);

    if (!ballTransform || !ballVelocity || !paddleTransform) {
      console.warn("🦇 Cannot reset ball: missing required components");
      return;
    }

    // Reset ball position above paddle
    ballTransform.x = paddleTransform.x;
    ballTransform.y = paddleTransform.y - 50;

    // Reset ball velocity
    ballVelocity.x = 100 + Math.random() * 100 - 50; // Random horizontal
    ballVelocity.y = -200; // Upward

    ball.active = true;

    // Reset flags when ball is reset
    this.ballLostTriggered = false;
    this.gameWonTriggered = false;
    this.lastBallLostFrame = -1;
    this.lastGameWonFrame = -1;

    console.log("🦇 Ball reset!");
  }
}
