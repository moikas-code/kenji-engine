import { GameEngine, Entity, World } from "@kuuzuki-ge/core";
import { SimpleBreakoutGame } from "./SimpleBreakoutGame";
import { SceneHierarchy } from "./components/SceneHierarchy";
import { PropertyPanel } from "./components/PropertyPanel";
import { GamePreview } from "./components/GamePreview";
import { AssetBrowser } from "./components/AssetBrowser";
import { MainLayout } from "./layouts/MainLayout";
import { TUIRenderer } from "./TUIRenderer";

export interface KuuzukiEditorOptions {
  width?: number;
  height?: number;
  projectPath?: string;
}

export class KuuzukiEditor {
  private gameEngine: GameEngine;
  private world: World;
  private renderer: TUIRenderer;
  private layout: MainLayout;
  private sceneHierarchy: SceneHierarchy;
  private propertyPanel: PropertyPanel;
  private gamePreview: GamePreview;
  private assetBrowser: AssetBrowser;
  private running: boolean = false;
  private lastFrameTime: number = 0;

  constructor(options: KuuzukiEditorOptions = {}) {
    const width = options.width || process.stdout.columns || 120;
    const height = options.height || process.stdout.rows || 30;

    const mockCanvas = {
      width: 800,
      height: 600,
      getContext: () => ({
        fillStyle: "",
        strokeStyle: "",
        lineWidth: 1,
        fillRect: () => {},
        strokeRect: () => {},
        clearRect: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        fill: () => {},
        stroke: () => {},
        arc: () => {},
        drawImage: () => {},
        save: () => {},
        restore: () => {},
        translate: () => {},
        rotate: () => {},
        scale: () => {},
      }),
    } as any;

    this.gameEngine = new GameEngine({
      canvas: mockCanvas,
      mode: "2d",
      targetFPS: 60,
      debug: false,
    });
    this.world = this.gameEngine.getWorld();
    this.renderer = new TUIRenderer(width, height);
    this.layout = new MainLayout(width, height);

    this.initializeComponents();
    this.setupEventHandlers();
    this.loadBreakoutGame();
  }

  private initializeComponents(): void {
    const scenePanel = this.layout.getPanel("sceneHierarchy");
    const gamePanel = this.layout.getPanel("gamePreview");
    const propertyPanel = this.layout.getPanel("propertyPanel");
    const assetPanel = this.layout.getPanel("assetBrowser");

    this.sceneHierarchy = new SceneHierarchy(
      scenePanel.x,
      scenePanel.y,
      scenePanel.width,
      scenePanel.height
    );

    this.gamePreview = new GamePreview(
      gamePanel.x,
      gamePanel.y,
      gamePanel.width,
      gamePanel.height
    );

    this.propertyPanel = new PropertyPanel(
      propertyPanel.x,
      propertyPanel.y,
      propertyPanel.width,
      propertyPanel.height
    );

    this.assetBrowser = new AssetBrowser(
      assetPanel.x,
      assetPanel.y,
      assetPanel.width,
      assetPanel.height,
      process.cwd()
    );

    this.layout.setComponent("sceneHierarchy", this.sceneHierarchy);
    this.layout.setComponent("gamePreview", this.gamePreview);
    this.layout.setComponent("propertyPanel", this.propertyPanel);
    this.layout.setComponent("assetBrowser", this.assetBrowser);

    this.renderer.addComponent(this.sceneHierarchy);
    this.renderer.addComponent(this.gamePreview);
    this.renderer.addComponent(this.propertyPanel);
    this.renderer.addComponent(this.assetBrowser);
  }

  private setupEventHandlers(): void {
    this.sceneHierarchy.onEntitySelected = (entity: Entity | null) => {
      this.propertyPanel.setSelectedEntity(entity);
      if (entity) {
        this.gamePreview.highlightEntity(entity);
      }
    };

    process.on("SIGINT", () => {
      this.stop();
      process.exit(0);
    });

    process.stdout.on("resize", () => {
      const width = process.stdout.columns || 120;
      const height = process.stdout.rows || 30;
      this.resize(width, height);
    });
  }

  private loadBreakoutGame(): void {
    const breakoutGame = new SimpleBreakoutGame();
    breakoutGame.initialize(this.world);

    this.sceneHierarchy.setWorld(this.world);
    this.gamePreview.setGameEngine(this.gameEngine);
  }
  resize(width: number, height: number): void {
    this.renderer.resize(width, height);
    this.layout.resize(width, height);

    const scenePanel = this.layout.getPanel("sceneHierarchy");
    const gamePanel = this.layout.getPanel("gamePreview");
    const propertyPanel = this.layout.getPanel("propertyPanel");
    const assetPanel = this.layout.getPanel("assetBrowser");

    this.sceneHierarchy = new SceneHierarchy(
      scenePanel.x,
      scenePanel.y,
      scenePanel.width,
      scenePanel.height
    );

    this.gamePreview = new GamePreview(
      gamePanel.x,
      gamePanel.y,
      gamePanel.width,
      gamePanel.height
    );

    this.propertyPanel = new PropertyPanel(
      propertyPanel.x,
      propertyPanel.y,
      propertyPanel.width,
      propertyPanel.height
    );

    this.assetBrowser = new AssetBrowser(
      assetPanel.x,
      assetPanel.y,
      assetPanel.width,
      assetPanel.height,
      process.cwd()
    );

    this.renderer.removeComponent(this.sceneHierarchy);
    this.renderer.removeComponent(this.gamePreview);
    this.renderer.removeComponent(this.propertyPanel);
    this.renderer.removeComponent(this.assetBrowser);

    this.renderer.addComponent(this.sceneHierarchy);
    this.renderer.addComponent(this.gamePreview);
    this.renderer.addComponent(this.propertyPanel);
    this.renderer.addComponent(this.assetBrowser);
  }

  start(): void {
    this.running = true;
    this.lastFrameTime = Date.now();

    if (process.stdin.setRawMode) {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding("utf8");

      process.stdin.on("data", (key: string) => {
        this.handleInput(key);
      });
    } else {
      console.log("⚠️  Raw mode not available - limited input support");
    }

    this.gameLoop();
  }

  stop(): void {
    this.running = false;
    process.stdin.setRawMode(false);
    process.stdin.pause();
  }

  private gameLoop(): void {
    if (!this.running) return;

    const currentTime = Date.now();
    const deltaTime = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;

    this.gameEngine.update(deltaTime);
    this.render();

    setTimeout(() => this.gameLoop(), 16);
  }

  private render(): void {
    console.clear();
    const output = this.renderer.render();
    console.log(output);

    const focusedPanel = this.layout.getFocusedPanel();
    console.log(
      `\nFocused: ${focusedPanel} | Tab: Switch panels | Q: Quit | Space: Pause/Resume`
    );
  }

  private handleInput(key: string): void {
    if (key === "q" || key === "\u0003") {
      this.stop();
      process.exit(0);
      return;
    }

    if (key === " ") {
      this.gameEngine.togglePause();
      return;
    }

    if (this.layout.handleInput(key)) {
      return;
    }

    if (this.renderer.handleInput(key)) {
      return;
    }
  }

  getGameEngine(): GameEngine {
    return this.gameEngine;
  }

  getWorld(): World {
    return this.world;
  }

  isRunning(): boolean {
    return this.running;
  }
}
