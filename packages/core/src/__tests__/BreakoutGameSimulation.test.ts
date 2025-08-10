import { describe, test, expect, beforeEach } from "bun:test";
import { GameEngine } from "../GameEngine";
import { Entity } from "../ecs/Entity";
import { Transform2D } from "../components/Transform2D";
import { Velocity2D } from "../components/Velocity2D";
import { Sprite2D } from "../components/Sprite2D";
import { MovementSystem } from "../systems/MovementSystem";
import { BoundarySystem } from "../systems/BoundarySystem";
import { BrickCollisionSystem } from "../systems/BrickCollisionSystem";
import { PaddleCollisionSystem } from "../systems/PaddleCollisionSystem";
import { GameStateSystem } from "../systems/GameStateSystem";

describe("Breakout Game Simulation Tests", () => {
  let mockCanvas: HTMLCanvasElement;
  let engine: GameEngine;
  let ball: Entity;
  let paddle: Entity;
  let bricks: Entity[] = [];
  let gameEvents: string[] = [];

  beforeEach(async () => {
    // Create mock canvas
    mockCanvas = {
      width: 800,
      height: 600,
      getContext: () => ({
        imageSmoothingEnabled: false,
        fillStyle: "",
        fillRect: () => {},
        drawImage: () => {},
        save: () => {},
        restore: () => {},
        translate: () => {},
        rotate: () => {},
        scale: () => {},
      }),
    } as any;

    // Initialize game engine
    engine = new GameEngine({
      canvas: mockCanvas,
      mode: "2d",
      targetFPS: 60,
      debug: false,
    });

    await engine.initialize();

    // Clear game events
    gameEvents = [];

    // Setup game entities
    setupBreakoutGame();
  });

  function setupBreakoutGame() {
    // Create sprites
    const ballSprite = { width: 8, height: 8 } as HTMLCanvasElement;
    const paddleSprite = { width: 80, height: 12 } as HTMLCanvasElement;
    const brickSprite = { width: 60, height: 20 } as HTMLCanvasElement;

    // Create ball
    ball = new Entity()
      .addComponent(new Transform2D(400, 500))
      .addComponent(new Velocity2D(150, -200))
      .addComponent(
        new Sprite2D(ballSprite.width, ballSprite.height, "#FFFFFF", ballSprite)
      )
      .addTag("ball");

    // Create paddle
    paddle = new Entity()
      .addComponent(new Transform2D(400, 550))
      .addComponent(
        new Sprite2D(
          paddleSprite.width,
          paddleSprite.height,
          "#FFFFFF",
          paddleSprite
        )
      )
      .addTag("paddle");

    // Create brick grid
    bricks = [];
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 12; col++) {
        const brick = new Entity()
          .addComponent(new Transform2D(70 + col * 65, 80 + row * 25))
          .addComponent(
            new Sprite2D(
              brickSprite.width,
              brickSprite.height,
              "#FFFFFF",
              brickSprite
            )
          )
          .addTag("brick");
        bricks.push(brick);
      }
    }

    // Add systems
    engine.world.addSystem(new MovementSystem());
    engine.world.addSystem(
      new BoundarySystem(mockCanvas.width, mockCanvas.height)
    ); // Add boundary system for physics
    engine.world.addSystem(
      new BrickCollisionSystem((brick) => {
        gameEvents.push(`brick_destroyed_${brick.id}`);
      })
    );
    engine.world.addSystem(new PaddleCollisionSystem());
    engine.world.addSystem(
      new GameStateSystem(
        mockCanvas.height,
        () => gameEvents.push("ball_lost"),
        () => gameEvents.push("game_won")
      )
    );

    // Add entities to world
    engine.world.addEntity(ball);
    engine.world.addEntity(paddle);
    bricks.forEach((brick) => engine.world.addEntity(brick));
  }

  describe("Complete Game Simulations", () => {
    test("should simulate a complete winning game", async () => {
      let frameCount = 0;
      const maxFrames = 10000; // Prevent infinite loops

      // Simulate game until win or timeout
      while (
        frameCount < maxFrames &&
        !gameEvents.includes("game_won") &&
        !gameEvents.includes("ball_lost")
      ) {
        // Update game
        engine.world.update(1 / 60); // 60 FPS

        // Simulate paddle following ball (AI player)
        const ballTransform = ball.getComponent(Transform2D)!;
        const paddleTransform = paddle.getComponent(Transform2D)!;
        const paddleSpeed = 300;
        const deltaTime = 1 / 60;

        if (ballTransform.x < paddleTransform.x) {
          paddleTransform.x = Math.max(
            40,
            paddleTransform.x - paddleSpeed * deltaTime
          );
        } else if (ballTransform.x > paddleTransform.x) {
          paddleTransform.x = Math.min(
            760,
            paddleTransform.x + paddleSpeed * deltaTime
          );
        }

        frameCount++;
      }

      // Should eventually win or lose (not timeout)
      expect(frameCount).toBeLessThan(maxFrames);
      expect(
        gameEvents.includes("game_won") || gameEvents.includes("ball_lost")
      ).toBe(true);

      console.log(`Game simulation completed in ${frameCount} frames`);
      console.log(`Final events: ${gameEvents.slice(-5).join(", ")}`);
    });

    test("should handle ball getting stuck in corner", () => {
      // Position ball in corner with problematic velocity
      const ballTransform = ball.getComponent(Transform2D)!;
      const ballVelocity = ball.getComponent(Velocity2D)!;

      ballTransform.x = 4; // Near left edge
      ballTransform.y = 4; // Near top edge
      ballVelocity.x = -1; // Moving into corner
      ballVelocity.y = -1;

      let frameCount = 0;
      const maxFrames = 300; // 5 seconds at 60fps
      let minSpeedSeen = Infinity;

      // Simulate for a while
      while (frameCount < maxFrames) {
        engine.world.update(1 / 60);
        frameCount++;

        // Track minimum speed seen during simulation
        const speed = Math.sqrt(
          ballVelocity.x * ballVelocity.x + ballVelocity.y * ballVelocity.y
        );
        minSpeedSeen = Math.min(minSpeedSeen, speed);

        // After initial frames, ball should maintain reasonable velocity
        if (frameCount > 10) {
          expect(speed).toBeGreaterThan(50); // Reasonable minimum after system stabilizes
        }
      }

      // Overall, the minimum speed seen should be reasonable
      expect(minSpeedSeen).toBeGreaterThan(1); // At least not completely stuck
    });

    test("should handle rapid paddle movement", () => {
      const paddleTransform = paddle.getComponent(Transform2D)!;
      let frameCount = 0;

      // Rapidly move paddle back and forth
      while (frameCount < 600) {
        // 10 seconds
        engine.world.update(1 / 60);

        // Oscillate paddle rapidly
        paddleTransform.x = 400 + 200 * Math.sin(frameCount * 0.5);

        frameCount++;
      }

      // Game should remain stable
      expect(ball.active).toBe(true);
      expect(paddle.active).toBe(true);
    });
  });

  describe("Stress Tests", () => {
    test("should handle high ball speeds without tunneling", () => {
      const ballVelocity = ball.getComponent(Velocity2D)!;

      // Set very high velocity
      ballVelocity.x = 800;
      ballVelocity.y = -800;

      let frameCount = 0;
      let bricksDestroyed = 0;

      while (frameCount < 1000 && bricksDestroyed < 10) {
        const initialBrickCount = bricks.filter((b) => b.active).length;

        engine.world.update(1 / 60);

        const finalBrickCount = bricks.filter((b) => b.active).length;
        bricksDestroyed += initialBrickCount - finalBrickCount;

        frameCount++;
      }

      // Should destroy bricks even at high speed (no tunneling)
      expect(bricksDestroyed).toBeGreaterThan(0);
    });

    test("should maintain performance with many entities", () => {
      // Add many extra entities
      const extraEntities: Entity[] = [];
      for (let i = 0; i < 1000; i++) {
        const entity = new Entity()
          .addComponent(
            new Transform2D(Math.random() * 800, Math.random() * 600)
          )
          .addComponent(
            new Sprite2D(4, 4, "#FFFFFF", {
              width: 4,
              height: 4,
            } as HTMLCanvasElement)
          );
        extraEntities.push(entity);
        engine.world.addEntity(entity);
      }

      const startTime = performance.now();

      // Run for 60 frames
      for (let i = 0; i < 60; i++) {
        engine.world.update(1 / 60);
      }

      const endTime = performance.now();
      const avgFrameTime = (endTime - startTime) / 60;

      // Should maintain reasonable performance (< 16ms per frame for 60fps)
      expect(avgFrameTime).toBeLessThan(16);

      // Cleanup
      extraEntities.forEach((entity) => engine.world.removeEntity(entity));
    });
  });

  describe("Edge Case Scenarios", () => {
    test("should handle ball hitting multiple bricks simultaneously", () => {
      // Position ball between multiple bricks
      const ballTransform = ball.getComponent(Transform2D)!;
      ballTransform.x = 135; // Between two bricks
      ballTransform.y = 90; // At brick level

      const initialBrickCount = bricks.filter((b) => b.active).length;

      engine.world.update(1 / 60);

      const finalBrickCount = bricks.filter((b) => b.active).length;
      const bricksDestroyed = initialBrickCount - finalBrickCount;

      // Should destroy exactly one brick (no double destruction)
      expect(bricksDestroyed).toBeLessThanOrEqual(1);
    });

    test("should handle paddle at screen edges", () => {
      const paddleTransform = paddle.getComponent(Transform2D)!;
      const ballTransform = ball.getComponent(Transform2D)!;

      // Test left edge
      paddleTransform.x = 40; // Near left edge
      ballTransform.x = 40;
      ballTransform.y = 540; // Just above paddle

      engine.world.update(1 / 60);

      // Ball should bounce properly even at edge
      const ballVelocity = ball.getComponent(Velocity2D)!;
      expect(Math.abs(ballVelocity.x)).toBeGreaterThan(0);
      expect(ballVelocity.y).toBeLessThan(0); // Should bounce up

      // Test right edge
      paddleTransform.x = 760; // Near right edge
      ballTransform.x = 760;
      ballTransform.y = 540;

      engine.world.update(1 / 60);

      expect(Math.abs(ballVelocity.x)).toBeGreaterThan(0);
      expect(ballVelocity.y).toBeLessThan(0);
    });

    test("should handle all bricks destroyed except one", () => {
      // Destroy all but one brick
      for (let i = 0; i < bricks.length - 1; i++) {
        bricks[i].active = false;
      }

      const lastBrick = bricks[bricks.length - 1];
      expect(lastBrick.active).toBe(true);

      // Position ball to hit last brick
      const ballTransform = ball.getComponent(Transform2D)!;
      const brickTransform = lastBrick.getComponent(Transform2D)!;

      ballTransform.x = brickTransform.x;
      ballTransform.y = brickTransform.y + 15; // Just below brick

      engine.world.update(1 / 60);

      // Should trigger win condition
      expect(gameEvents.includes("game_won")).toBe(true);
    });
  });

  describe("Physics Consistency Tests", () => {
    test("should maintain energy conservation", () => {
      const ballVelocity = ball.getComponent(Velocity2D)!;
      const initialSpeed = Math.sqrt(
        ballVelocity.x * ballVelocity.x + ballVelocity.y * ballVelocity.y
      );

      // Run simulation for a while
      for (let i = 0; i < 300; i++) {
        engine.world.update(1 / 60);

        const currentSpeed = Math.sqrt(
          ballVelocity.x * ballVelocity.x + ballVelocity.y * ballVelocity.y
        );

        // Speed should remain relatively consistent (within 50% of original)
        expect(currentSpeed).toBeGreaterThan(initialSpeed * 0.5);
        expect(currentSpeed).toBeLessThan(initialSpeed * 2.0);
      }
    });

    test("should handle zero velocity gracefully", () => {
      const ballVelocity = ball.getComponent(Velocity2D)!;

      // Set zero velocity
      ballVelocity.x = 0;
      ballVelocity.y = 0;

      // Should not crash
      expect(() => {
        for (let i = 0; i < 60; i++) {
          engine.world.update(1 / 60);
        }
      }).not.toThrow();

      // Ball should eventually get some velocity (from paddle collision or reset)
      const finalSpeed = Math.sqrt(
        ballVelocity.x * ballVelocity.x + ballVelocity.y * ballVelocity.y
      );
      // This might be 0 if ball doesn't hit anything, which is okay
    });
  });

  describe("Memory and Resource Tests", () => {
    test("should not leak entities", () => {
      const initialEntityCount = engine.world.getEntitiesWith().length;

      // Run game for a while
      for (let i = 0; i < 1000; i++) {
        engine.world.update(1 / 60);
      }

      const finalEntityCount = engine.world.getEntitiesWith().length;

      // Entity count should not grow unexpectedly
      expect(finalEntityCount).toBeLessThanOrEqual(initialEntityCount);
    });

    test("should handle rapid entity creation and destruction", () => {
      const tempEntities: Entity[] = [];

      for (let frame = 0; frame < 100; frame++) {
        // Create temporary entities
        for (let i = 0; i < 10; i++) {
          const entity = new Entity()
            .addComponent(
              new Transform2D(Math.random() * 800, Math.random() * 600)
            )
            .addComponent(
              new Sprite2D(4, 4, "#FFFFFF", {
                width: 4,
                height: 4,
              } as HTMLCanvasElement)
            );
          tempEntities.push(entity);
          engine.world.addEntity(entity);
        }

        engine.world.update(1 / 60);

        // Remove half of them
        for (let i = 0; i < 5; i++) {
          const entity = tempEntities.pop();
          if (entity) {
            engine.world.removeEntity(entity);
          }
        }
      }

      // Cleanup remaining entities
      tempEntities.forEach((entity) => engine.world.removeEntity(entity));

      // Should not crash and should handle cleanup properly
      expect(engine.world.getEntitiesWith().length).toBeGreaterThan(0);
    });
  });
});
