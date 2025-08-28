interface RenderBuffer {
  width: number;
  height: number;
  chars: string[][];
  colors: string[][];
}

export class Renderer {
  private width: number;
  private height: number;
  private frontBuffer: RenderBuffer;
  private backBuffer: RenderBuffer;
  private previousBuffer: RenderBuffer;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    
    this.frontBuffer = this.createBuffer();
    this.backBuffer = this.createBuffer();
    this.previousBuffer = this.createBuffer();
  }

  private createBuffer(): RenderBuffer {
    const chars: string[][] = [];
    const colors: string[][] = [];
    
    for (let y = 0; y < this.height; y++) {
      chars[y] = new Array(this.width).fill(' ');
      colors[y] = new Array(this.width).fill('white');
    }
    
    return {
      width: this.width,
      height: this.height,
      chars,
      colors
    };
  }

  clear(): void {
    for (let y = 0; y < this.height; y++) {
      const charRow = this.backBuffer.chars[y];
      const colorRow = this.backBuffer.colors[y];
      if (!charRow || !colorRow) continue;
      
      for (let x = 0; x < this.width; x++) {
        charRow[x] = ' ';
        colorRow[x] = 'white';
      }
    }
  }

  drawChar(x: number, y: number, char: string, color: string = 'white'): void {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    
    if (ix < 0 || ix >= this.width || iy < 0 || iy >= this.height) return;
    
    const charRow = this.backBuffer.chars[iy];
    const colorRow = this.backBuffer.colors[iy];
    if (!charRow || !colorRow) return;
    
    charRow[ix] = char;
    colorRow[ix] = color;
  }

  drawString(x: number, y: number, str: string, color: string = 'white'): void {
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (char) this.drawChar(x + i, y, char, color);
    }
  }

  drawBox(x: number, y: number, width: number, height: number, filled: boolean = false): void {
    const chars = {
      topLeft: '┌',
      topRight: '┐',
      bottomLeft: '└',
      bottomRight: '┘',
      horizontal: '─',
      vertical: '│',
      fill: '█'
    };

    if (filled) {
      for (let dy = 0; dy < height; dy++) {
        for (let dx = 0; dx < width; dx++) {
          this.drawChar(x + dx, y + dy, chars.fill);
        }
      }
    } else {
      this.drawChar(x, y, chars.topLeft);
      this.drawChar(x + width - 1, y, chars.topRight);
      this.drawChar(x, y + height - 1, chars.bottomLeft);
      this.drawChar(x + width - 1, y + height - 1, chars.bottomRight);
      
      for (let dx = 1; dx < width - 1; dx++) {
        this.drawChar(x + dx, y, chars.horizontal);
        this.drawChar(x + dx, y + height - 1, chars.horizontal);
      }
      
      for (let dy = 1; dy < height - 1; dy++) {
        this.drawChar(x, y + dy, chars.vertical);
        this.drawChar(x + width - 1, y + dy, chars.vertical);
      }
    }
  }

  flip(): string {
    const output: string[] = [];
    let hasChanges = false;
    
    for (let y = 0; y < this.height; y++) {
      const backChars = this.backBuffer.chars[y];
      const backColors = this.backBuffer.colors[y];
      const prevChars = this.previousBuffer.chars[y];
      const prevColors = this.previousBuffer.colors[y];
      const frontChars = this.frontBuffer.chars[y];
      const frontColors = this.frontBuffer.colors[y];
      
      if (!backChars || !backColors || !prevChars || !prevColors || !frontChars || !frontColors) continue;
      
      for (let x = 0; x < this.width; x++) {
        const backChar = backChars[x];
        const backColor = backColors[x];
        const prevChar = prevChars[x];
        const prevColor = prevColors[x];
        
        if (backChar !== prevChar || backColor !== prevColor) {
          hasChanges = true;
        }
        
        if (backChar !== undefined && backColor !== undefined) {
          frontChars[x] = backChar;
          frontColors[x] = backColor;
          prevChars[x] = backChar;
          prevColors[x] = backColor;
        }
      }
    }
    
    if (!hasChanges) return '';
    
    console.clear();
    
    for (let y = 0; y < this.height; y++) {
      const row = this.frontBuffer.chars[y];
      if (row) {
        output.push(row.join(''));
      }
    }
    
    return output.join('\n');
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }
}