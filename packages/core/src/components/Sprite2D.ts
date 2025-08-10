import { Component } from "../ecs/Component";

export class Sprite2D extends Component {
  constructor(
    public width: number,
    public height: number,
    public color: string = "#FFFFFF",
    public texture?: HTMLCanvasElement | HTMLImageElement,
    public offsetX: number = 0,
    public offsetY: number = 0
  ) {
    super();
  }
}
