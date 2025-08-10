import { OptimizedBuffer } from "./OptimizedBuffer";
import { RenderableOptions, RGBA } from "./types";

export abstract class Renderable {
  protected id: string;
  protected x: number;
  protected y: number;
  protected width: number;
  protected height: number;
  protected zIndex: number;
  protected visible: boolean;
  protected children: Renderable[] = [];
  protected parent: Renderable | null = null;
  protected focused: boolean = false;

  constructor(id: string, options: RenderableOptions) {
    this.id = id;
    this.x = options.x;
    this.y = options.y;
    this.width = options.width || 0;
    this.height = options.height || 0;
    this.zIndex = options.zIndex || 0;
    this.visible = options.visible !== false;
  }

  add(child: Renderable): void {
    child.parent = this;
    this.children.push(child);
    this.children.sort((a, b) => a.zIndex - b.zIndex);
  }

  remove(child: Renderable): void {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      child.parent = null;
      this.children.splice(index, 1);
    }
  }

  render(buffer: OptimizedBuffer): void {
    if (!this.visible) return;

    this.renderSelf(buffer);

    for (const child of this.children) {
      child.render(buffer);
    }
  }

  protected abstract renderSelf(buffer: OptimizedBuffer): void;

  handleInput(key: string): boolean {
    // Handle input for focused children first
    for (const child of this.children) {
      if (child.focused && child.handleInput(key)) {
        return true;
      }
    }

    // Then handle input for all children
    for (const child of this.children) {
      if (!child.focused && child.handleInput(key)) {
        return true;
      }
    }

    return this.handleSelfInput(key);
  }

  protected handleSelfInput(key: string): boolean {
    return false;
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.onResize(width, height);

    for (const child of this.children) {
      child.onParentResize(width, height);
    }
  }

  protected onResize(width: number, height: number): void {
    // Override in subclasses
  }

  protected onParentResize(parentWidth: number, parentHeight: number): void {
    // Override in subclasses
  }

  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
  }

  setFocused(focused: boolean): void {
    this.focused = focused;
  }

  getId(): string {
    return this.id;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  getSize(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  isVisible(): boolean {
    return this.visible;
  }

  isFocused(): boolean {
    return this.focused;
  }

  getChildren(): Renderable[] {
    return [...this.children];
  }
}

export class Panel extends Renderable {
  private title: string;
  private borderColor: RGBA;
  private backgroundColor: RGBA;

  constructor(id: string, options: RenderableOptions & { title?: string }) {
    super(id, options);
    this.title = options.title || id;
    this.borderColor = RGBA.fromValues(0.5, 0.5, 0.5, 1);
    this.backgroundColor = RGBA.fromValues(0, 0, 0, 1);
  }

  protected renderSelf(buffer: OptimizedBuffer): void {
    // Draw background
    buffer.drawRect(
      this.x,
      this.y,
      this.width,
      this.height,
      " ",
      this.backgroundColor
    );

    // Draw border
    buffer.drawBorder(
      this.x,
      this.y,
      this.width,
      this.height,
      this.borderColor
    );

    // Draw title
    if (this.title) {
      const titleText = ` ${this.title} `;
      buffer.drawText(titleText, this.x + 2, this.y, this.borderColor);
    }
  }

  setTitle(title: string): void {
    this.title = title;
  }

  setBorderColor(color: RGBA): void {
    this.borderColor = color;
  }

  setBackgroundColor(color: RGBA): void {
    this.backgroundColor = color;
  }
}
