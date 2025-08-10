// Simplified OpenTUI-compatible buffer that works without Zig
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
    return `rgba(${Math.floor(this.r * 255)}, ${Math.floor(
      this.g * 255
    )}, ${Math.floor(this.b * 255)}, ${this.a})`;
  }
}

export interface BufferCell {
  char: string;
  fg: RGBA;
  bg: RGBA;
}

export class OptimizedBuffer {
  private buffer: BufferCell[][];
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.buffer = this.createBuffer();
  }

  private createBuffer(): BufferCell[][] {
    const buffer: BufferCell[][] = [];
    for (let y = 0; y < this.height; y++) {
      buffer[y] = [];
      for (let x = 0; x < this.width; x++) {
        buffer[y][x] = {
          char: " ",
          fg: RGBA.fromValues(1, 1, 1, 1),
          bg: RGBA.fromValues(0, 0, 0, 1),
        };
      }
    }
    return buffer;
  }

  clear(): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.buffer[y][x].char = " ";
        this.buffer[y][x].fg = RGBA.fromValues(1, 1, 1, 1);
        this.buffer[y][x].bg = RGBA.fromValues(0, 0, 0, 1);
      }
    }
  }

  drawText(text: string, x: number, y: number, color: RGBA): void {
    if (y < 0 || y >= this.height) return;

    for (let i = 0; i < text.length; i++) {
      const posX = x + i;
      if (posX < 0 || posX >= this.width) continue;

      this.buffer[y][posX].char = text[i];
      this.buffer[y][posX].fg = color;
    }
  }

  drawChar(char: string, x: number, y: number, fg: RGBA, bg?: RGBA): void {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;

    this.buffer[y][x].char = char;
    this.buffer[y][x].fg = fg;
    if (bg) this.buffer[y][x].bg = bg;
  }

  drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    char: string,
    color: RGBA
  ): void {
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        this.drawChar(char, x + dx, y + dy, color);
      }
    }
  }

  drawBorder(
    x: number,
    y: number,
    width: number,
    height: number,
    color: RGBA
  ): void {
    // Top and bottom borders
    for (let dx = 0; dx < width; dx++) {
      this.drawChar("─", x + dx, y, color);
      this.drawChar("─", x + dx, y + height - 1, color);
    }

    // Left and right borders
    for (let dy = 0; dy < height; dy++) {
      this.drawChar("│", x, y + dy, color);
      this.drawChar("│", x + width - 1, y + dy, color);
    }

    // Corners
    this.drawChar("┌", x, y, color);
    this.drawChar("┐", x + width - 1, y, color);
    this.drawChar("└", x, y + height - 1, color);
    this.drawChar("┘", x + width - 1, y + height - 1, color);
  }

  toString(): string {
    let output = "";
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        output += this.buffer[y][x].char;
      }
      if (y < this.height - 1) output += "\n";
    }
    return output;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }
}
