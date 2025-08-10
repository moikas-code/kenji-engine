import { System } from "../ecs/System";
import { Entity } from "../ecs/Entity";
import { Transform2D } from "../components/Transform2D";
import { UIText } from "../components/UIText";
import { UIButton } from "../components/UIButton";
import { UIPanel } from "../components/UIPanel";
import { GameState, GameStateType } from "../components/GameState";

export class GameScreenSystem extends System {
  requiredComponents = [GameState];
  private canvas: HTMLCanvasElement;
  private screenEntities: Map<GameStateType, Entity[]> = new Map();

  // Callbacks for game actions
  public onStartGame?: () => void;
  public onRestartGame?: () => void;
  public onResumeGame?: () => void;
  public onPauseGame?: () => void;
  public onQuitGame?: () => void;

  constructor(canvas: HTMLCanvasElement) {
    super();
    this.canvas = canvas;
    this.priority = 80; // Run before UI rendering
    this.initializeScreens();
  }

  update(_deltaTime: number, entities: Entity[]): void {
    const gameStateEntity = entities.find(
      (entity) => entity.active && entity.hasComponent(GameState)
    );

    if (!gameStateEntity) return;

    const gameState = gameStateEntity.getComponent(GameState)!;
    const currentState = gameState.currentState;

    // Hide all screen entities first
    this.screenEntities.forEach((screenEntities) => {
      screenEntities.forEach((entity) => (entity.active = false));
    });

    // Show entities for current state
    const currentScreenEntities = this.screenEntities.get(currentState);
    if (currentScreenEntities) {
      currentScreenEntities.forEach((entity) => (entity.active = true));

      // Update dynamic content
      this.updateScreenContent(currentState, gameState);
    }
  }

  private initializeScreens(): void {
    this.createMenuScreen();
    this.createGameOverScreen();
    this.createVictoryScreen();
    this.createPauseScreen();
    this.createHUD();
  }

  private createMenuScreen(): void {
    const entities: Entity[] = [];

    // Background panel
    const background = new Entity()
      .addComponent(new Transform2D(0, 0))
      .addComponent(
        new UIPanel(this.canvas.width, this.canvas.height, {
          backgroundColor: "#000033",
          opacity: 0.9,
        })
      );
    entities.push(background);

    // Title
    const title = new Entity()
      .addComponent(new Transform2D(this.canvas.width / 2, 150))
      .addComponent(
        new UIText("BREAKOUT", {
          fontSize: 48,
          color: "#FFFFFF",
          textAlign: "center",
          strokeColor: "#00FFFF",
          strokeWidth: 2,
          shadow: {
            color: "#000000",
            offsetX: 3,
            offsetY: 3,
            blur: 5,
          },
        })
      );
    entities.push(title);

    // Start button
    const startButton = new Entity()
      .addComponent(new Transform2D(this.canvas.width / 2 - 100, 300))
      .addComponent(
        new UIButton(
          "START GAME",
          200,
          50,
          {
            fontSize: 20,
            color: "#FFFFFF",
          },
          {
            backgroundColor: "#006600",
            hoverBackgroundColor: "#008800",
            pressedBackgroundColor: "#004400",
            borderColor: "#00FF00",
            borderWidth: 2,
            borderRadius: 8,
          }
        )
      );

    const startButtonComponent = startButton.getComponent(UIButton)!;
    startButtonComponent.onClick = () => {
      this.onStartGame?.();
    };
    entities.push(startButton);

    // Instructions
    const instructions = new Entity()
      .addComponent(new Transform2D(this.canvas.width / 2, 450))
      .addComponent(
        new UIText(
          "Use ARROW KEYS or A/D to move paddle\nSPACE to regenerate sprites\nR to reset ball",
          {
            fontSize: 16,
            color: "#CCCCCC",
            textAlign: "center",
          }
        )
      );
    entities.push(instructions);

    this.screenEntities.set("menu", entities);
  }

