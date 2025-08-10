import { describe, test, expect, beforeEach } from "bun:test";
import { BrickCollisionSystem } from "../BrickCollisionSystem";
import { Entity } from "../../ecs/Entity";
import { Transform2D } from "../../components/Transform2D";
import { Velocity2D } from "../../components/Velocity2D";
import { Sprite2D } from "../../components/Sprite2D";

describe("BrickCollisionSystem", () => {
  let system: BrickCollisionSystem;
  let ball: Entity;
  let brick: Entity;
  let destroyedBricks: Entity[] = [];

  beforeEach(() => {
    destroyedBricks = [];
    system = new BrickCollisionSystem((brick) => {
      destroyedBricks.push(brick);
    });

    // Create mock canvas for sprites
    const mockCanvas = {
      width: 8,
      height: 8,
    } as HTMLCanvasElement;

    const mockBrickCanvas = {
      width: 60,
      height: 20,
    } as HTMLCanvasElement;

    // Create ball entity
    ball = new Entity()
      .addComponent(new Transform2D(100, 100))
      .addComponent(new Velocity2D(150, -200))
      .addComponent(new Sprite2D(mockCanvas))
      .addTag("ball");

    // Create brick entity
    brick = new Entity()
      .addComponent(new Transform2D(100, 80))
      .addComponent(new Sprite2D(mockBrickCanvas))
      .addTag("brick");
  });

  describe("Basic Collision Detection", () => {
    test("should detect collision when ball overlaps brick", () => {
      // Position ball to overlap with brick
      ball.getComponent(Transform2D)!.x = 100;
      ball.getComponent(Transform2D)!.y = 90; // Close to brick

      const entities = [ball, brick];
      system.update(0.016, entities);

      expect(destroyedBricks.length).toBe(1);
      expect(destroyedBricks[0]).toBe(brick);
      expect(brick.active).toBe(false);
    });

    test("should not detect collision when ball is far from brick", () => {
      // Position ball far from brick
      ball.getComponent(Transform2D)!.x = 200;
      ball.getComponent(Transform2D)!.y = 200;

      const entities = [ball, brick];
      system.update(0.016, entities);

      expect(destroyedBricks.length).toBe(0);
      expect(brick.active).toBe(true);
    });

    test("should not detect collision with inactive brick", () => {
      // Position ball to overlap with brick
      ball.getComponent(Transform2D)!.x = 100;
      ball.getComponent(Transform2D)!.y = 90;

      // Make brick inactive
      brick.active = false;

      const entities = [ball, brick];
      system.update(0.016, entities);

      expect(destroyedBricks.length).toBe(0);
    });
  });

  describe("Edge Case Collision Detection", () => {
    test("should handle ball exactly touching brick edge", () => {
      const ballSprite = ball.getComponent(Sprite2D)!;
      const brickTransform = brick.getComponent(Transform2D)!;
      const brickSprite = brick.getComponent(Sprite2D)!;

      // Position ball exactly touching right edge of brick
      ball.getComponent(Transform2D)!.x =
        brickTransform.x + brickSprite.width / 2 + ballSprite.width / 2;
      ball.getComponent(Transform2D)!.y = brickTransform.y;

      const entities = [ball, brick];
      system.update(0.016, entities);

      // Should not collide when just touching
      expect(destroyedBricks.length).toBe(0);
    });

    test("should handle ball with minimal overlap", () => {
      const brickTransform = brick.getComponent(Transform2D)!;
      const brickSprite = brick.getComponent(Sprite2D)!;

      // Position ball with minimal overlap
      ball.getComponent(Transform2D)!.x =
        brickTransform.x + brickSprite.width / 2 - 1;
      ball.getComponent(Transform2D)!.y = brickTransform.y;

      const entities = [ball, brick];
      system.update(0.016, entities);

      expect(destroyedBricks.length).toBe(1);
    });

    test("should handle ball completely inside brick", () => {
      // Position ball completely inside brick
      ball.getComponent(Transform2D)!.x = brick.getComponent(Transform2D)!.x;
      ball.getComponent(Transform2D)!.y = brick.getComponent(Transform2D)!.y;

      const entities = [ball, brick];
      system.update(0.016, entities);

      expect(destroyedBricks.length).toBe(1);
    });
  });

  describe("Physics Response", () => {
    test("should reflect ball velocity on collision", () => {
      const ballVelocity = ball.getComponent(Velocity2D)!;
      const originalVelocityY = ballVelocity.y;

      // Position for collision
      ball.getComponent(Transform2D)!.x = 100;
      ball.getComponent(Transform2D)!.y = 90;

      const entities = [ball, brick];
      system.update(0.016, entities);

      // Velocity should be modified
      expect(ballVelocity.y).not.toBe(originalVelocityY);
    });

    test("should limit ball speed to prevent tunneling", () => {
      const ballVelocity = ball.getComponent(Velocity2D)!;

      // Set extremely high velocity
      ballVelocity.x = 1000;
      ballVelocity.y = -1000;

      // Position for collision
      ball.getComponent(Transform2D)!.x = 100;
      ball.getComponent(Transform2D)!.y = 90;

      const entities = [ball, brick];
      system.update(0.016, entities);

      // Speed should be limited
      const speed = Math.sqrt(
        ballVelocity.x * ballVelocity.x + ballVelocity.y * ballVelocity.y
      );
      expect(speed).toBeLessThanOrEqual(400); // Max speed limit
    });
  });

  describe("Multiple Collision Handling", () => {
    test("should only process one collision per frame", () => {
      // Create multiple bricks
      const brick2 = new Entity()
        .addComponent(new Transform2D(100, 100))
        .addComponent(
          new Sprite2D({ width: 60, height: 20 } as HTMLCanvasElement)
        )
        .addTag("brick");

      const brick3 = new Entity()
        .addComponent(new Transform2D(100, 120))
        .addComponent(
          new Sprite2D({ width: 60, height: 20 } as HTMLCanvasElement)
        )
        .addTag("brick");

      // Position ball to potentially collide with all bricks
      ball.getComponent(Transform2D)!.x = 100;
      ball.getComponent(Transform2D)!.y = 100;

      const entities = [ball, brick, brick2, brick3];
      system.update(0.016, entities);

      // Should only destroy one brick per frame
      expect(destroyedBricks.length).toBeLessThanOrEqual(1);
    });
  });

  describe("Performance Tests", () => {
    test("should handle large number of bricks efficiently", () => {
      const bricks: Entity[] = [];

      // Create 100 bricks
      for (let i = 0; i < 100; i++) {
        const testBrick = new Entity()
          .addComponent(new Transform2D(i * 10, 80))
          .addComponent(
            new Sprite2D({ width: 60, height: 20 } as HTMLCanvasElement)
          )
          .addTag("brick");
        bricks.push(testBrick);
      }

      const entities = [ball, ...bricks];

      const startTime = performance.now();
      system.update(0.016, entities);
      const endTime = performance.now();

      // Should complete within reasonable time (< 1ms for 100 bricks)
      expect(endTime - startTime).toBeLessThan(1);
    });
  });

  describe("Coordinate System Tests", () => {
    test("should use center-based coordinates correctly", () => {
      const ballTransform = ball.getComponent(Transform2D)!;
      const ballSprite = ball.getComponent(Sprite2D)!;
      const brickTransform = brick.getComponent(Transform2D)!;
      const brickSprite = brick.getComponent(Sprite2D)!;

      // Test collision at specific coordinates
      ballTransform.x = brickTransform.x;
      ballTransform.y =
        brickTransform.y - brickSprite.height / 2 - ballSprite.height / 2 + 1; // Just overlapping

      const entities = [ball, brick];
      system.update(0.016, entities);

      expect(destroyedBricks.length).toBe(1);
    });
  });
});
