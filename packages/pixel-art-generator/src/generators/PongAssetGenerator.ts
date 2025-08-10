import { PixelArtGenerator } from '../PixelArtGenerator';

export interface PongAssets {
  paddle: HTMLCanvasElement;
  ball: HTMLCanvasElement;
}

export class PongAssetGenerator {
  static async generateAll(): Promise<PongAssets> {
    const generator = new PixelArtGenerator();
    
    const paddle = await generator.generateSprite({
      type: 'paddle',
      width: 8,
      height: 32,
      colors: ['#FFFFFF'],
      style: 'retro'
    });

    const ball = await generator.generateSprite({
      type: 'ball',
      width: 8,
      height: 8,
      colors: ['#FFFFFF'],
      style: 'retro'
    });

    return { paddle, ball };
  }
}