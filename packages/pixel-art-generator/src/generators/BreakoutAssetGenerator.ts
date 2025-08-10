import { PixelArtGenerator } from '../PixelArtGenerator';

export interface BreakoutAssets {
  paddle: HTMLCanvasElement;
  ball: HTMLCanvasElement;
  brick: HTMLCanvasElement;
}

export class BreakoutAssetGenerator {
  static async generateAll(): Promise<BreakoutAssets> {
    const generator = new PixelArtGenerator();
    
    const paddle = await generator.generateSprite({
      type: 'paddle',
      width: 32,
      height: 8,
      colors: ['#FFFFFF', '#CCCCCC', '#888888'],
      style: 'retro'
    });

    const ball = await generator.generateSprite({
      type: 'ball',
      width: 8,
      height: 8,
      colors: ['#FFFFFF'],
      style: 'retro'
    });

    const brick = await generator.generateSprite({
      type: 'brick',
      width: 32,
      height: 16,
      colors: ['#FF6600', '#CC4400'],
      style: 'retro'
    });

    return { paddle, ball, brick };
  }
}