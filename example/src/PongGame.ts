import {
  World,
  Entity,
  Transform2D,
  Velocity2D,
  Sprite2D,
  Collider2D,
  GameState,
  MovementSystem,
  CollisionSystem,
  RenderSystem,
  InputManager,
} from "@kenji-engine/core";

import { PongInputSystem } from "./systems/PongInputSystem";
import { PongCollisionSystem } from "./systems/PongCollisionSystem";
import { PongScoringSystem } from "./systems/PongScoringSystem";
import { PongAISystem } from "./systems/PongAISystem";
import { PongUISystem } from "./systems/PongUISystem";
import { PongAudioSystem } from "./systems/PongAudioSystem";
import { PongGameStateSystem } from "./systems/PongGameStateSystem";

// Game constants
export const GAME_CONFIG = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 400,
  PADDLE_WIDTH: 15,
  PADDLE_HEIGHT: 80,
  PADDLE_SPEED: 300,
  BALL_SIZE: 12,
  BALL_SPEED: 250,
  WALL_THICKNESS: 10,
  DIVIDER_WIDTH: 4,
  WINNING_SCORE: 7,
  AI_DIFFICULTY: 0.85, // 0.0 = impossible, 1.0 = perfect
};

export interface PongGameState {
  player1Score: number;
  player2Score: number;
  gameState: "menu" | "playing" | "paused" | "gameOver";
  winner: "player1" | "player2" | null;
  isAIEnabled: boolean;
}

export class PongGame {
  private world!: World;
  private gameState: PongGameState;
  private inputManager!: InputManager;

  // Game entities
  private player1Paddle!: Entity;
  private player2Paddle!: Entity;
  private ball!: Entity;
  private topWall!: Entity;
  private bottomWall!: Entity;
  private divider!: Entity;

  constructor() {
    this.gameState = {
      player1Score: 0,
      player2Score: 0,
      gameState: "menu",
      winner: null,
      isAIEnabled: true, // Start with AI enabled
    };
  }

  async initialize(world: World, inputManager: InputManager): Promise<void> {
    this.world = world;
    this.inputManager = inputManager;

    console.log("🎮 Initializing Pong Game...");

    // Create game entities
    this.createArena();
    this.createPaddles();
    this.createBall();

    // Add game systems
    this.addGameSystems();

    // Set up input handling
    this.setupInputHandling();

    console.log("✅ Pong Game initialized successfully");
  }

  private createArena(): void {
    console.log("🏟️ Creating game arena...");

    // Top wall
    this.topWall = new Entity()
      .addComponent(new Transform2D(0, 0))
      .addComponent(
        new Sprite2D(
          GAME_CONFIG.CANVAS_WIDTH,
          GAME_CONFIG.WALL_THICKNESS,
          "#00ff41"
        )
      )
      .addComponent(
        new Collider2D(GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.WALL_THICKNESS)
      )
      .addTag("wall")
      .addTag("topWall");

    // Bottom wall
    this.bottomWall = new Entity()
      .addComponent(
        new Transform2D(
          0,
          GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.WALL_THICKNESS
        )
      )
      .addComponent(
        new Sprite2D(
          GAME_CONFIG.CANVAS_WIDTH,
          GAME_CONFIG.WALL_THICKNESS,
          "#00ff41"
        )
      )
      .addComponent(
        new Collider2D(GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.WALL_THICKNESS)
      )
      .addTag("wall")
      .addTag("bottomWall");

    // Center divider (visual only)
    this.divider = new Entity()
      .addComponent(
        new Transform2D(
          GAME_CONFIG.CANVAS_WIDTH / 2 - GAME_CONFIG.DIVIDER_WIDTH / 2,
          GAME_CONFIG.WALL_THICKNESS
        )
      )
      .addComponent(
        new Sprite2D(
          GAME_CONFIG.DIVIDER_WIDTH,
          GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.WALL_THICKNESS * 2,
          "#444444"
        )
      )
      .addTag("divider");

    // Add to world
    this.world.addEntity(this.topWall);
    this.world.addEntity(this.bottomWall);
    this.world.addEntity(this.divider);
  }

  private createPaddles(): void {
    console.log("🏓 Creating paddles...");

    // Player 1 paddle (left side)
    this.player1Paddle = new Entity()
      .addComponent(
        new Transform2D(
          30,
          GAME_CONFIG.CANVAS_HEIGHT / 2 - GAME_CONFIG.PADDLE_HEIGHT / 2
        )
      )
      .addComponent(new Velocity2D(0, 0))
      .addComponent(
        new Sprite2D(
          GAME_CONFIG.PADDLE_WIDTH,
          GAME_CONFIG.PADDLE_HEIGHT,
          "#00ff41"
        )
      )
      .addComponent(
        new Collider2D(GAME_CONFIG.PADDLE_WIDTH, GAME_CONFIG.PADDLE_HEIGHT)
      )
      .addTag("paddle")
      .addTag("player1");

    // Player 2 paddle (right side)
    this.player2Paddle = new Entity()
      .addComponent(
        new Transform2D(
          GAME_CONFIG.CANVAS_WIDTH - 30 - GAME_CONFIG.PADDLE_WIDTH,
          GAME_CONFIG.CANVAS_HEIGHT / 2 - GAME_CONFIG.PADDLE_HEIGHT / 2
        )
      )
      .addComponent(new Velocity2D(0, 0))
      .addComponent(
        new Sprite2D(
          GAME_CONFIG.PADDLE_WIDTH,
          GAME_CONFIG.PADDLE_HEIGHT,
          "#00ff41"
        )
      )
      .addComponent(
        new Collider2D(GAME_CONFIG.PADDLE_WIDTH, GAME_CONFIG.PADDLE_HEIGHT)
      )
      .addTag("paddle")
      .addTag("player2");

    // Add to world
    this.world.addEntity(this.player1Paddle);
    this.world.addEntity(this.player2Paddle);
  }

