export class InputManager {
  private keys = new Map<string, boolean>();
  private previousKeys = new Map<string, boolean>();
  private mouse = { x: 0, y: 0, buttons: new Map<number, boolean>() };
  private previousMouse = { buttons: new Map<number, boolean>() };

  constructor(private canvas: HTMLCanvasElement) {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Check if we're in a browser environment
    if (typeof window === "undefined" || typeof document === "undefined") {
      console.warn(
        "InputManager: Running in non-browser environment, input disabled"
      );
      return;
    }

    // Keyboard events
    window.addEventListener("keydown", (e) => {
      this.keys.set(e.code, true);
    });

    window.addEventListener("keyup", (e) => {
      this.keys.set(e.code, false);
    });

    // Mouse events (only if canvas is available)
    if (this.canvas && this.canvas.addEventListener) {
      this.canvas.addEventListener("mousemove", (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
      });

      this.canvas.addEventListener("mousedown", (e) => {
        this.mouse.buttons.set(e.button, true);
      });

      this.canvas.addEventListener("mouseup", (e) => {
        this.mouse.buttons.set(e.button, false);
      });

      // Prevent context menu on right click
      this.canvas.addEventListener("contextmenu", (e) => {
        e.preventDefault();
      });
    }
  }

  update(): void {
    // Update previous state for frame-based input detection
    this.previousKeys.clear();
    this.keys.forEach((value, key) => {
      this.previousKeys.set(key, value);
    });

    this.previousMouse.buttons.clear();
    this.mouse.buttons.forEach((value, key) => {
      this.previousMouse.buttons.set(key, value);
    });
  }

  // Key input methods
  isKeyDown(key: string): boolean {
    return this.keys.get(key) || false;
  }

  isKeyPressed(key: string): boolean {
    return (
      (this.keys.get(key) || false) && !(this.previousKeys.get(key) || false)
    );
  }

  isKeyReleased(key: string): boolean {
    return (
      !(this.keys.get(key) || false) && (this.previousKeys.get(key) || false)
    );
  }

  // Mouse input methods
  getMousePosition(): { x: number; y: number } {
    return { x: this.mouse.x, y: this.mouse.y };
  }

  isMouseButtonDown(button: number): boolean {
    return this.mouse.buttons.get(button) || false;
  }

  isMouseButtonPressed(button: number): boolean {
    return (
      (this.mouse.buttons.get(button) || false) &&
      !(this.previousMouse.buttons.get(button) || false)
    );
  }

  isMouseButtonReleased(button: number): boolean {
    return (
      !(this.mouse.buttons.get(button) || false) &&
      (this.previousMouse.buttons.get(button) || false)
    );
  }
}
