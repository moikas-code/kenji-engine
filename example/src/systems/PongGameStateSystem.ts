import { System, Entity, InputManager } from "@kenji-ge/core";
import { PongGameState, PongGame } from "../PongGame";

export class PongGameStateSystem extends System {
  public priority = 5; // Very high priority for game state management

  constructor(
    private inputManager: InputManager,
    private gameState: PongGameState,
    private pongGame: PongGame
  ) {
    super();
  }

  getRelevantEntities(entities: Entity[]): Entity[] {
    // Game state system doesn't need entities
    return [];
  }

  update(deltaTime: number, entities: Entity[]): void {
    // Handle pause/unpause
    if (this.inputManager.isKeyPressed("Space")) {
      if (this.gameState.gameState === "playing") {
        this.gameState.gameState = "paused";
        console.log("⏸️ Game paused");
      } else if (this.gameState.gameState === "paused") {
        this.gameState.gameState = "playing";
        console.log("▶️ Game resumed");
      }
    }

    // Handle reset
    if (this.inputManager.isKeyPressed("KeyR")) {
      this.resetGame();
      console.log("🔄 Game reset");
    }

    // Handle start game
    if (this.inputManager.isKeyPressed("Enter")) {
      if (
        this.gameState.gameState === "menu" ||
        this.gameState.gameState === "gameOver"
      ) {
        this.startGame();
        console.log("🚀 Game started");
      }
    }

    // Handle AI toggle
    if (this.inputManager.isKeyPressed("KeyA")) {
      this.gameState.isAIEnabled = !this.gameState.isAIEnabled;
      console.log(
        `🤖 AI ${this.gameState.isAIEnabled ? "enabled" : "disabled"}`
      );
    }
  }

  private startGame(): void {
    this.gameState.gameState = "playing";
    this.pongGame.resetBall();
  }

  private resetGame(): void {
    this.gameState.player1Score = 0;
    this.gameState.player2Score = 0;
    this.gameState.winner = null;
    this.gameState.gameState = "playing";
    this.pongGame.resetBall();
    this.pongGame.resetPaddles();
  }
}
