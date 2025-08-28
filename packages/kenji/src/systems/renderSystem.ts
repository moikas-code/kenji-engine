import { World } from '../ecs/world';
import { Renderer } from '../engine/renderer';
import { ComponentTypes } from '../components';
import type { Position, Dimensions, Sprite } from '../components';

export class RenderSystem {
  private renderer: Renderer;

  constructor(renderer: Renderer) {
    this.renderer = renderer;
  }

  update(world: World, _interpolation: number): void {
    this.renderer.clear();
    
    const entities = world.query(ComponentTypes.Position, ComponentTypes.Sprite);
    
    for (const entity of entities) {
      const position = world.getComponent(entity, ComponentTypes.Position) as Position | undefined;
      const sprite = world.getComponent(entity, ComponentTypes.Sprite) as Sprite | undefined;
      const dimensions = world.getComponent(entity, ComponentTypes.Dimensions) as Dimensions | undefined;
      
      if (!position || !sprite) continue;
      
      if (dimensions) {
        // Draw filled rectangle for entities with dimensions
        for (let dy = 0; dy < dimensions.height; dy++) {
          for (let dx = 0; dx < dimensions.width; dx++) {
            this.renderer.drawChar(
              position.x + dx,
              position.y + dy,
              sprite.chars,
              sprite.color
            );
          }
        }
      } else {
        // Draw single character sprite
        this.renderer.drawString(position.x, position.y, sprite.chars, sprite.color);
      }
    }
    
    const output = this.renderer.flip();
    if (output) {
      console.log(output);
    }
  }
}