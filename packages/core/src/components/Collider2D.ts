import { Component } from '../ecs/Component';
import { Transform2D } from './Transform2D';

export class Collider2D extends Component {
  constructor(
    public width: number,
    public height: number,
    public offsetX: number = 0,
    public offsetY: number = 0,
    public isTrigger: boolean = false
  ) {
    super();
  }

  getBounds(transform: Transform2D) {
    return {
      left: transform.x + this.offsetX,
      right: transform.x + this.offsetX + this.width,
      top: transform.y + this.offsetY,
      bottom: transform.y + this.offsetY + this.height
    };
  }
}