import { System } from "../ecs/System";
import { Entity } from "../ecs/Entity";
import { Transform2D } from "../components/Transform2D";
import { Sprite2D } from "../components/Sprite2D";
import { IRenderer } from "../rendering/IRenderer";

export class RenderSystem extends System {
  requiredComponents = [Transform2D, Sprite2D];

  constructor(private renderer: IRenderer) {
    super();
    this.priority = 1000; // Render last
  }

  update(deltaTime: number, entities: Entity[]): void {
    // Sort by z-index or layer if needed
    entities.forEach((entity) => {
      const transform = entity.getComponent(Transform2D)!;
      const sprite = entity.getComponent(Sprite2D)!;

      this.renderer.drawSprite(sprite.texture!, transform.x, transform.y, {
        width: sprite.width,
        height: sprite.height,
        rotation: transform.rotation,
        scaleX: transform.scaleX,
        scaleY: transform.scaleY,
      });
    });
  }
}
