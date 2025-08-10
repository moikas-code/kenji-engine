import {
  Entity,
  Component,
  Transform2D,
  Velocity2D,
  Sprite2D,
  Collider2D,
  UIText,
  UIButton,
  UIPanel,
  GameState,
} from "@kuuzuki-ge/core";

export interface PropertyPanelState {
  selectedEntity: Entity | null;
  editingProperty: string | null;
  propertyValues: Record<string, any>;
}

export class PropertyPanel {
  private state: PropertyPanelState;
  private width: number;
  private height: number;
  private x: number;
  private y: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.state = {
      selectedEntity: null,
      editingProperty: null,
      propertyValues: {},
    };
  }

  setSelectedEntity(entity: Entity | null): void {
    this.state.selectedEntity = entity;
    this.state.editingProperty = null;
    this.state.propertyValues = {};

    if (entity) {
      this.loadEntityProperties(entity);
    }
  }

  private loadEntityProperties(entity: Entity): void {
    const components = entity.getAllComponents();

    for (const component of components) {
      const componentName = component.constructor.name;
      this.state.propertyValues[componentName] =
        this.extractComponentProperties(component);
    }
  }

  private extractComponentProperties(
    component: Component
  ): Record<string, any> {
    const properties: Record<string, any> = {};

    if (component instanceof Transform2D) {
      properties.x = component.x;
      properties.y = component.y;
      properties.rotation = component.rotation;
      properties.scaleX = component.scaleX;
      properties.scaleY = component.scaleY;
    } else if (component instanceof Velocity2D) {
      properties.x = component.x;
      properties.y = component.y;
      properties.maxSpeed = component.maxSpeed;
    } else if (component instanceof Sprite2D) {
      properties.width = component.width;
      properties.height = component.height;
      properties.color = component.color;
    } else if (component instanceof Collider2D) {
      properties.width = component.width;
      properties.height = component.height;
      properties.isTrigger = component.isTrigger;
    } else if (component instanceof UIText) {
      properties.text = component.text;
      properties.fontSize = component.fontSize;
      properties.color = component.color;
      properties.fontFamily = component.fontFamily;
    } else if (component instanceof UIButton) {
      properties.text = component.text;
      properties.width = component.width;
      properties.height = component.height;
      properties.backgroundColor = component.backgroundColor;
      properties.textColor = component.textColor;
      properties.isPressed = component.isPressed;
      properties.isHovered = component.isHovered;
    } else if (component instanceof UIPanel) {
      properties.width = component.width;
      properties.height = component.height;
      properties.backgroundColor = component.backgroundColor;
      properties.borderColor = component.borderColor;
      properties.borderWidth = component.borderWidth;
    } else if (component instanceof GameState) {
      properties.score = component.score;
      properties.lives = component.lives;
      properties.level = component.level;
      properties.gameOver = component.gameOver;
      properties.paused = component.paused;
    }

    return properties;
  }

  updateProperty(
    componentName: string,
    propertyName: string,
    value: any
  ): void {
    if (!this.state.selectedEntity) return;

    const component = this.state.selectedEntity.getComponent(
      this.getComponentClass(componentName)
    );
    if (!component) return;

    this.applyPropertyUpdate(component, propertyName, value);

    if (!this.state.propertyValues[componentName]) {
      this.state.propertyValues[componentName] = {};
    }
    this.state.propertyValues[componentName][propertyName] = value;
  }

  private getComponentClass(componentName: string): any {
    const componentMap: Record<string, any> = {
      Transform2D: Transform2D,
      Velocity2D: Velocity2D,
      Sprite2D: Sprite2D,
      Collider2D: Collider2D,
      UIText: UIText,
      UIButton: UIButton,
      UIPanel: UIPanel,
      GameState: GameState,
    };

    return componentMap[componentName];
  }

  private applyPropertyUpdate(
    component: Component,
    propertyName: string,
    value: any
  ): void {
    if (component instanceof Transform2D) {
      if (propertyName === "x") component.x = Number(value);
      if (propertyName === "y") component.y = Number(value);
      if (propertyName === "rotation") component.rotation = Number(value);
      if (propertyName === "scaleX") component.scaleX = Number(value);
      if (propertyName === "scaleY") component.scaleY = Number(value);
    } else if (component instanceof Velocity2D) {
      if (propertyName === "x") component.x = Number(value);
      if (propertyName === "y") component.y = Number(value);
      if (propertyName === "maxSpeed")
        component.maxSpeed = value ? Number(value) : undefined;
    } else if (component instanceof Sprite2D) {
      if (propertyName === "width") component.width = Number(value);
      if (propertyName === "height") component.height = Number(value);
      if (propertyName === "color") component.color = String(value);
    } else if (component instanceof Collider2D) {
      if (propertyName === "width") component.width = Number(value);
      if (propertyName === "height") component.height = Number(value);
      if (propertyName === "isTrigger") component.isTrigger = Boolean(value);
    } else if (component instanceof UIText) {
      if (propertyName === "text") component.text = String(value);
      if (propertyName === "fontSize") component.fontSize = Number(value);
      if (propertyName === "color") component.color = String(value);
      if (propertyName === "fontFamily") component.fontFamily = String(value);
    } else if (component instanceof UIButton) {
      if (propertyName === "text") component.text = String(value);
      if (propertyName === "width") component.width = Number(value);
      if (propertyName === "height") component.height = Number(value);
      if (propertyName === "backgroundColor")
        component.backgroundColor = String(value);
      if (propertyName === "textColor") component.textColor = String(value);
      if (propertyName === "isPressed") component.isPressed = Boolean(value);
      if (propertyName === "isHovered") component.isHovered = Boolean(value);
    } else if (component instanceof UIPanel) {
      if (propertyName === "width") component.width = Number(value);
      if (propertyName === "height") component.height = Number(value);
      if (propertyName === "backgroundColor")
        component.backgroundColor = String(value);
      if (propertyName === "borderColor") component.borderColor = String(value);
      if (propertyName === "borderWidth") component.borderWidth = Number(value);
    } else if (component instanceof GameState) {
      if (propertyName === "score") component.score = Number(value);
      if (propertyName === "lives") component.lives = Number(value);
      if (propertyName === "level") component.level = Number(value);
      if (propertyName === "gameOver") component.gameOver = Boolean(value);
      if (propertyName === "paused") component.paused = Boolean(value);
    }
  }

  startEditingProperty(componentName: string, propertyName: string): void {
    this.state.editingProperty = `${componentName}.${propertyName}`;
  }

  stopEditingProperty(): void {
    this.state.editingProperty = null;
  }

  isEditingProperty(componentName: string, propertyName: string): boolean {
    return this.state.editingProperty === `${componentName}.${propertyName}`;
  }

  render(): string[] {
    const lines: string[] = [];
    const title = "┌─ Properties ─┐";
    lines.push(title.padEnd(this.width, "─"));

    if (!this.state.selectedEntity) {
      lines.push("│ No entity selected");
      lines.push("│");
      for (let i = lines.length; i < this.height - 1; i++) {
        lines.push("│".padEnd(this.width));
      }
      lines.push("└".padEnd(this.width - 1, "─") + "┘");
      return lines;
    }

    lines.push(`│ Entity ID: ${this.state.selectedEntity.id}`);
    lines.push("│");

    let lineCount = 3;

    for (const [componentName, properties] of Object.entries(
      this.state.propertyValues
    )) {
      if (lineCount >= this.height - 2) break;

      lines.push(`│ ${componentName}:`);
      lineCount++;

      for (const [propName, propValue] of Object.entries(properties)) {
        if (lineCount >= this.height - 2) break;

        const isEditing = this.isEditingProperty(componentName, propName);
        const valueStr = isEditing ? `[${propValue}]` : String(propValue);
        const propLine = `│   ${propName}: ${valueStr}`;

        lines.push(
          propLine.length > this.width - 1
            ? propLine.substring(0, this.width - 4) + "..."
            : propLine.padEnd(this.width - 1)
        );
        lineCount++;
      }

      if (lineCount < this.height - 2) {
        lines.push("│");
        lineCount++;
      }
    }

    while (lines.length < this.height - 1) {
      lines.push("│".padEnd(this.width - 1));
    }

    lines.push("└".padEnd(this.width - 1, "─") + "┘");
    return lines;
  }

  handleInput(key: string): boolean {
    if (!this.state.selectedEntity || !this.state.editingProperty) {
      return false;
    }

    if (key === "Enter" || key === "Escape") {
      this.stopEditingProperty();
      return true;
    }

    return false;
  }

  getSelectedEntity(): Entity | null {
    return this.state.selectedEntity;
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
}