  private createBall(): void {
    console.log("⚽ Creating ball...");

    this.ball = new Entity()
      .addComponent(
        new Transform2D(
          GAME_CONFIG.CANVAS_WIDTH / 2 - GAME_CONFIG.BALL_SIZE / 2,
          GAME_CONFIG.CANVAS_HEIGHT / 2 - GAME_CONFIG.BALL_SIZE / 2
        )
      )
      .addComponent(
        new Velocity2D(
          Math.random() > 0.5
            ? GAME_CONFIG.BALL_SPEED
            : -GAME_CONFIG.BALL_SPEED,
          (Math.random() - 0.5) * GAME_CONFIG.BALL_SPEED
        )
      )
      .addComponent(
        new Sprite2D(GAME_CONFIG.BALL_SIZE, GAME_CONFIG.BALL_SIZE, "#ffffff")
      )
      .addComponent(
        new Collider2D(GAME_CONFIG.BALL_SIZE, GAME_CONFIG.BALL_SIZE)
      )
      .addTag("ball");

    this.world.addEntity(this.ball);
  }

  private addGameSystems(): void {
    console.log("⚙️ Adding game systems...");

    // Core engine systems
    this.world.addSystem(new MovementSystem());
    this.world.addSystem(new RenderSystem());

    // Custom Pong systems
    this.world.addSystem(
      new PongGameStateSystem(this.inputManager, this.gameState, this)
    );
    this.world.addSystem(
      new PongInputSystem(this.inputManager, this.gameState)
    );
    this.world.addSystem(new PongCollisionSystem(this.gameState));
    this.world.addSystem(new PongScoringSystem(this.gameState));
    this.world.addSystem(new PongAISystem(this.gameState));
    this.world.addSystem(new PongUISystem(this.gameState));
    this.world.addSystem(new PongAudioSystem());
  }

  private setupInputHandling(): void {
    console.log("🎮 Setting up input handling...");
    // Input handling moved to PongGameStateSystem
  }

  private startGame(): void {
    console.log("🚀 Starting game...");
    this.gameState.gameState = "playing";
    this.resetBall();
  }

  private resetGame(): void {
    console.log("🔄 Resetting game...");
    this.gameState.player1Score = 0;
    this.gameState.player2Score = 0;
    this.gameState.winner = null;
    this.gameState.gameState = "playing";
    this.resetBall();
    this.resetPaddles();
  }

  public resetBall(): void {
    const ballTransform = this.ball.getComponent(Transform2D);
    const ballVelocity = this.ball.getComponent(Velocity2D);

    if (ballTransform && ballVelocity) {
      // Reset position to center
      ballTransform.x =
        GAME_CONFIG.CANVAS_WIDTH / 2 - GAME_CONFIG.BALL_SIZE / 2;
      ballTransform.y =
        GAME_CONFIG.CANVAS_HEIGHT / 2 - GAME_CONFIG.BALL_SIZE / 2;

      // Random direction
      ballVelocity.x =
        Math.random() > 0.5 ? GAME_CONFIG.BALL_SPEED : -GAME_CONFIG.BALL_SPEED;
      ballVelocity.y = (Math.random() - 0.5) * GAME_CONFIG.BALL_SPEED;
    }
  }

  public resetPaddles(): void {
    const p1Transform = this.player1Paddle.getComponent(Transform2D);
    const p2Transform = this.player2Paddle.getComponent(Transform2D);

    if (p1Transform) {
      p1Transform.y =
        GAME_CONFIG.CANVAS_HEIGHT / 2 - GAME_CONFIG.PADDLE_HEIGHT / 2;
    }

    if (p2Transform) {
      p2Transform.y =
        GAME_CONFIG.CANVAS_HEIGHT / 2 - GAME_CONFIG.PADDLE_HEIGHT / 2;
    }
  }

  // Public getters for systems to access game entities
  public getPlayer1Paddle(): Entity {
    return this.player1Paddle;
  }
  public getPlayer2Paddle(): Entity {
    return this.player2Paddle;
  }
  public getBall(): Entity {
    return this.ball;
  }
  public getGameState(): PongGameState {
    return this.gameState;
  }
}
