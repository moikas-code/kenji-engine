import { GameEngine, World } from "@kenji-engine/core";
import { Renderable } from "@opentui/core";
import { OptimizedBuffer, RGBA } from "./SimpleOpenTUIBuffer";
import { FlexDirection } from "yoga-layout";
import {
  Container,
  GamePanel,
  ScenePanel,
  PropertiesPanel,
  AssetsPanel,
  RootRenderable,
} from "./ConcreteRenderables";

// Mock RenderContext for OpenTUI
class MockRenderContext {
  private updateCallback?: () => void;

  needsUpdate(): void {
    if (this.updateCallback) {
      this.updateCallback();
    }
  }

  addToHitGrid(
    x: number,
    y: number,
    width: number,
    height: number,
    num: number
  ): void {
    // Mock implementation
  }

  setUpdateCallback(callback: () => void): void {
    this.updateCallback = callback;
  }
}

export interface RealOpenTUIEditorOptions {
  width?: number;
  height?: number;
  projectPath?: string;
}

export class RealOpenTUIEditor {
  private gameEngine: GameEngine;
  private world: World;
  private root: RootRenderable;
  private buffer: OptimizedBuffer;
  private renderContext: MockRenderContext;
  private running: boolean = false;
  private lastFrameTime: number = 0;

  // UI Panels
  private gamePanel: GamePanel;
  private scenePanel: ScenePanel;
  private propertiesPanel: PropertiesPanel;
  private assetsPanel: AssetsPanel;
  private focusablePanels: Renderable[] = [];
  private currentFocus: number = 0;

  constructor(options: RealOpenTUIEditorOptions = {}) {
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
    this.buffer = new OptimizedBuffer(width, height);
    this.renderContext = new MockRenderContext();

    // Create root with proper context
    this.root = new RootRenderable(width, height, this.renderContext as any);

    this.initializePanels();
    this.setupEventHandlers();
    this.setupRenderCallback();
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

  private initializePanels(): void {
    // Create main container with horizontal layout
    const mainContainer = new Container("main-container", {
      zIndex: 0,
      flexDirection: FlexDirection.Row,
      width: "100%",
      height: "100%",
    });

    // Create left column
    const leftColumn = new Container("left-column", {
      zIndex: 0,
      flexDirection: FlexDirection.Column,
      flexGrow: 1,
    });

    // Create right column
    const rightColumn = new Container("right-column", {
      zIndex: 0,
      flexDirection: FlexDirection.Column,
      flexGrow: 1,
    });

    // Create panels
    this.scenePanel = new ScenePanel("scene-panel");
    this.gamePanel = new GamePanel("game-panel");
    this.propertiesPanel = new PropertiesPanel("properties-panel");
    this.assetsPanel = new AssetsPanel("assets-panel");

    // Set up focusable panels
    this.focusablePanels = [
      this.scenePanel,
      this.gamePanel,
      this.propertiesPanel,
      this.assetsPanel,
    ];

    // Add panels to columns
    leftColumn.add(this.scenePanel);
    leftColumn.add(this.propertiesPanel);
    rightColumn.add(this.gamePanel);
    rightColumn.add(this.assetsPanel);

    // Add columns to main container
    mainContainer.add(leftColumn);
    mainContainer.add(rightColumn);

    // Add main container to root
    this.root.add(mainContainer);

    // Set initial focus
    this.updateFocus();

    // Connect game engine
    this.gamePanel.setGameEngine(this.gameEngine);
    this.scenePanel.setWorld(this.world);
  }

  private setupRenderCallback(): void {
    this.renderContext.setUpdateCallback(() => {
      // This will be called when OpenTUI needs to update
    });
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
    this.focusablePanels.forEach((panel, index) => {
      if (index === this.currentFocus) {
        panel.focus();
      } else {
        panel.blur();
      }
    });
  }

  resize(width: number, height: number): void {
    this.buffer = new OptimizedBuffer(width, height);
    this.root.resize(width, height);
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

    // Clear buffer
    this.buffer.clear();

    // Render OpenTUI hierarchy
    this.root.render(this.buffer, 16);

    // Output to console
    console.log(this.buffer.toString());

    // Status bar
    const focusedPanelName = this.focusablePanels[this.currentFocus].id;
    console.log(
      `\n🎮 Real OpenTUI Editor | Focused: ${focusedPanelName} | Tab: Switch | Space: Pause | Q: Quit`
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
      this.currentFocus = (this.currentFocus + 1) % this.focusablePanels.length;
      this.updateFocus();
      return;
    }

    // Let focused panel handle other input
    const focusedPanel = this.focusablePanels[this.currentFocus];
    if (focusedPanel.handleKeyPress) {
      focusedPanel.handleKeyPress(key);
    }
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
    return this.focusablePanels[this.currentFocus].id;
  }
}
