import { RGBA } from "./types";

export interface BufferCell {
  char: string;
  fg: RGBA;
  bg: RGBA;
  dirty: boolean;
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
          dirty: false,
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
        this.buffer[y][x].dirty = true;
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
      this.buffer[y][posX].dirty = true;
    }
  }

  drawChar(char: string, x: number, y: number, fg: RGBA, bg?: RGBA): void {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;

    this.buffer[y][x].char = char;
    this.buffer[y][x].fg = fg;
    if (bg) this.buffer[y][x].bg = bg;
    this.buffer[y][x].dirty = true;
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
