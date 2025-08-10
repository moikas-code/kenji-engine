import { System } from "../ecs/System";
import { Entity } from "../ecs/Entity";
import { Transform2D } from "../components/Transform2D";
import { UIText } from "../components/UIText";
import { UIButton } from "../components/UIButton";
import { UIPanel } from "../components/UIPanel";

export class UIRenderSystem extends System {
  requiredComponents = [Transform2D];
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    super();
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not get 2D rendering context for UI");
    }
    this.ctx = context;
    this.priority = 100; // Render UI last, on top of everything
  }

  update(_deltaTime: number, entities: Entity[]): void {
    // Get all UI entities and sort by layer (lower layers render first)
    const uiEntities = entities
      .filter((entity) => entity.active && this.hasUIComponent(entity))
      .sort((a, b) => this.getEntityLayer(a) - this.getEntityLayer(b));

    // Render each UI entity
    uiEntities.forEach((entity) => {
      const transform = entity.getComponent(Transform2D);
      if (!transform) return;

      if (entity.hasComponent(UIPanel)) {
        this.renderPanel(entity, transform);
      }

      if (entity.hasComponent(UIButton)) {
        this.renderButton(entity, transform);
      }

      if (entity.hasComponent(UIText)) {
        this.renderText(entity, transform);
      }
    });
  }

  private hasUIComponent(entity: Entity): boolean {
    return (
      entity.hasComponent(UIText) ||
      entity.hasComponent(UIButton) ||
      entity.hasComponent(UIPanel)
    );
  }

  private getEntityLayer(entity: Entity): number {
    if (entity.hasComponent(UIText)) {
      return entity.getComponent(UIText)!.layer;
    }
    if (entity.hasComponent(UIButton)) {
      return entity.getComponent(UIButton)!.layer;
    }
    if (entity.hasComponent(UIPanel)) {
      return entity.getComponent(UIPanel)!.layer;
    }
    return 0;
  }

  private renderPanel(entity: Entity, transform: Transform2D): void {
    const panel = entity.getComponent(UIPanel)!;
    if (!panel.visible) return;

    this.ctx.save();

    // Apply opacity
    this.ctx.globalAlpha = panel.style.opacity || 1;

    // Draw shadow if specified
    if (panel.style.shadow) {
      this.ctx.shadowColor = panel.style.shadow.color;
      this.ctx.shadowOffsetX = panel.style.shadow.offsetX;
      this.ctx.shadowOffsetY = panel.style.shadow.offsetY;
      this.ctx.shadowBlur = panel.style.shadow.blur || 0;
    }

    // Draw background
    if (panel.style.backgroundColor) {
      this.ctx.fillStyle = panel.style.backgroundColor;
      if (panel.style.borderRadius && panel.style.borderRadius > 0) {
        this.drawRoundedRect(
          transform.x,
          transform.y,
          panel.width,
          panel.height,
          panel.style.borderRadius
        );
        this.ctx.fill();
      } else {
        this.ctx.fillRect(transform.x, transform.y, panel.width, panel.height);
      }
    }

    // Draw border
    if (
      panel.style.borderColor &&
      panel.style.borderWidth &&
      panel.style.borderWidth > 0
    ) {
      this.ctx.strokeStyle = panel.style.borderColor;
      this.ctx.lineWidth = panel.style.borderWidth;
      if (panel.style.borderRadius && panel.style.borderRadius > 0) {
        this.drawRoundedRect(
          transform.x,
          transform.y,
          panel.width,
          panel.height,
          panel.style.borderRadius
        );
        this.ctx.stroke();
      } else {
        this.ctx.strokeRect(
          transform.x,
          transform.y,
          panel.width,
          panel.height
        );
      }
    }

    this.ctx.restore();
  }

  private renderButton(entity: Entity, transform: Transform2D): void {
    const button = entity.getComponent(UIButton)!;
    if (!button.visible) return;

    this.ctx.save();

    // Determine current style based on state
    let backgroundColor = button.buttonStyle.backgroundColor;
    let borderColor = button.buttonStyle.borderColor;

    if (button.enabled) {
      if (button.isPressed && button.buttonStyle.pressedBackgroundColor) {
        backgroundColor = button.buttonStyle.pressedBackgroundColor;
        borderColor = button.buttonStyle.pressedBorderColor || borderColor;
      } else if (button.isHovered && button.buttonStyle.hoverBackgroundColor) {
        backgroundColor = button.buttonStyle.hoverBackgroundColor;
        borderColor = button.buttonStyle.hoverBorderColor || borderColor;
      }
    } else {
      // Disabled state - make it semi-transparent
      this.ctx.globalAlpha = 0.5;
    }

    // Draw background
    if (backgroundColor) {
      this.ctx.fillStyle = backgroundColor;
      if (
        button.buttonStyle.borderRadius &&
        button.buttonStyle.borderRadius > 0
      ) {
        this.drawRoundedRect(
          transform.x,
          transform.y,
          button.width,
          button.height,
          button.buttonStyle.borderRadius
        );
        this.ctx.fill();
      } else {
        this.ctx.fillRect(
          transform.x,
          transform.y,
          button.width,
          button.height
        );
      }
    }

    // Draw border
    if (
      borderColor &&
      button.buttonStyle.borderWidth &&
      button.buttonStyle.borderWidth > 0
    ) {
      this.ctx.strokeStyle = borderColor;
      this.ctx.lineWidth = button.buttonStyle.borderWidth;
      if (
        button.buttonStyle.borderRadius &&
        button.buttonStyle.borderRadius > 0
      ) {
        this.drawRoundedRect(
          transform.x,
          transform.y,
          button.width,
          button.height,
          button.buttonStyle.borderRadius
        );
        this.ctx.stroke();
      } else {
        this.ctx.strokeRect(
          transform.x,
          transform.y,
          button.width,
          button.height
        );
      }
    }

    // Draw text
    if (button.text) {
      this.renderButtonText(button, transform);
    }

    this.ctx.restore();
  }

  private renderButtonText(button: UIButton, transform: Transform2D): void {
    const style = button.textStyle;

    // Set font
    this.ctx.font = `${style.fontSize}px ${style.font}`;
    this.ctx.textAlign = style.textAlign || "center";
    this.ctx.textBaseline = style.textBaseline || "middle";

    // Calculate text position (center of button)
    const textX = transform.x + button.width / 2;
    const textY = transform.y + button.height / 2;

    // Draw text shadow if specified
    if (style.shadow) {
      this.ctx.save();
      this.ctx.fillStyle = style.shadow.color;
      this.ctx.shadowColor = style.shadow.color;
      this.ctx.shadowOffsetX = style.shadow.offsetX;
      this.ctx.shadowOffsetY = style.shadow.offsetY;
      this.ctx.shadowBlur = style.shadow.blur || 0;
      this.ctx.fillText(button.text, textX, textY);
      this.ctx.restore();
    }

    // Draw text stroke if specified
    if (style.strokeColor && style.strokeWidth && style.strokeWidth > 0) {
      this.ctx.strokeStyle = style.strokeColor;
      this.ctx.lineWidth = style.strokeWidth;
      this.ctx.strokeText(button.text, textX, textY);
    }

    // Draw text fill
    if (style.color) {
      this.ctx.fillStyle = style.color;
      this.ctx.fillText(button.text, textX, textY);
    }
  }

  private renderText(entity: Entity, transform: Transform2D): void {
    const text = entity.getComponent(UIText)!;
    if (!text.visible || !text.text) return;

    this.ctx.save();

    const style = text.style;

    // Set font
    this.ctx.font = `${style.fontSize}px ${style.font}`;
    this.ctx.textAlign = style.textAlign || "left";
    this.ctx.textBaseline = style.textBaseline || "top";

    // Draw text shadow if specified
    if (style.shadow) {
      this.ctx.save();
      this.ctx.fillStyle = style.shadow.color;
      this.ctx.shadowColor = style.shadow.color;
      this.ctx.shadowOffsetX = style.shadow.offsetX;
      this.ctx.shadowOffsetY = style.shadow.offsetY;
      this.ctx.shadowBlur = style.shadow.blur || 0;
      this.ctx.fillText(text.text, transform.x, transform.y);
      this.ctx.restore();
    }

    // Draw text stroke if specified
    if (style.strokeColor && style.strokeWidth && style.strokeWidth > 0) {
      this.ctx.strokeStyle = style.strokeColor;
      this.ctx.lineWidth = style.strokeWidth;
      this.ctx.strokeText(text.text, transform.x, transform.y);
    }

    // Draw text fill
    if (style.color) {
      this.ctx.fillStyle = style.color;
      this.ctx.fillText(text.text, transform.x, transform.y);
    }

    this.ctx.restore();
  }

  private drawRoundedRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius,
      y + height
    );
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }
}
