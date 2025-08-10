import { Component } from "../ecs/Component";
import { UITextStyle } from "./UIText";

export interface UIButtonStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  hoverBackgroundColor?: string;
  hoverBorderColor?: string;
  pressedBackgroundColor?: string;
  pressedBorderColor?: string;
}

export class UIButton extends Component {
  public text: string;
  public textStyle: UITextStyle;
  public buttonStyle: UIButtonStyle;
  public width: number;
  public height: number;
  public visible: boolean = true;
  public enabled: boolean = true;
  public layer: number = 0;

  // State
  public isHovered: boolean = false;
  public isPressed: boolean = false;

  // Callbacks
  public onClick?: () => void;
  public onHover?: () => void;
  public onUnhover?: () => void;

  constructor(
    text: string,
    width: number,
    height: number,
    textStyle: UITextStyle = {},
    buttonStyle: UIButtonStyle = {}
  ) {
    super();
    this.text = text;
    this.width = width;
    this.height = height;

    this.textStyle = {
      font: "Arial",
      fontSize: 16,
      color: "#FFFFFF",
      textAlign: "center",
      textBaseline: "middle",
      ...textStyle,
    };

    this.buttonStyle = {
      backgroundColor: "#333333",
      borderColor: "#666666",
      borderWidth: 2,
      borderRadius: 4,
      padding: { top: 8, right: 16, bottom: 8, left: 16 },
      hoverBackgroundColor: "#444444",
      hoverBorderColor: "#888888",
      pressedBackgroundColor: "#222222",
      pressedBorderColor: "#AAAAAA",
      ...buttonStyle,
    };
  }

  setText(text: string): void {
    this.text = text;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.isHovered = false;
      this.isPressed = false;
    }
  }
}
