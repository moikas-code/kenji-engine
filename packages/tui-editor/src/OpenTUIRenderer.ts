import { Renderable } from "./Renderable";
import { OptimizedBuffer } from "./OptimizedBuffer";

class RootRenderable extends Renderable {
  protected renderSelf(buffer: OptimizedBuffer): void {
    // Root doesn't render anything itself
  }
}

export class OpenTUIRenderer {
  private root: Renderable;
  private buffer: OptimizedBuffer;

  constructor(width: number, height: number) {
    this.buffer = new OptimizedBuffer(width, height);
    this.root = new RootRenderable("root", {
      x: 0,
      y: 0,
      width,
      height,
      zIndex: 0,
    });
  }

  add(renderable: Renderable): void {
    this.root.add(renderable);
  }

  remove(renderable: Renderable): void {
    this.root.remove(renderable);
  }

  render(): string {
    this.buffer.clear();
    this.root.render(this.buffer);
    return this.buffer.toString();
  }

  resize(width: number, height: number): void {
    this.buffer = new OptimizedBuffer(width, height);
    this.root.resize(width, height);
  }

  handleInput(key: string): boolean {
    return this.root.handleInput(key);
  }

  getRoot(): Renderable {
    return this.root;
  }
}
