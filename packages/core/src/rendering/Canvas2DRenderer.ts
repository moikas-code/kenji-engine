import { IRenderer, DrawOptions } from "./IRenderer";
import { World } from "../ecs/World";
import { Transform2D } from "../components/Transform2D";
import { Sprite2D } from "../components/Sprite2D";

export class Canvas2DRenderer implements IRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(private canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not get 2D rendering context");
    }
    this.ctx = context;
    this.ctx.imageSmoothingEnabled = false; // Pixel-perfect rendering
  }

  async initialize(): Promise<void> {
    // Setup canvas for pixel art
    this.ctx.imageSmoothingEnabled = false;
    (this.ctx as any).webkitImageSmoothingEnabled = false;
    (this.ctx as any).mozImageSmoothingEnabled = false;
    (this.ctx as any).msImageSmoothingEnabled = false;
  }

  clear(): void {
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  render(world: World): void {
    const entities = world
      .getEntitiesWith(Transform2D, Sprite2D)
      .filter((entity) => entity.active); // Only render active entities

    entities.forEach((entity) => {
      const transform = entity.getComponent(Transform2D)!;
      const sprite = entity.getComponent(Sprite2D)!;

      const x = transform.x + sprite.offsetX;
      const y = transform.y + sprite.offsetY;

      if (sprite.texture) {
        // Render texture-based sprite
        this.drawSprite(sprite.texture, x, y, {
          width: sprite.width,
          height: sprite.height,
          rotation: transform.rotation,
          scaleX: transform.scaleX,
          scaleY: transform.scaleY,
        });
      } else {
        // Render color-based sprite
        this.drawColorSprite(x, y, sprite.width, sprite.height, sprite.color, {
          rotation: transform.rotation,
          scaleX: transform.scaleX,
          scaleY: transform.scaleY,
        });
      }
    });
  }

  drawSprite(
    texture: HTMLCanvasElement | HTMLImageElement,
    x: number,
    y: number,
    options: DrawOptions = {}
  ): void {
    const {
      width = texture.width,
      height = texture.height,
      rotation = 0,
      scaleX = 1,
      scaleY = 1,
    } = options;

    this.ctx.save();

    // Apply transformations
    this.ctx.translate(x + width / 2, y + height / 2);
    this.ctx.rotate(rotation);
    this.ctx.scale(scaleX, scaleY);

    // Draw the sprite
    this.ctx.drawImage(texture, -width / 2, -height / 2, width, height);

    this.ctx.restore();
  }

  drawColorSprite(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    options: DrawOptions = {}
  ): void {
    const { rotation = 0, scaleX = 1, scaleY = 1 } = options;

    this.ctx.save();

    // Apply transformations
    this.ctx.translate(x + width / 2, y + height / 2);
    this.ctx.rotate(rotation);
    this.ctx.scale(scaleX, scaleY);

    // Draw the color sprite
    this.ctx.fillStyle = color;
    this.ctx.fillRect(-width / 2, -height / 2, width, height);

    this.ctx.restore();
  }
}
