import { Component } from '../ecs/Component';

export class Transform2D extends Component {
  constructor(
    public x: number = 0,
    public y: number = 0,
    public rotation: number = 0,
    public scaleX: number = 1,
    public scaleY: number = 1
  ) {
    super();
  }

  setPosition(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  translate(dx: number, dy: number): this {
    this.x += dx;
    this.y += dy;
    return this;
  }
}