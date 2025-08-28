import { EventEmitter } from 'events';

export interface GameConfig {
  fps: number;
  width: number;
  height: number;
}

export class GameEngine extends EventEmitter {
  private config: GameConfig;
  private running: boolean = false;
  private lastTime: number = 0;
  private accumulator: number = 0;
  private frameTime: number;
  private currentFps: number = 0;
  private frameCount: number = 0;
  private fpsUpdateTime: number = 0;

  constructor(config: Partial<GameConfig> = {}) {
    super();
    this.config = {
      fps: config.fps ?? 60,
      width: config.width ?? 80,
      height: config.height ?? 24,
    };
    this.frameTime = 1000 / this.config.fps;
  }

  start(): void {
    if (this.running) return;
    
    this.running = true;
    this.lastTime = performance.now();
    this.fpsUpdateTime = this.lastTime;
    
    this.emit('start');
    this.gameLoop();
  }

  stop(): void {
    this.running = false;
    this.emit('stop');
  }

  private gameLoop = (): void => {
    if (!this.running) return;

    const currentTime = performance.now();
    const deltaTime = Math.min(currentTime - this.lastTime, 100);
    this.lastTime = currentTime;

    this.accumulator += deltaTime;

    while (this.accumulator >= this.frameTime) {
      this.emit('fixedUpdate', this.frameTime);
      this.accumulator -= this.frameTime;
    }

    const interpolation = this.accumulator / this.frameTime;
    this.emit('update', deltaTime, interpolation);
    this.emit('render', interpolation);

    this.updateFps(currentTime);

    setImmediate(this.gameLoop);
  };

  private updateFps(currentTime: number): void {
    this.frameCount++;
    
    if (currentTime - this.fpsUpdateTime >= 1000) {
      this.currentFps = this.frameCount;
      this.frameCount = 0;
      this.fpsUpdateTime = currentTime;
      this.emit('fpsUpdate', this.currentFps);
    }
  }

  getConfig(): GameConfig {
    return { ...this.config };
  }

  getFps(): number {
    return this.currentFps;
  }
}