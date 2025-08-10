export interface SpriteConfig {
  type:
    | "paddle"
    | "ball"
    | "brick"
    | "player"
    | "enemy"
    | "projectile"
    | "powerup";
  width: number;
  height: number;
  colors: string[];
  style: "retro" | "modern" | "minimalist";
  animated?: boolean;
  frames?: number;
}

export class PixelArtGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement("canvas");
    const context = this.canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not get 2D rendering context");
    }
    this.ctx = context;
    this.ctx.imageSmoothingEnabled = false; // Pixel-perfect rendering
  }

  async generateSprite(config: SpriteConfig): Promise<HTMLCanvasElement> {
    // Create a new canvas for each sprite to avoid reuse issues
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;

    canvas.width = config.width;
    canvas.height = config.height;

    ctx.clearRect(0, 0, config.width, config.height);

    // Temporarily use the new canvas
    const originalCanvas = this.canvas;
    const originalCtx = this.ctx;
    this.canvas = canvas;
    this.ctx = ctx;

    let result: HTMLCanvasElement;

    switch (config.type) {
      case "paddle":
        result = this.generatePaddle(config);
        break;
      case "ball":
        result = this.generateBall(config);
        break;
      case "brick":
        result = this.generateBrick(config);
        break;
      case "player":
        result = this.generatePlayer(config);
        break;
      case "enemy":
        result = this.generateEnemy(config);
        break;
      case "projectile":
        result = this.generateProjectile(config);
        break;
      case "powerup":
        result = this.generatePowerup(config);
        break;
      default:
        result = this.generateGeneric(config);
        break;
    }

    // Restore original canvas
    this.canvas = originalCanvas;
    this.ctx = originalCtx;

    return result;
  }

  private generatePaddle(config: SpriteConfig): HTMLCanvasElement {
    const { width, height, colors, style } = config;
    const primaryColor = colors[0] || "#FFFFFF";
    const highlightColor = colors[1] || this.lightenColor(primaryColor, 0.3);
    const shadowColor = colors[2] || this.darkenColor(primaryColor, 0.3);

    // Draw main paddle body
    this.ctx.fillStyle = primaryColor;
    this.ctx.fillRect(0, 0, width, height);

    if (style === "retro") {
      // Add retro-style highlights and shadows
      this.ctx.fillStyle = highlightColor;
      this.ctx.fillRect(0, 0, width, 1); // Top highlight
      this.ctx.fillRect(0, 0, 1, height); // Left highlight

      this.ctx.fillStyle = shadowColor;
      this.ctx.fillRect(0, height - 1, width, 1); // Bottom shadow
      this.ctx.fillRect(width - 1, 0, 1, height); // Right shadow
    }

    return this.canvas;
  }

  private generateBall(config: SpriteConfig): HTMLCanvasElement {
    const { width, height, colors, style } = config;
    const radius = Math.min(width, height) / 2;
    const centerX = width / 2;
    const centerY = height / 2;
    const primaryColor = colors[0] || "#FFFFFF";

    if (style === "retro") {
      // Draw pixel-perfect circle
      this.drawPixelCircle(centerX, centerY, radius, primaryColor);
    } else {
      // Draw filled circle
      this.ctx.fillStyle = primaryColor;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      this.ctx.fill();
    }

    return this.canvas;
  }

  private generateBrick(config: SpriteConfig): HTMLCanvasElement {
    const { width, height, colors, style } = config;
    const primaryColor = colors[0] || "#8B4513";
    const mortarColor = colors[1] || "#654321";

    // Draw brick pattern
    this.ctx.fillStyle = primaryColor;
    this.ctx.fillRect(0, 0, width, height);

    if (style === "retro") {
      // Add brick texture pattern
      this.ctx.fillStyle = mortarColor;

      // Horizontal mortar lines
      const brickHeight = Math.floor(height / 3);
      for (let i = 1; i < 3; i++) {
        this.ctx.fillRect(0, i * brickHeight - 1, width, 1);
      }

      // Vertical mortar lines (offset for brick pattern)
      const brickWidth = Math.floor(width / 4);
      for (let row = 0; row < 3; row++) {
        const offset = (row % 2) * (brickWidth / 2);
        for (let i = 1; i < 4; i++) {
          const x = (i * brickWidth + offset) % width;
          this.ctx.fillRect(x, row * brickHeight, 1, brickHeight);
        }
      }
    }

    return this.canvas;
  }

  private generatePlayer(config: SpriteConfig): HTMLCanvasElement {
    const { width, height, colors } = config;
    const primaryColor = colors[0] || "#00FF00";
    const secondaryColor = colors[1] || "#008800";

    // Simple player sprite - rectangle with some detail
    this.ctx.fillStyle = primaryColor;
    this.ctx.fillRect(0, 0, width, height);

    // Add some detail
    this.ctx.fillStyle = secondaryColor;
    this.ctx.fillRect(1, 1, width - 2, height - 2);

    return this.canvas;
  }

  private generateEnemy(config: SpriteConfig): HTMLCanvasElement {
    const { width, height, colors } = config;
    const primaryColor = colors[0] || "#FF0000";
    const secondaryColor = colors[1] || "#880000";

    // Simple enemy sprite
    this.ctx.fillStyle = primaryColor;
    this.ctx.fillRect(0, 0, width, height);

    // Add some detail
    this.ctx.fillStyle = secondaryColor;
    this.ctx.fillRect(1, 1, width - 2, height - 2);

    return this.canvas;
  }

  private generateProjectile(config: SpriteConfig): HTMLCanvasElement {
    const { width, height, colors } = config;
    const primaryColor = colors[0] || "#FFFF00";

    // Simple projectile - small rectangle or circle
    this.ctx.fillStyle = primaryColor;
    if (width === height) {
      // Square projectile
      this.ctx.fillRect(0, 0, width, height);
    } else {
      // Rectangular projectile
      this.ctx.fillRect(0, 0, width, height);
    }

    return this.canvas;
  }

  private generatePowerup(config: SpriteConfig): HTMLCanvasElement {
    const { width, height, colors } = config;
    const primaryColor = colors[0] || "#FF00FF";
    const secondaryColor = colors[1] || "#FFFF00";

    // Powerup with alternating pattern
    this.ctx.fillStyle = primaryColor;
    this.ctx.fillRect(0, 0, width, height);

    // Add pattern
    this.ctx.fillStyle = secondaryColor;
    for (let x = 0; x < width; x += 2) {
      for (let y = 0; y < height; y += 2) {
        if ((x + y) % 4 === 0) {
          this.ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    return this.canvas;
  }

  private generateGeneric(config: SpriteConfig): HTMLCanvasElement {
    const { width, height, colors } = config;
    const primaryColor = colors[0] || "#FFFFFF";

    this.ctx.fillStyle = primaryColor;
    this.ctx.fillRect(0, 0, width, height);

    return this.canvas;
  }

  // Utility methods
  private drawPixelCircle(
    centerX: number,
    centerY: number,
    radius: number,
    color: string
  ): void {
    this.ctx.fillStyle = color;

    // Bresenham-like circle algorithm for pixel-perfect circles
    for (let x = -radius; x <= radius; x++) {
      for (let y = -radius; y <= radius; y++) {
        if (x * x + y * y <= radius * radius) {
          this.ctx.fillRect(centerX + x, centerY + y, 1, 1);
        }
      }
    }
  }

  private lightenColor(color: string, amount: number): string {
    // Convert hex to RGB, lighten, convert back
    const hex = color.replace("#", "");
    const r = Math.min(
      255,
      parseInt(hex.substr(0, 2), 16) + Math.floor(255 * amount)
    );
    const g = Math.min(
      255,
      parseInt(hex.substr(2, 2), 16) + Math.floor(255 * amount)
    );
    const b = Math.min(
      255,
      parseInt(hex.substr(4, 2), 16) + Math.floor(255 * amount)
    );

    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  private darkenColor(color: string, amount: number): string {
    // Similar to lightenColor but subtract
    const hex = color.replace("#", "");
    const r = Math.max(
      0,
      parseInt(hex.substr(0, 2), 16) - Math.floor(255 * amount)
    );
    const g = Math.max(
      0,
      parseInt(hex.substr(2, 2), 16) - Math.floor(255 * amount)
    );
    const b = Math.max(
      0,
      parseInt(hex.substr(4, 2), 16) - Math.floor(255 * amount)
    );

    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }
}
