import { GameEngine, Entity, World } from "@kenji-engine/core";
import { OpenTUIRenderer } from "./OpenTUIRenderer";
import { Panel } from "./Renderable";
import { RGBA } from "./types";

export interface ModernKuuzukiEditorOptions {
  width?: number;
  height?: number;
  projectPath?: string;
}

export class ModernKuuzukiEditor {
  private gameEngine: GameEngine;
  private world: World;
  private renderer: OpenTUIRenderer;
  private running: boolean = false;
  private lastFrameTime: number = 0;

  // UI Panels
  private scenePanel: Panel;
  private gamePanel: Panel;
  private propertyPanel: Panel;
  private assetPanel: Panel;
  private currentFocus: number = 0;
  private panels: Panel[] = [];

  constructor(options: ModernKuuzukiEditorOptions = {}) {
    const width = options.width || process.stdout.columns || 120;
    const height = options.height || process.stdout.rows || 30;

    // Create mock canvas for game engine
    const mockCanvas = this.createMockCanvas();

    this.gameEngine = new GameEngine({
      canvas: mockCanvas,
      mode: "2d",
      targetFPS: 60,
      debug: false,
    });

    this.world = this.gameEngine.getWorld();
    this.renderer = new OpenTUIRenderer(width, height);

    this.initializePanels(width, height);
    this.setupEventHandlers();
  }

  private createMockCanvas(): any {
    return {
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
    };
  }

  private initializePanels(width: number, height: number): void {
    const panelWidth = Math.floor(width / 2);
    const panelHeight = Math.floor(height / 2);

    // Scene Hierarchy Panel (top-left)
    this.scenePanel = new Panel("scene", {
      x: 0,
      y: 0,
      width: panelWidth,
      height: panelHeight,
      title: "Scene Hierarchy",
    });

    // Game Preview Panel (top-right)
    this.gamePanel = new Panel("game", {
      x: panelWidth,
      y: 0,
      width: width - panelWidth,
      height: panelHeight,
      title: "Game Preview",
    });

    // Property Panel (bottom-left)
    this.propertyPanel = new Panel("properties", {
      x: 0,
      y: panelHeight,
      width: panelWidth,
      height: height - panelHeight,
      title: "Properties",
    });

    // Asset Browser Panel (bottom-right)
    this.assetPanel = new Panel("assets", {
      x: panelWidth,
      y: panelHeight,
      width: width - panelWidth,
      height: height - panelHeight,
      title: "Asset Browser",
    });

    this.panels = [
      this.scenePanel,
      this.gamePanel,
      this.propertyPanel,
      this.assetPanel,
    ];

    // Add panels to renderer
    this.panels.forEach((panel) => this.renderer.add(panel));

    // Set initial focus
    this.updateFocus();
  }

  private setupEventHandlers(): void {
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

  private updateFocus(): void {
    this.panels.forEach((panel, index) => {
      const focused = index === this.currentFocus;
      panel.setFocused(focused);
      panel.setBorderColor(
        focused
          ? RGBA.fromValues(0, 1, 0, 1) // Green for focused
          : RGBA.fromValues(0.5, 0.5, 0.5, 1) // Gray for unfocused
      );
    });
  }

  resize(width: number, height: number): void {
    this.renderer.resize(width, height);

    // Remove old panels
    this.panels.forEach((panel) => this.renderer.remove(panel));

    // Recreate panels with new dimensions
    this.initializePanels(width, height);
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
    if (process.stdin.setRawMode) {
      process.stdin.setRawMode(false);
      process.stdin.pause();
    }
  }

  private gameLoop(): void {
    if (!this.running) return;

    const currentTime = Date.now();
    const deltaTime = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;

    this.gameEngine.update(deltaTime);
    this.render();

    setTimeout(() => this.gameLoop(), 16); // ~60 FPS
  }

  private render(): void {
    console.clear();
    const output = this.renderer.render();
    console.log(output);

    // Status bar
    const focusedPanelName = this.panels[this.currentFocus].getId();
    console.log(
      `\nFocused: ${focusedPanelName} | Tab: Switch panels | Q: Quit | Space: Pause/Resume`
    );
  }

  private handleInput(key: string): void {
    // Global shortcuts
    if (key === "q" || key === "\u0003") {
      // Ctrl+C
      this.stop();
      process.exit(0);
      return;
    }

    if (key === " ") {
      this.gameEngine.togglePause();
      return;
    }

    if (key === "\t") {
      // Tab key
      this.currentFocus = (this.currentFocus + 1) % this.panels.length;
      this.updateFocus();
      return;
    }

    // Let renderer handle other input
    this.renderer.handleInput(key);
  }

  // Public API
  getGameEngine(): GameEngine {
    return this.gameEngine;
  }

  getWorld(): World {
    return this.world;
  }

  isRunning(): boolean {
    return this.running;
  }

  getFocusedPanel(): string {
    return this.panels[this.currentFocus].getId();
  }
}
