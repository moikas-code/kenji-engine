import { Component } from '../ecs/Component';

export class Velocity2D extends Component {
  constructor(
    public x: number = 0,
    public y: number = 0,
    public maxSpeed?: number
  ) {
    super();
  }

  setVelocity(x: number, y: number): this {
    this.x = x;
    this.y = y;
    if (this.maxSpeed) {
      this.clampToMaxSpeed();
    }
    return this;
  }

  private clampToMaxSpeed(): void {
    if (!this.maxSpeed) return;
    const speed = Math.sqrt(this.x * this.x + this.y * this.y);
    if (speed > this.maxSpeed) {
      this.x = (this.x / speed) * this.maxSpeed;
      this.y = (this.y / speed) * this.maxSpeed;
    }
  }
}