  private createGameOverScreen(): void {
    const entities: Entity[] = [];

    // Semi-transparent background
    const background = new Entity()
      .addComponent(new Transform2D(0, 0))
      .addComponent(
        new UIPanel(this.canvas.width, this.canvas.height, {
          backgroundColor: "#000000",
          opacity: 0.7,
        })
      );
    entities.push(background);

    // Game Over panel
    const panel = new Entity()
      .addComponent(
        new Transform2D(
          this.canvas.width / 2 - 200,
          this.canvas.height / 2 - 150
        )
      )
      .addComponent(
        new UIPanel(400, 300, {
          backgroundColor: "#330000",
          borderColor: "#FF0000",
          borderWidth: 3,
          borderRadius: 10,
          opacity: 0.95,
        })
      );
    entities.push(panel);

    // Game Over title
    const title = new Entity()
      .addComponent(
        new Transform2D(this.canvas.width / 2, this.canvas.height / 2 - 80)
      )
      .addComponent(
        new UIText("GAME OVER", {
          fontSize: 36,
          color: "#FF0000",
          textAlign: "center",
          strokeColor: "#FFFFFF",
          strokeWidth: 1,
        })
      );
    entities.push(title);

    // Score display
    const scoreText = new Entity()
      .addComponent(
        new Transform2D(this.canvas.width / 2, this.canvas.height / 2 - 20)
      )
      .addComponent(
        new UIText("Score: 0", {
          fontSize: 24,
          color: "#FFFFFF",
          textAlign: "center",
        })
      )
      .addTag("gameOverScore");
    entities.push(scoreText);

    // High score display
    const highScoreText = new Entity()
      .addComponent(
        new Transform2D(this.canvas.width / 2, this.canvas.height / 2 + 10)
      )
      .addComponent(
        new UIText("High Score: 0", {
          fontSize: 18,
          color: "#FFFF00",
          textAlign: "center",
        })
      )
      .addTag("gameOverHighScore");
    entities.push(highScoreText);

    // Restart button
    const restartButton = new Entity()
      .addComponent(
        new Transform2D(this.canvas.width / 2 - 80, this.canvas.height / 2 + 50)
      )
      .addComponent(
        new UIButton(
          "RESTART",
          160,
          40,
          {
            fontSize: 18,
            color: "#FFFFFF",
          },
          {
            backgroundColor: "#006600",
            hoverBackgroundColor: "#008800",
            pressedBackgroundColor: "#004400",
            borderColor: "#00FF00",
            borderWidth: 2,
            borderRadius: 6,
          }
        )
      );

    const restartButtonComponent = restartButton.getComponent(UIButton)!;
    restartButtonComponent.onClick = () => {
      this.onRestartGame?.();
    };
    entities.push(restartButton);

    this.screenEntities.set("gameOver", entities);
  }

  private createVictoryScreen(): void {
    const entities: Entity[] = [];

    // Semi-transparent background
    const background = new Entity()
      .addComponent(new Transform2D(0, 0))
      .addComponent(
        new UIPanel(this.canvas.width, this.canvas.height, {
          backgroundColor: "#000000",
          opacity: 0.7,
        })
      );
    entities.push(background);

    // Victory panel
    const panel = new Entity()
      .addComponent(
        new Transform2D(
          this.canvas.width / 2 - 200,
          this.canvas.height / 2 - 150
        )
      )
      .addComponent(
        new UIPanel(400, 300, {
          backgroundColor: "#003300",
          borderColor: "#00FF00",
          borderWidth: 3,
          borderRadius: 10,
          opacity: 0.95,
        })
      );
    entities.push(panel);

    // Victory title
    const title = new Entity()
      .addComponent(
        new Transform2D(this.canvas.width / 2, this.canvas.height / 2 - 80)
      )
      .addComponent(
        new UIText("VICTORY!", {
          fontSize: 36,
          color: "#00FF00",
          textAlign: "center",
          strokeColor: "#FFFFFF",
          strokeWidth: 1,
          shadow: {
            color: "#000000",
            offsetX: 2,
            offsetY: 2,
            blur: 3,
          },
        })
      );
    entities.push(title);

    // Score display
    const scoreText = new Entity()
      .addComponent(
        new Transform2D(this.canvas.width / 2, this.canvas.height / 2 - 20)
      )
      .addComponent(
        new UIText("Final Score: 0", {
          fontSize: 24,
          color: "#FFFFFF",
          textAlign: "center",
        })
      )
      .addTag("victoryScore");
    entities.push(scoreText);

    // High score display
    const highScoreText = new Entity()
      .addComponent(
        new Transform2D(this.canvas.width / 2, this.canvas.height / 2 + 10)
      )
      .addComponent(
        new UIText("High Score: 0", {
          fontSize: 18,
          color: "#FFFF00",
          textAlign: "center",
        })
      )
      .addTag("victoryHighScore");
    entities.push(highScoreText);

    // Play again button
    const playAgainButton = new Entity()
      .addComponent(
        new Transform2D(this.canvas.width / 2 - 80, this.canvas.height / 2 + 50)
      )
      .addComponent(
        new UIButton(
          "PLAY AGAIN",
          160,
          40,
          {
            fontSize: 18,
            color: "#FFFFFF",
          },
          {
            backgroundColor: "#006600",
            hoverBackgroundColor: "#008800",
            pressedBackgroundColor: "#004400",
            borderColor: "#00FF00",
            borderWidth: 2,
            borderRadius: 6,
          }
        )
      );

    const playAgainButtonComponent = playAgainButton.getComponent(UIButton)!;
    playAgainButtonComponent.onClick = () => {
      this.onRestartGame?.();
    };
    entities.push(playAgainButton);

    this.screenEntities.set("victory", entities);
  }

