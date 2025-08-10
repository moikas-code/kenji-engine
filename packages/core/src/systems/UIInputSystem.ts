import { System } from "../ecs/System";
import { Entity } from "../ecs/Entity";
import { Transform2D } from "../components/Transform2D";
import { UIButton } from "../components/UIButton";
import { InputManager } from "../input/InputManager";

export class UIInputSystem extends System {
  requiredComponents = [Transform2D, UIButton];
  private canvas: HTMLCanvasElement;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private mouseJustPressed: boolean = false;
  private mouseJustReleased: boolean = false;

  constructor(_inputManager: InputManager, canvas: HTMLCanvasElement) {
    super();
    this.canvas = canvas;
    this.priority = 90; // Process UI input before rendering

    this.setupMouseEvents();
  }

  private setupMouseEvents(): void {
    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    });

    this.canvas.addEventListener("mousedown", (e) => {
      if (e.button === 0) {
        // Left mouse button
        this.mouseJustPressed = true;
      }
    });

    this.canvas.addEventListener("mouseup", (e) => {
      if (e.button === 0) {
        // Left mouse button
        this.mouseJustReleased = true;
      }
    });

    this.canvas.addEventListener("mousedown", (e) => {
      if (e.button === 0) {
        // Left mouse button
        this.mouseJustPressed = true;
      }
    });

    this.canvas.addEventListener("mouseup", (e) => {
      if (e.button === 0) {
        // Left mouse button
        this.mouseJustReleased = true;
      }
    });

    // Prevent context menu on right click
    this.canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
  }

  update(_deltaTime: number, entities: Entity[]): void {
    const buttons = entities.filter(
      (entity) =>
        entity.active &&
        entity.hasComponent(Transform2D) &&
        entity.hasComponent(UIButton)
    );

    buttons.forEach((entity) => {
      const transform = entity.getComponent(Transform2D)!;
      const button = entity.getComponent(UIButton)!;

      if (!button.visible || !button.enabled) {
        button.isHovered = false;
        button.isPressed = false;
        return;
      }

      const isMouseOver = this.isPointInButton(
        this.mouseX,
        this.mouseY,
        transform,
        button
      );

      // Handle hover state
      if (isMouseOver && !button.isHovered) {
        button.isHovered = true;
        button.onHover?.();
      } else if (!isMouseOver && button.isHovered) {
        button.isHovered = false;
        button.onUnhover?.();
      }

      // Handle press state
      if (isMouseOver && this.mouseJustPressed) {
        button.isPressed = true;
      }

      // Handle click
      if (button.isPressed && this.mouseJustReleased) {
        button.isPressed = false;
        if (isMouseOver) {
          button.onClick?.();
        }
      }

      // Reset press state if mouse is no longer over button
      if (!isMouseOver) {
        button.isPressed = false;
      }
    });

    // Reset mouse state flags
    this.mouseJustPressed = false;
    this.mouseJustReleased = false;
  }

  private isPointInButton(
    x: number,
    y: number,
    transform: Transform2D,
    button: UIButton
  ): boolean {
    return (
      x >= transform.x &&
      x <= transform.x + button.width &&
      y >= transform.y &&
      y <= transform.y + button.height
    );
  }

  // Public method to check if mouse is over any UI element
  public isMouseOverUI(entities: Entity[]): boolean {
    const uiEntities = entities.filter(
      (entity) =>
        entity.active &&
        entity.hasComponent(Transform2D) &&
        entity.hasComponent(UIButton)
    );

    return uiEntities.some((entity) => {
      const transform = entity.getComponent(Transform2D)!;
      const button = entity.getComponent(UIButton)!;

      if (!button.visible) return false;

      return this.isPointInButton(this.mouseX, this.mouseY, transform, button);
    });
  }
}
