#!/usr/bin/env bun

import { GameEngine } from '../../src/engine/core';
import { Renderer } from '../../src/engine/renderer';
import { InputManager } from '../../src/engine/input/inputManager';
import { World } from '../../src/ecs/world';
import { MovementSystem } from '../../src/systems/movementSystem';
import { CollisionSystem } from '../../src/systems/collisionSystem';
import { RenderSystem } from '../../src/systems/renderSystem';
import { ComponentTypes } from '../../src/components';
import type { Position, Velocity, Dimensions, Sprite, Collider, PlayerControlled } from '../../src/components';

class PongGame {
  private engine: GameEngine;
  private renderer: Renderer;
  private input: InputManager;
  private world: World;
  private movementSystem: MovementSystem;
  private collisionSystem: CollisionSystem;
  private renderSystem: RenderSystem;
  
  private player1Paddle!: number;
  private player2Paddle!: number;
  private ball!: number;
  private player1Score: number = 0;
  private player2Score: number = 0;
  
  private readonly PADDLE_SPEED = 15;
  private readonly BALL_SPEED = 20;
  private readonly PADDLE_WIDTH = 1;
  private readonly PADDLE_HEIGHT = 5;
  private readonly SCREEN_WIDTH = 60;
  private readonly SCREEN_HEIGHT = 20;

