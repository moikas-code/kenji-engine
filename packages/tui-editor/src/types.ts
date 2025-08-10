export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface RenderableOptions extends Position, Partial<Size> {
  zIndex?: number;
  visible?: boolean;
}

export class RGBA {
  constructor(
    public r: number,
    public g: number,
    public b: number,
    public a: number = 1
  ) {}

  static fromValues(r: number, g: number, b: number, a: number = 1): RGBA {
    return new RGBA(r, g, b, a);
  }

  toString(): string {
    return `rgba(${this.r * 255}, ${this.g * 255}, ${this.b * 255}, ${this.a})`;
  }
}

export interface InputEvent {
  key: string;
  type: "keypress" | "mouse";
  handled: boolean;
}
