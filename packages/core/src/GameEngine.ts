import { World } from "./ecs/World";
import { IRenderer } from "./rendering/IRenderer";
import { Canvas2DRenderer } from "./rendering/Canvas2DRenderer";
import { InputManager } from "./input/InputManager";
import { AudioManager } from "./audio/AudioManager";
import { AssetManager } from "./utils/AssetManager";

export interface GameEngineConfig {
  canvas: HTMLCanvasElement;
  mode: "2d" | "3d";
  targetFPS: number;
  debug: boolean;
}

export class GameEngine {
  public world: World;
  public renderer: IRenderer;
  public inputManager: InputManager;
  public audioManager: AudioManager;
  public assetManager: AssetManager;

  private canvas: HTMLCanvasElement;
  private mode: "2d" | "3d";
  private targetFPS: number;
  private debug: boolean;
  private running: boolean = false;
  private lastTime: number = 0;
  private deltaTime: number = 0;

  constructor(config: GameEngineConfig) {
    this.canvas = config.canvas;
    this.mode = config.mode;
    this.targetFPS = config.targetFPS;
    this.debug = config.debug;

    this.world = new World();
    this.inputManager = new InputManager(this.canvas);
    this.audioManager = new AudioManager();
    this.assetManager = new AssetManager();

    // Initialize renderer based on mode
    if (this.mode === "2d") {
      this.renderer = new Canvas2DRenderer(this.canvas);
    } else {
      // TODO: Implement ThreeJSRenderer for 3D mode
      throw new Error("3D mode not yet implemented");
    }
  }

  async initialize(): Promise<void> {
    await this.renderer.initialize();
    await this.audioManager.initialize();
    await this.assetManager.initialize();

    if (this.debug) {
      console.log(`Game Engine initialized in ${this.mode} mode`);
    }
  }

  start(): void {
    if (this.running) return;

    this.running = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  stop(): void {
    this.running = false;
  }

  private gameLoop = (): void => {
    if (!this.running) return;

    const currentTime = performance.now();
    this.deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Cap delta time to prevent spiral of death
    this.deltaTime = Math.min(this.deltaTime, 1 / 30);

    this.update(this.deltaTime);
    this.render();

    requestAnimationFrame(this.gameLoop);
  };

  public update(deltaTime: number): void {
    this.inputManager.update();
    this.world.update(deltaTime);
  }

  public getWorld(): World {
    return this.world;
  }

  public togglePause(): void {
    if (this.running) {
      this.stop();
    } else {
      this.start();
    }
  }

  private render(): void {
    this.renderer.clear();
    this.renderer.render(this.world);

    if (this.debug) {
      this.renderDebugInfo();
    }
  }

  private renderDebugInfo(): void {
    // Render FPS, entity count, etc.
    const fps = Math.round(1 / this.deltaTime);
    const entityCount = this.world.getEntitiesWith().length;

    // For Canvas2D renderer, we can draw debug text
    if (this.renderer instanceof Canvas2DRenderer) {
      const canvas = this.canvas;
      const ctx = canvas.getContext("2d")!;

      ctx.fillStyle = "#00FF00";
      ctx.font = "16px monospace";
      ctx.fillText(`FPS: ${fps}`, 10, 20);
      ctx.fillText(`Entities: ${entityCount}`, 10, 40);
    }
  }
}
