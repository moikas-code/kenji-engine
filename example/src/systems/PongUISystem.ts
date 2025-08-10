import { System, Entity } from "@kenji-engine/core";
import { PongGameState, GAME_CONFIG } from "../PongGame";

export class PongUISystem extends System {
  public priority = 100; // Render UI last

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(private gameState: PongGameState) {
    super();
    this.canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d")!;
  }

  getRelevantEntities(entities: Entity[]): Entity[] {
    // UI system doesn't need entities, it renders based on game state
    return [];
  }

  update(deltaTime: number, entities: Entity[]): void {
    this.renderUI();
  }

  private renderUI(): void {
    // Set up text rendering
    this.ctx.fillStyle = "#00ff41";
    this.ctx.textAlign = "center";
    this.ctx.font = "bold 24px 'Courier New', monospace";

    // Render different UI based on game state
    switch (this.gameState.gameState) {
      case "menu":
        this.renderMenuScreen();
        break;
      case "playing":
        this.renderGameplayUI();
        break;
      case "paused":
        this.renderPausedScreen();
        break;
      case "gameOver":
        this.renderGameOverScreen();
        break;
    }
  }

  private renderMenuScreen(): void {
    const centerX = GAME_CONFIG.CANVAS_WIDTH / 2;
    const centerY = GAME_CONFIG.CANVAS_HEIGHT / 2;

    // Title
    this.ctx.font = "bold 48px 'Courier New', monospace";
    this.ctx.fillStyle = "#00ff41";
    this.ctx.fillText("KENJI PONG", centerX, centerY - 80);

    // Subtitle
    this.ctx.font = "bold 16px 'Courier New', monospace";
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillText("Classic Pong with AI", centerX, centerY - 50);

    // Instructions
    this.ctx.font = "14px 'Courier New', monospace";
    this.ctx.fillStyle = "#cccccc";
    this.ctx.fillText("Press ENTER to Start", centerX, centerY);
    this.ctx.fillText("Player 1: W/S Keys", centerX, centerY + 25);
    this.ctx.fillText("Player 2: Arrow Keys (or AI)", centerX, centerY + 45);
    this.ctx.fillText("Press A to toggle AI", centerX, centerY + 65);
    this.ctx.fillText(
      "Press R to reset • SPACE to pause",
      centerX,
      centerY + 85
    );

    // AI status
    const aiStatus = this.gameState.isAIEnabled ? "AI: ON" : "AI: OFF";
    this.ctx.fillStyle = this.gameState.isAIEnabled ? "#00ff41" : "#ff4444";
    this.ctx.fillText(aiStatus, centerX, centerY + 110);
  }

  private renderGameplayUI(): void {
    // Score display
    this.renderScore();

    // Game info
    this.renderGameInfo();
  }

  private renderPausedScreen(): void {
    // Render normal gameplay UI
    this.renderGameplayUI();

    // Pause overlay
    const centerX = GAME_CONFIG.CANVAS_WIDTH / 2;
    const centerY = GAME_CONFIG.CANVAS_HEIGHT / 2;

    // Semi-transparent overlay
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(
      0,
      0,
      GAME_CONFIG.CANVAS_WIDTH,
      GAME_CONFIG.CANVAS_HEIGHT
    );

    // Pause text
    this.ctx.font = "bold 36px 'Courier New', monospace";
    this.ctx.fillStyle = "#00ff41";
    this.ctx.fillText("PAUSED", centerX, centerY - 20);

    this.ctx.font = "16px 'Courier New', monospace";
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillText("Press SPACE to continue", centerX, centerY + 20);
  }

  private renderGameOverScreen(): void {
    const centerX = GAME_CONFIG.CANVAS_WIDTH / 2;
    const centerY = GAME_CONFIG.CANVAS_HEIGHT / 2;

    // Semi-transparent overlay
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    this.ctx.fillRect(
      0,
      0,
      GAME_CONFIG.CANVAS_WIDTH,
      GAME_CONFIG.CANVAS_HEIGHT
    );

    // Game Over title
    this.ctx.font = "bold 36px 'Courier New', monospace";
    this.ctx.fillStyle = "#ff4444";
    this.ctx.fillText("GAME OVER", centerX, centerY - 60);

    // Winner announcement
    const winnerText =
      this.gameState.winner === "player1" ? "PLAYER 1 WINS!" : "PLAYER 2 WINS!";
    this.ctx.font = "bold 24px 'Courier New', monospace";
    this.ctx.fillStyle = "#00ff41";
    this.ctx.fillText(winnerText, centerX, centerY - 20);

    // Final score
    const scoreText = `${this.gameState.player1Score} - ${this.gameState.player2Score}`;
    this.ctx.font = "bold 32px 'Courier New', monospace";
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillText(scoreText, centerX, centerY + 20);

    // Instructions
    this.ctx.font = "16px 'Courier New', monospace";
    this.ctx.fillStyle = "#cccccc";
    this.ctx.fillText("Press ENTER to play again", centerX, centerY + 60);
    this.ctx.fillText("Press R to reset scores", centerX, centerY + 80);
  }

  private renderScore(): void {
    // Player 1 score (left side)
    this.ctx.font = "bold 48px 'Courier New', monospace";
    this.ctx.fillStyle = "#ffffff";
    this.ctx.textAlign = "center";

    const leftScoreX = GAME_CONFIG.CANVAS_WIDTH / 4;
    const rightScoreX = (GAME_CONFIG.CANVAS_WIDTH * 3) / 4;
    const scoreY = 60;

    this.ctx.fillText(
      this.gameState.player1Score.toString(),
      leftScoreX,
      scoreY
    );
    this.ctx.fillText(
      this.gameState.player2Score.toString(),
      rightScoreX,
      scoreY
    );

    // Score separator
    this.ctx.font = "bold 24px 'Courier New', monospace";
    this.ctx.fillStyle = "#666666";
    this.ctx.fillText("-", GAME_CONFIG.CANVAS_WIDTH / 2, scoreY);
  }

  private renderGameInfo(): void {
    // Game info at the top
    this.ctx.font = "12px 'Courier New', monospace";
    this.ctx.fillStyle = "#888888";
    this.ctx.textAlign = "left";

    // AI status
    const aiStatus = this.gameState.isAIEnabled ? "AI: ON" : "AI: OFF";
    this.ctx.fillText(aiStatus, 10, 20);

    // Controls reminder
    this.ctx.textAlign = "right";
    this.ctx.fillText(
      "SPACE: Pause • R: Reset • A: Toggle AI",
      GAME_CONFIG.CANVAS_WIDTH - 10,
      20
    );

    // Winning score indicator
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      `First to ${GAME_CONFIG.WINNING_SCORE}`,
      GAME_CONFIG.CANVAS_WIDTH / 2,
      GAME_CONFIG.CANVAS_HEIGHT - 10
    );
  }
}
