import { Renderable } from "@opentui/core";
import { OptimizedBuffer, RGBA } from "./SimpleOpenTUIBuffer";

// Concrete implementation for containers
export class Container extends Renderable {
  protected renderSelf(buffer: OptimizedBuffer, deltaTime: number): void {
    // Container doesn't render anything itself
  }
}

// Game Panel Component
export class GamePanel extends Renderable {
  private gameEngine: any = null;

  constructor(id: string) {
    super(id, {
      zIndex: 1,
      flexGrow: 1,
      padding: { top: 1, right: 1, bottom: 1, left: 1 },
    });
  }

  setGameEngine(engine: any): void {
    this.gameEngine = engine;
  }

  protected renderSelf(buffer: OptimizedBuffer, deltaTime: number): void {
    // Draw border
    buffer.drawBorder(
      this.x,
      this.y,
      this.width,
      this.height,
      RGBA.fromValues(0.5, 0.5, 0.5, 1)
    );

    // Draw title
    buffer.drawText(
      " Game Preview ",
      this.x + 2,
      this.y,
      RGBA.fromValues(0.8, 0.8, 0.8, 1)
    );

    // Draw game content placeholder
    const centerX = this.x + Math.floor(this.width / 2) - 5;
    const centerY = this.y + Math.floor(this.height / 2);

    if (this.gameEngine) {
      buffer.drawText(
        "🎮 Game Running",
        centerX,
        centerY,
        RGBA.fromValues(0, 1, 0, 1)
      );
      buffer.drawText(
        "FPS: 60.0",
        centerX,
        centerY + 1,
        RGBA.fromValues(0.7, 0.7, 0.7, 1)
      );
    } else {
      buffer.drawText(
        "No Game Loaded",
        centerX,
        centerY,
        RGBA.fromValues(0.5, 0.5, 0.5, 1)
      );
    }
  }
}

// Scene Hierarchy Panel
export class ScenePanel extends Renderable {
  private world: any = null;

  constructor(id: string) {
    super(id, {
      zIndex: 1,
      flexGrow: 1,
      padding: { top: 1, right: 1, bottom: 1, left: 1 },
    });
  }

  setWorld(world: any): void {
    this.world = world;
  }

  protected renderSelf(buffer: OptimizedBuffer, deltaTime: number): void {
    // Draw border
    const borderColor = this.focused
      ? RGBA.fromValues(0, 1, 0, 1)
      : RGBA.fromValues(0.5, 0.5, 0.5, 1);
    buffer.drawBorder(this.x, this.y, this.width, this.height, borderColor);

    // Draw title
    buffer.drawText(
      " Scene Hierarchy ",
      this.x + 2,
      this.y,
      RGBA.fromValues(0.8, 0.8, 0.8, 1)
    );

    // Draw scene content
    let yOffset = 2;
    if (this.world && this.world.entities) {
      const entityArray = Array.from(this.world.entities);
      buffer.drawText(
        `📁 Entities (${entityArray.length})`,
        this.x + 2,
        this.y + yOffset,
        RGBA.fromValues(0.7, 0.7, 0.7, 1)
      );
      yOffset++;

      entityArray
        .slice(0, Math.min(5, this.height - 4))
        .forEach((entity: any, index: number) => {
          const entityText = `  └ Entity ${entity.getId()}`;
          buffer.drawText(
            entityText,
            this.x + 2,
            this.y + yOffset + index,
            RGBA.fromValues(0.6, 0.6, 0.6, 1)
          );
        });
    } else {
      buffer.drawText(
        "No World Loaded",
        this.x + 2,
        this.y + yOffset,
        RGBA.fromValues(0.5, 0.5, 0.5, 1)
      );
    }
  }
}

// Properties Panel
export class PropertiesPanel extends Renderable {
  constructor(id: string) {
    super(id, {
      zIndex: 1,
      flexGrow: 1,
      padding: { top: 1, right: 1, bottom: 1, left: 1 },
    });
  }

  protected renderSelf(buffer: OptimizedBuffer, deltaTime: number): void {
    // Draw border
    const borderColor = this.focused
      ? RGBA.fromValues(0, 1, 0, 1)
      : RGBA.fromValues(0.5, 0.5, 0.5, 1);
    buffer.drawBorder(this.x, this.y, this.width, this.height, borderColor);

    // Draw title
    buffer.drawText(
      " Properties ",
      this.x + 2,
      this.y,
      RGBA.fromValues(0.8, 0.8, 0.8, 1)
    );

    // Draw properties content
    buffer.drawText(
      "🔧 No Selection",
      this.x + 2,
      this.y + 2,
      RGBA.fromValues(0.5, 0.5, 0.5, 1)
    );
  }
}

// Assets Panel
export class AssetsPanel extends Renderable {
  constructor(id: string) {
    super(id, {
      zIndex: 1,
      flexGrow: 1,
      padding: { top: 1, right: 1, bottom: 1, left: 1 },
    });
  }

  protected renderSelf(buffer: OptimizedBuffer, deltaTime: number): void {
    // Draw border
    const borderColor = this.focused
      ? RGBA.fromValues(0, 1, 0, 1)
      : RGBA.fromValues(0.5, 0.5, 0.5, 1);
    buffer.drawBorder(this.x, this.y, this.width, this.height, borderColor);

    // Draw title
    buffer.drawText(
      " Asset Browser ",
      this.x + 2,
      this.y,
      RGBA.fromValues(0.8, 0.8, 0.8, 1)
    );

    // Draw assets content
    buffer.drawText(
      "📦 Assets",
      this.x + 2,
      this.y + 2,
      RGBA.fromValues(0.7, 0.7, 0.7, 1)
    );
    buffer.drawText(
      "  └ sprites/",
      this.x + 2,
      this.y + 3,
      RGBA.fromValues(0.6, 0.6, 0.6, 1)
    );
    buffer.drawText(
      "  └ sounds/",
      this.x + 2,
      this.y + 4,
      RGBA.fromValues(0.6, 0.6, 0.6, 1)
    );
  }
}