  private createPauseScreen(): void {
    const entities: Entity[] = [];

    // Semi-transparent background
    const background = new Entity()
      .addComponent(new Transform2D(0, 0))
      .addComponent(
        new UIPanel(this.canvas.width, this.canvas.height, {
          backgroundColor: "#000000",
          opacity: 0.5,
        })
      );
    entities.push(background);

    // Pause panel
    const panel = new Entity()
      .addComponent(
        new Transform2D(
          this.canvas.width / 2 - 150,
          this.canvas.height / 2 - 100
        )
      )
      .addComponent(
        new UIPanel(300, 200, {
          backgroundColor: "#333333",
          borderColor: "#FFFFFF",
          borderWidth: 2,
          borderRadius: 8,
          opacity: 0.9,
        })
      );
    entities.push(panel);

    // Pause title
    const title = new Entity()
      .addComponent(
        new Transform2D(this.canvas.width / 2, this.canvas.height / 2 - 50)
      )
      .addComponent(
        new UIText("PAUSED", {
          fontSize: 32,
          color: "#FFFFFF",
          textAlign: "center",
        })
      );
    entities.push(title);

    // Resume button
    const resumeButton = new Entity()
      .addComponent(
        new Transform2D(this.canvas.width / 2 - 60, this.canvas.height / 2)
      )
      .addComponent(
        new UIButton(
          "RESUME",
          120,
          35,
          {
            fontSize: 16,
            color: "#FFFFFF",
          },
          {
            backgroundColor: "#006600",
            hoverBackgroundColor: "#008800",
            pressedBackgroundColor: "#004400",
            borderColor: "#00FF00",
            borderWidth: 2,
            borderRadius: 6,
          }
        )
      );

    const resumeButtonComponent = resumeButton.getComponent(UIButton)!;
    resumeButtonComponent.onClick = () => {
      this.onResumeGame?.();
    };
    entities.push(resumeButton);

    // Quit button
    const quitButton = new Entity()
      .addComponent(
        new Transform2D(this.canvas.width / 2 - 60, this.canvas.height / 2 + 45)
      )
      .addComponent(
        new UIButton(
          "QUIT",
          120,
          35,
          {
            fontSize: 16,
            color: "#FFFFFF",
          },
          {
            backgroundColor: "#660000",
            hoverBackgroundColor: "#880000",
            pressedBackgroundColor: "#440000",
            borderColor: "#FF0000",
            borderWidth: 2,
            borderRadius: 6,
          }
        )
      );

    const quitButtonComponent = quitButton.getComponent(UIButton)!;
    quitButtonComponent.onClick = () => {
      this.onQuitGame?.();
    };
    entities.push(quitButton);

    this.screenEntities.set("paused", entities);
  }

  private createHUD(): void {
    const entities: Entity[] = [];

    // Score display
    const scoreText = new Entity()
      .addComponent(new Transform2D(20, 20))
      .addComponent(
        new UIText("Score: 0", {
          fontSize: 20,
          color: "#FFFFFF",
          strokeColor: "#000000",
          strokeWidth: 1,
        })
      )
      .addTag("hudScore");
    entities.push(scoreText);

    // Lives display
    const livesText = new Entity()
      .addComponent(new Transform2D(20, 50))
      .addComponent(
        new UIText("Lives: 3", {
          fontSize: 20,
          color: "#FFFFFF",
          strokeColor: "#000000",
          strokeWidth: 1,
        })
      )
      .addTag("hudLives");
    entities.push(livesText);

    // High score display
    const highScoreText = new Entity()
      .addComponent(new Transform2D(this.canvas.width - 20, 20))
      .addComponent(
        new UIText("High: 0", {
          fontSize: 16,
          color: "#FFFF00",
          textAlign: "right",
          strokeColor: "#000000",
          strokeWidth: 1,
        })
      )
      .addTag("hudHighScore");
    entities.push(highScoreText);

    this.screenEntities.set("playing", entities);
  }

  private updateScreenContent(
    state: GameStateType,
    gameState: GameState
  ): void {
    const entities = this.screenEntities.get(state);
    if (!entities) return;

    entities.forEach((entity) => {
      const text = entity.getComponent(UIText);
      if (!text) return;

      // Update HUD elements
      if (entity.hasTag("hudScore")) {
        text.setText(`Score: ${gameState.stats.score}`);
      } else if (entity.hasTag("hudLives")) {
        text.setText(`Lives: ${gameState.stats.lives}`);
      } else if (entity.hasTag("hudHighScore")) {
        text.setText(`High: ${gameState.stats.highScore}`);
      }

      // Update game over screen elements
      else if (entity.hasTag("gameOverScore")) {
        text.setText(`Score: ${gameState.stats.score}`);
      } else if (entity.hasTag("gameOverHighScore")) {
        text.setText(`High Score: ${gameState.stats.highScore}`);
      }

      // Update victory screen elements
      else if (entity.hasTag("victoryScore")) {
        text.setText(`Final Score: ${gameState.stats.score}`);
      } else if (entity.hasTag("victoryHighScore")) {
        text.setText(`High Score: ${gameState.stats.highScore}`);
      }
    });
  }

  // Public method to add screen entities to the world
  public addScreenEntitiesToWorld(world: any): void {
    this.screenEntities.forEach((entities) => {
      entities.forEach((entity) => {
        world.addEntity(entity);
      });
    });
  }
}
