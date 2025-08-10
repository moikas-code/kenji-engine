import { Component } from "../ecs/Component";

export type GameStateType =
  | "menu"
  | "playing"
  | "paused"
  | "gameOver"
  | "victory"
  | "loading";

export interface GameStats {
  score: number;
  lives: number;
  level: number;
  highScore: number;
  bricksRemaining: number;
  totalBricks: number;
}

export class GameState extends Component {
  public currentState: GameStateType;
  public previousState: GameStateType;
  public stats: GameStats;
  public stateChangeTime: number;

  // State transition callbacks
  public onStateChange?: (
    newState: GameStateType,
    oldState: GameStateType
  ) => void;

  constructor(initialState: GameStateType = "menu") {
    super();
    this.currentState = initialState;
    this.previousState = initialState;
    this.stateChangeTime = Date.now();

    this.stats = {
      score: 0,
      lives: 3,
      level: 1,
      highScore: this.loadHighScore(),
      bricksRemaining: 0,
      totalBricks: 0,
    };
  }

  setState(newState: GameStateType): void {
    if (newState !== this.currentState) {
      this.previousState = this.currentState;
      this.currentState = newState;
      this.stateChangeTime = Date.now();

      this.onStateChange?.(newState, this.previousState);
    }
  }

  isState(state: GameStateType): boolean {
    return this.currentState === state;
  }

  wasState(state: GameStateType): boolean {
    return this.previousState === state;
  }

  getTimeSinceStateChange(): number {
    return Date.now() - this.stateChangeTime;
  }

  addScore(points: number): void {
    this.stats.score += points;
    if (this.stats.score > this.stats.highScore) {
      this.stats.highScore = this.stats.score;
      this.saveHighScore();
    }
  }

  loseLife(): boolean {
    this.stats.lives = Math.max(0, this.stats.lives - 1);
    return this.stats.lives <= 0;
  }

  resetGame(): void {
    this.stats.score = 0;
    this.stats.lives = 3;
    this.stats.level = 1;
    this.stats.bricksRemaining = this.stats.totalBricks;
  }

  private loadHighScore(): number {
    try {
      return parseInt(localStorage.getItem("breakout-highscore") || "0", 10);
    } catch {
      return 0;
    }
  }

  private saveHighScore(): void {
    try {
      localStorage.setItem(
        "breakout-highscore",
        this.stats.highScore.toString()
      );
    } catch {
      // Ignore localStorage errors
    }
  }
}
