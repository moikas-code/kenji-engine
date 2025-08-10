import { World } from "../ecs/World";

export interface DrawOptions {
  width?: number;
  height?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
}

export interface IRenderer {
  initialize(): Promise<void>;
  clear(): void;
  render(world: World): void;
  drawSprite(
    texture: HTMLCanvasElement | HTMLImageElement,
    x: number,
    y: number,
    options?: DrawOptions
  ): void;
  drawColorSprite(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    options?: DrawOptions
  ): void;
}
