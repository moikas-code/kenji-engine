import {
  World,
  Entity,
  Transform2D,
  Velocity2D,
  Sprite2D,
  Collider2D,
} from "@kenji-engine/core";

export class SimpleBreakoutGame {
  initialize(world: World): void {
    this.createPaddle(world);
    this.createBall(world);
    this.createBricks(world);
  }

  private createPaddle(world: World): void {
    const paddle = new Entity()
      .addComponent(new Transform2D(400, 550))
      .addComponent(new Velocity2D(0, 0))
      .addComponent(new Sprite2D(80, 10, "#FFFFFF"))
      .addComponent(new Collider2D(80, 10));

    world.addEntity(paddle);
  }

  private createBall(world: World): void {
    const ball = new Entity()
      .addComponent(new Transform2D(400, 300))
      .addComponent(new Velocity2D(200, -200))
      .addComponent(new Sprite2D(10, 10, "#FFFF00"))
      .addComponent(new Collider2D(10, 10));

    world.addEntity(ball);
  }

  private createBricks(world: World): void {
    const colors = ["#FF0000", "#FF8800", "#FFFF00", "#00FF00", "#0088FF"];

    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 10; col++) {
        const brick = new Entity()
          .addComponent(new Transform2D(80 + col * 64, 50 + row * 32))
          .addComponent(new Sprite2D(60, 30, colors[row]))
          .addComponent(new Collider2D(60, 30));

        world.addEntity(brick);
      }
    }
  }
}
