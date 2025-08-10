import { Component } from "../ecs/Component";

export interface UIPanelStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  opacity?: number;
  shadow?: {
    color: string;
    offsetX: number;
    offsetY: number;
    blur?: number;
  };
}

export class UIPanel extends Component {
  public width: number;
  public height: number;
  public style: UIPanelStyle;
  public visible: boolean = true;
  public layer: number = -1; // Panels typically render behind other UI elements

  constructor(width: number, height: number, style: UIPanelStyle = {}) {
    super();
    this.width = width;
    this.height = height;
    this.style = {
      backgroundColor: "#000000",
      borderColor: "#FFFFFF",
      borderWidth: 0,
      borderRadius: 0,
      opacity: 0.8,
      ...style,
    };
  }

  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  setStyle(style: Partial<UIPanelStyle>): void {
    this.style = { ...this.style, ...style };
  }
}
