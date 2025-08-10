import { System, Entity, Transform2D, Velocity2D } from "@kenji-engine/core";
import { PongGameState, GAME_CONFIG } from "../PongGame";

export class PongScoringSystem extends System {
  public priority = 30; // After collision detection

  constructor(private gameState: PongGameState) {
    super();
  }

  getRelevantEntities(entities: Entity[]): Entity[] {
    // Get ball entity for scoring detection
    return entities.filter((entity) => entity.hasTag("ball"));
  }

  update(deltaTime: number, entities: Entity[]): void {
    // Only process scoring during gameplay
    if (this.gameState.gameState !== "playing") return;

    const ball = entities[0]; // Should only be one ball
    if (!ball) return;

    const ballTransform = ball.getComponent(Transform2D);
    const ballVelocity = ball.getComponent(Velocity2D);

    if (!ballTransform || !ballVelocity) return;

    // Check if ball went off the left side (Player 2 scores)
    if (ballTransform.x < -GAME_CONFIG.BALL_SIZE) {
      this.scorePoint("player2");
      this.resetBall(ball, ballTransform, ballVelocity, "left");
      return;
    }

    // Check if ball went off the right side (Player 1 scores)
    if (ballTransform.x > GAME_CONFIG.CANVAS_WIDTH) {
      this.scorePoint("player1");
      this.resetBall(ball, ballTransform, ballVelocity, "right");
      return;
    }
  }

  private scorePoint(player: "player1" | "player2"): void {
    // Update score
    if (player === "player1") {
      this.gameState.player1Score++;
      console.log(
        `🎯 Player 1 scores! Score: ${this.gameState.player1Score}-${this.gameState.player2Score}`
      );
    } else {
      this.gameState.player2Score++;
      console.log(
        `🎯 Player 2 scores! Score: ${this.gameState.player1Score}-${this.gameState.player2Score}`
      );
    }

    // Check for game over
    if (
      this.gameState.player1Score >= GAME_CONFIG.WINNING_SCORE ||
      this.gameState.player2Score >= GAME_CONFIG.WINNING_SCORE
    ) {
      this.endGame();
    }

    // Trigger scoring event for audio/UI
    this.triggerScoringEvent(player);
  }

  private resetBall(
    ball: Entity,
    ballTransform: Transform2D,
    ballVelocity: Velocity2D,
    scoringSide: "left" | "right"
  ): void {
    // Reset ball to center
    ballTransform.x = GAME_CONFIG.CANVAS_WIDTH / 2 - GAME_CONFIG.BALL_SIZE / 2;
    ballTransform.y = GAME_CONFIG.CANVAS_HEIGHT / 2 - GAME_CONFIG.BALL_SIZE / 2;

    // Brief pause before serving
    ballVelocity.x = 0;
    ballVelocity.y = 0;

    // Serve towards the player who didn't score (traditional Pong rule)
    setTimeout(() => {
      const direction = scoringSide === "left" ? -1 : 1; // Serve towards scorer
      ballVelocity.x = direction * GAME_CONFIG.BALL_SPEED;
      ballVelocity.y = (Math.random() - 0.5) * GAME_CONFIG.BALL_SPEED * 0.8;
    }, 1000); // 1 second pause
  }

  private endGame(): void {
    // Determine winner
    if (this.gameState.player1Score >= GAME_CONFIG.WINNING_SCORE) {
      this.gameState.winner = "player1";
      console.log("🏆 Player 1 wins!");
    } else {
      this.gameState.winner = "player2";
      console.log("🏆 Player 2 wins!");
    }

    // Change game state
    this.gameState.gameState = "gameOver";

    // Trigger game over event
    this.triggerGameOverEvent();
  }

  private triggerScoringEvent(player: "player1" | "player2"): void {
    const event = new CustomEvent("pongScore", {
      detail: {
        player,
        score1: this.gameState.player1Score,
        score2: this.gameState.player2Score,
      },
    });
    window.dispatchEvent(event);
  }

  private triggerGameOverEvent(): void {
    const event = new CustomEvent("pongGameOver", {
      detail: {
        winner: this.gameState.winner,
        finalScore: {
          player1: this.gameState.player1Score,
          player2: this.gameState.player2Score,
        },
      },
    });
    window.dispatchEvent(event);
  }
}
