import {
  GameEngine,
  Entity,
  World,
  Transform2D,
  Sprite2D,
} from "@kuuzuki-ge/core";
import { TUIComponent } from "../TUIRenderer";

export interface GamePreviewState {
  highlightedEntity: Entity | null;
  showGrid: boolean;
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export class GamePreview implements TUIComponent {
  private state: GamePreviewState;
  private gameEngine: GameEngine | null = null;
  private world: World | null = null;
  private width: number;
  private height: number;
  private x: number;
  private y: number;
  private buffer: string[][];

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.state = {
      highlightedEntity: null,
      showGrid: false,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    };
    this.buffer = this.createBuffer();
  }

  private createBuffer(): string[][] {
    const buffer: string[][] = [];
    for (let y = 0; y < this.height - 2; y++) {
      buffer[y] = new Array(this.width - 2).fill(" ");
    }
    return buffer;
  }

  setGameEngine(gameEngine: GameEngine): void {
    this.gameEngine = gameEngine;
    this.world = gameEngine.world;
  }

  highlightEntity(entity: Entity | null): void {
    this.state.highlightedEntity = entity;
  }

  toggleGrid(): void {
    this.state.showGrid = !this.state.showGrid;
  }

  setZoom(zoom: number): void {
    this.state.zoom = Math.max(0.1, Math.min(5, zoom));
  }

  setOffset(x: number, y: number): void {
    this.state.offsetX = x;
    this.state.offsetY = y;
  }

  private clearBuffer(): void {
    for (let y = 0; y < this.buffer.length; y++) {
      for (let x = 0; x < this.buffer[y].length; x++) {
        this.buffer[y][x] = " ";
      }
    }
  }

  private drawGrid(): void {
    if (!this.state.showGrid) return;

    const gridSize = Math.floor(10 * this.state.zoom);
    if (gridSize < 2) return;

    for (let y = 0; y < this.buffer.length; y += gridSize) {
      for (let x = 0; x < this.buffer[0].length; x++) {
        if (this.buffer[y] && this.buffer[y][x] === " ") {
          this.buffer[y][x] = "·";
        }
      }
    }

    for (let x = 0; x < this.buffer[0].length; x += gridSize) {
      for (let y = 0; y < this.buffer.length; y++) {
        if (this.buffer[y] && this.buffer[y][x] === " ") {
          this.buffer[y][x] = "·";
        }
      }
    }
  }

  private drawEntities(): void {
    if (!this.world) return;

    const entities = this.world.getAllEntities();

    for (const entity of entities) {
      this.drawEntity(entity);
    }
  }

  private drawEntity(entity: Entity): void {
    const transform = entity.getComponent(Transform2D);
    const sprite = entity.getComponent(Sprite2D);

    if (!transform) return;

    const screenX = Math.floor(
      (transform.x + this.state.offsetX) * this.state.zoom
    );
    const screenY = Math.floor(
      (transform.y + this.state.offsetY) * this.state.zoom
    );

    if (
      screenX < 0 ||
      screenX >= this.buffer[0].length ||
      screenY < 0 ||
      screenY >= this.buffer.length
    ) {
      return;
    }

    let char = "●";

    if (sprite) {
      const width = Math.max(1, Math.floor(sprite.width * this.state.zoom));
      const height = Math.max(1, Math.floor(sprite.height * this.state.zoom));

      char = this.getSpriteChar(entity);

      for (let dy = 0; dy < height && screenY + dy < this.buffer.length; dy++) {
        for (
          let dx = 0;
          dx < width && screenX + dx < this.buffer[0].length;
          dx++
        ) {
          if (screenY + dy >= 0 && screenX + dx >= 0) {
            this.buffer[screenY + dy][screenX + dx] = char;
          }
        }
      }
    } else {
      if (this.buffer[screenY] && this.buffer[screenY][screenX] !== undefined) {
        this.buffer[screenY][screenX] = char;
      }
    }

    if (this.state.highlightedEntity === entity) {
      this.highlightEntityInBuffer(screenX, screenY, sprite);
    }
  }

  private getSpriteChar(entity: Entity): string {
    const components = entity.getAllComponents();

    for (const component of components) {
      const name = component.constructor.name;
      if (name === "UIText") return "T";
      if (name === "UIButton") return "B";
      if (name === "UIPanel") return "█";
      if (name === "Collider2D") return "□";
    }

    return "●";
  }

  private highlightEntityInBuffer(
    x: number,
    y: number,
    sprite: Sprite2D | undefined
  ): void {
    const width = sprite
      ? Math.max(1, Math.floor(sprite.width * this.state.zoom))
      : 1;
    const height = sprite
      ? Math.max(1, Math.floor(sprite.height * this.state.zoom))
      : 1;

    for (let dy = -1; dy <= height; dy++) {
      for (let dx = -1; dx <= width; dx++) {
        const bufferY = y + dy;
        const bufferX = x + dx;

        if (
          bufferY >= 0 &&
          bufferY < this.buffer.length &&
          bufferX >= 0 &&
          bufferX < this.buffer[0].length
        ) {
          if (dy === -1 || dy === height || dx === -1 || dx === width) {
            if (this.buffer[bufferY][bufferX] === " ") {
              this.buffer[bufferY][bufferX] = "▓";
            }
          }
        }
      }
    }
  }

  render(): string[] {
    const lines: string[] = [];

    lines.push("┌─ Game Preview ─┐".padEnd(this.width, "─"));

    this.clearBuffer();
    this.drawGrid();
    this.drawEntities();

    for (let y = 0; y < this.buffer.length; y++) {
      const line = "│" + this.buffer[y].join("") + "│";
      lines.push(line);
    }

    while (lines.length < this.height - 1) {
      lines.push("│".padEnd(this.width - 1) + "│");
    }

    lines.push("└".padEnd(this.width - 1, "─") + "┘");

    return lines;
  }

  handleInput(key: string): boolean {
    switch (key) {
      case "g":
        this.toggleGrid();
        return true;

      case "+":
      case "=":
        this.setZoom(this.state.zoom * 1.2);
        return true;

      case "-":
        this.setZoom(this.state.zoom / 1.2);
        return true;

      case "w":
        this.setOffset(this.state.offsetX, this.state.offsetY - 10);
        return true;

      case "s":
        this.setOffset(this.state.offsetX, this.state.offsetY + 10);
        return true;

      case "a":
        this.setOffset(this.state.offsetX - 10, this.state.offsetY);
        return true;

      case "d":
        this.setOffset(this.state.offsetX + 10, this.state.offsetY);
        return true;

      case "0":
        this.setZoom(1);
        this.setOffset(0, 0);
        return true;

      default:
        return false;
    }
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  getState(): GamePreviewState {
    return { ...this.state };
  }
}
