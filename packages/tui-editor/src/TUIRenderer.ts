export interface TUIComponent {
  render(): string[];
  handleInput(key: string): boolean;
  getBounds(): { x: number; y: number; width: number; height: number };
}

export class TUIRenderer {
  private width: number;
  private height: number;
  private buffer: string[][];
  private components: TUIComponent[] = [];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.buffer = this.createBuffer();
  }

  private createBuffer(): string[][] {
    const buffer: string[][] = [];
    for (let y = 0; y < this.height; y++) {
      buffer[y] = new Array(this.width).fill(" ");
    }
    return buffer;
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.buffer = this.createBuffer();
  }

  addComponent(component: TUIComponent): void {
    this.components.push(component);
  }

  removeComponent(component: TUIComponent): void {
    const index = this.components.indexOf(component);
    if (index > -1) {
      this.components.splice(index, 1);
    }
  }

  clear(): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.buffer[y][x] = " ";
      }
    }
  }

  render(): string {
    this.clear();

    for (const component of this.components) {
      const bounds = component.getBounds();
      const lines = component.render();

      for (let y = 0; y < lines.length && y + bounds.y < this.height; y++) {
        const line = lines[y];
        for (let x = 0; x < line.length && x + bounds.x < this.width; x++) {
          if (bounds.y + y >= 0 && bounds.x + x >= 0) {
            this.buffer[bounds.y + y][bounds.x + x] = line[x];
          }
        }
      }
    }

    return this.buffer.map((row) => row.join("")).join("\n");
  }

  handleInput(key: string): boolean {
    for (const component of this.components) {
      if (component.handleInput(key)) {
        return true;
      }
    }
    return false;
  }

  getSize(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }
}