  constructor() {
    this.engine = new GameEngine({
      fps: 60,
      width: this.SCREEN_WIDTH,
      height: this.SCREEN_HEIGHT
    });
    
    this.renderer = new Renderer(this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
    this.input = new InputManager();
    this.world = new World();
    
    this.movementSystem = new MovementSystem();
    this.collisionSystem = new CollisionSystem();
    this.renderSystem = new RenderSystem(this.renderer);
    
    this.setupInput();
    this.createEntities();
    this.setupEventListeners();
  }
  
  private setupInput(): void {
    // Player 1 controls
    this.input.mapKey('w', 'p1_up');
    this.input.mapKey('s', 'p1_down');
    
    // Player 2 controls  
    this.input.mapKey('i', 'p2_up');
    this.input.mapKey('k', 'p2_down');
    
    // Quit
    this.input.mapKey('q', 'quit');
    
    this.input.on('quit', () => {
      this.stop();
    });
  }
  
  private createEntities(): void {
    // Player 1 paddle (left)
    this.player1Paddle = this.world.createEntity();
    this.world.addComponent(this.player1Paddle, ComponentTypes.Position, {
      x: 2,
      y: this.SCREEN_HEIGHT / 2 - this.PADDLE_HEIGHT / 2
    } as Position);
    this.world.addComponent(this.player1Paddle, ComponentTypes.Velocity, {
      vx: 0,
      vy: 0
    } as Velocity);
    this.world.addComponent(this.player1Paddle, ComponentTypes.Dimensions, {
      width: this.PADDLE_WIDTH,
      height: this.PADDLE_HEIGHT
    } as Dimensions);
    this.world.addComponent(this.player1Paddle, ComponentTypes.Sprite, {
      chars: '█',
      color: 'white'
    } as Sprite);
    this.world.addComponent(this.player1Paddle, ComponentTypes.Collider, {
      type: 'AABB',
      active: true
    } as Collider);
    this.world.addComponent(this.player1Paddle, ComponentTypes.PlayerControlled, {
      upKey: 'p1_up',
      downKey: 'p1_down'
    } as PlayerControlled);
    
    // Player 2 paddle (right)
    this.player2Paddle = this.world.createEntity();
    this.world.addComponent(this.player2Paddle, ComponentTypes.Position, {
      x: this.SCREEN_WIDTH - 3,
      y: this.SCREEN_HEIGHT / 2 - this.PADDLE_HEIGHT / 2
    } as Position);
    this.world.addComponent(this.player2Paddle, ComponentTypes.Velocity, {
      vx: 0,
      vy: 0
    } as Velocity);
    this.world.addComponent(this.player2Paddle, ComponentTypes.Dimensions, {
      width: this.PADDLE_WIDTH,
      height: this.PADDLE_HEIGHT
    } as Dimensions);
    this.world.addComponent(this.player2Paddle, ComponentTypes.Sprite, {
      chars: '█',
      color: 'white'
    } as Sprite);
    this.world.addComponent(this.player2Paddle, ComponentTypes.Collider, {
      type: 'AABB',
      active: true
    } as Collider);
    this.world.addComponent(this.player2Paddle, ComponentTypes.PlayerControlled, {
      upKey: 'p2_up',
      downKey: 'p2_down'
    } as PlayerControlled);
    
    // Ball
    this.ball = this.world.createEntity();
    this.world.addComponent(this.ball, ComponentTypes.Position, {
      x: this.SCREEN_WIDTH / 2,
      y: this.SCREEN_HEIGHT / 2
    } as Position);
    this.world.addComponent(this.ball, ComponentTypes.Velocity, {
      vx: this.BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
      vy: this.BALL_SPEED * (Math.random() - 0.5) * 0.5
    } as Velocity);
    this.world.addComponent(this.ball, ComponentTypes.Dimensions, {
      width: 1,
      height: 1
    } as Dimensions);
    this.world.addComponent(this.ball, ComponentTypes.Sprite, {
      chars: '●',
      color: 'white'
    } as Sprite);
    this.world.addComponent(this.ball, ComponentTypes.Collider, {
      type: 'AABB',
      active: true
    } as Collider);
  }
  
  private setupEventListeners(): void {
    this.engine.on('fixedUpdate', (deltaTime: number) => {
      this.handleInput();
      this.movementSystem.update(this.world, deltaTime);
      this.checkBoundaries();
      this.checkPaddleBallCollisions();
      this.checkGoals();
    });
    
    this.engine.on('render', (interpolation: number) => {
      this.renderSystem.update(this.world, interpolation);
      this.renderScore();
    });
    
    this.engine.on('fpsUpdate', (fps: number) => {
      process.stdout.write(`\x1b[${this.SCREEN_HEIGHT + 2};0HFPS: ${fps}  Score: ${this.player1Score} - ${this.player2Score}\x1b[K`);
    });
  }
  
  private handleInput(): void {
    const players = this.world.query(ComponentTypes.PlayerControlled, ComponentTypes.Velocity);
    
    for (const entity of players) {
      const control = this.world.getComponent(entity, ComponentTypes.PlayerControlled) as PlayerControlled | undefined;
      const velocity = this.world.getComponent(entity, ComponentTypes.Velocity) as Velocity | undefined;
      
      if (!control || !velocity) continue;
      
      if (this.input.isKeyPressed(control.upKey)) {
        velocity.vy = -this.PADDLE_SPEED;
      } else if (this.input.isKeyPressed(control.downKey)) {
        velocity.vy = this.PADDLE_SPEED;
      } else {
        velocity.vy = 0;
      }
    }
  }
  
  private checkBoundaries(): void {
    // Check paddle boundaries
    const paddles = [this.player1Paddle, this.player2Paddle];
    
    for (const paddle of paddles) {
      const pos = this.world.getComponent(paddle, ComponentTypes.Position) as Position | undefined;
      const dim = this.world.getComponent(paddle, ComponentTypes.Dimensions) as Dimensions | undefined;
      
      if (pos && dim) {
        if (pos.y < 0) pos.y = 0;
        if (pos.y + dim.height > this.SCREEN_HEIGHT) {
          pos.y = this.SCREEN_HEIGHT - dim.height;
        }
      }
    }
    
    // Check ball boundaries (top and bottom)
    const ballPos = this.world.getComponent(this.ball, ComponentTypes.Position) as Position | undefined;
    const ballVel = this.world.getComponent(this.ball, ComponentTypes.Velocity) as Velocity | undefined;
    
    if (ballPos && ballVel) {
      if (ballPos.y <= 0 || ballPos.y >= this.SCREEN_HEIGHT - 1) {
        ballVel.vy = -ballVel.vy;
      }
    }
  }
  
  private checkPaddleBallCollisions(): void {
    const ballPos = this.world.getComponent(this.ball, ComponentTypes.Position) as Position | undefined;
    const ballVel = this.world.getComponent(this.ball, ComponentTypes.Velocity) as Velocity | undefined;
    const ballDim = this.world.getComponent(this.ball, ComponentTypes.Dimensions) as Dimensions | undefined;
    
    if (!ballPos || !ballVel || !ballDim) return;
    
    const paddles = [this.player1Paddle, this.player2Paddle];
    
    for (const paddle of paddles) {
      const paddlePos = this.world.getComponent(paddle, ComponentTypes.Position) as Position | undefined;
      const paddleDim = this.world.getComponent(paddle, ComponentTypes.Dimensions) as Dimensions | undefined;
      
      if (!paddlePos || !paddleDim) continue;
      
      if (this.collisionSystem.checkCollision(ballPos, ballDim, paddlePos, paddleDim)) {
        // Reverse ball X velocity and add some spin based on where it hit the paddle
        ballVel.vx = -ballVel.vx;
        
        const paddleCenter = paddlePos.y + paddleDim.height / 2;
        const ballCenter = ballPos.y + ballDim.height / 2;
        const diff = ballCenter - paddleCenter;
        ballVel.vy = diff * 2;
        
        // Move ball out of paddle to prevent stuck collision
        if (ballVel.vx > 0) {
          ballPos.x = paddlePos.x + paddleDim.width;
        } else {
          ballPos.x = paddlePos.x - ballDim.width;
        }
      }
    }
  }
  
  private checkGoals(): void {
    const ballPos = this.world.getComponent(this.ball, ComponentTypes.Position) as Position | undefined;
    const ballVel = this.world.getComponent(this.ball, ComponentTypes.Velocity) as Velocity | undefined;
    
    if (!ballPos || !ballVel) return;
    
    if (ballPos.x < 0) {
      // Player 2 scores
      this.player2Score++;
      this.resetBall();
    } else if (ballPos.x > this.SCREEN_WIDTH) {
      // Player 1 scores
      this.player1Score++;
      this.resetBall();
    }
  }
  
  private resetBall(): void {
    const ballPos = this.world.getComponent(this.ball, ComponentTypes.Position) as Position | undefined;
    const ballVel = this.world.getComponent(this.ball, ComponentTypes.Velocity) as Velocity | undefined;
    
    if (ballPos && ballVel) {
      ballPos.x = this.SCREEN_WIDTH / 2;
      ballPos.y = this.SCREEN_HEIGHT / 2;
      ballVel.vx = this.BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
      ballVel.vy = this.BALL_SPEED * (Math.random() - 0.5) * 0.5;
    }
  }
  
  private renderScore(): void {
    // Score is rendered in the fpsUpdate event
  }
  
  start(): void {
    console.clear();
    console.log('Starting Pong!');
    console.log('Controls:');
    console.log('Player 1: W/S');
    console.log('Player 2: I/K');
    console.log('Press Q to quit');
    console.log('Press any key to start...');
    
    process.stdin.once('data', () => {
      this.engine.start();
    });
  }
  
  stop(): void {
    this.engine.stop();
    this.input.destroy();
    console.clear();
    console.log('Thanks for playing!');
    console.log(`Final Score: ${this.player1Score} - ${this.player2Score}`);
    process.exit(0);
  }
}

// Start the game
const game = new PongGame();
game.start();