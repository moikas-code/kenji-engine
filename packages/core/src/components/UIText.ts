import { Component } from "../ecs/Component";

export interface UITextStyle {
  font?: string;
  fontSize?: number;
  color?: string;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
  strokeColor?: string;
  strokeWidth?: number;
  shadow?: {
    color: string;
    offsetX: number;
    offsetY: number;
    blur?: number;
  };
}

export class UIText extends Component {
  public text: string;
  public style: UITextStyle;
  public visible: boolean = true;
  public layer: number = 0; // Higher numbers render on top

  constructor(text: string, style: UITextStyle = {}) {
    super();
    this.text = text;
    this.style = {
      font: "Arial",
      fontSize: 16,
      color: "#FFFFFF",
      textAlign: "left",
      textBaseline: "top",
      ...style,
    };
  }

  setText(text: string): void {
    this.text = text;
  }

  setStyle(style: Partial<UITextStyle>): void {
    this.style = { ...this.style, ...style };
  }
}
