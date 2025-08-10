import { Entity, World } from "@kuuzuki-ge/core";
import { TUIComponent } from "../TUIRenderer";

export interface SceneHierarchyState {
  entities: Entity[];
  selectedIndex: number;
  expandedEntities: Set<string>;
  scrollOffset: number;
}

export class SceneHierarchy implements TUIComponent {
  private state: SceneHierarchyState;
  private world: World | null = null;
  private width: number;
  private height: number;
  private x: number;
  private y: number;
  public onEntitySelected?: (entity: Entity | null) => void;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.state = {
      entities: [],
      selectedIndex: 0,
      expandedEntities: new Set(),
      scrollOffset: 0,
    };
  }

  setWorld(world: World): void {
    this.world = world;
    this.refreshEntities();
  }

  private refreshEntities(): void {
    if (!this.world) {
      this.state.entities = [];
      return;
    }

    this.state.entities = this.world.getAllEntities();
  }

  selectEntity(index: number): void {
    if (index >= 0 && index < this.state.entities.length) {
      this.state.selectedIndex = index;
      const entity = this.state.entities[index];
      if (this.onEntitySelected) {
        this.onEntitySelected(entity);
      }
      this.updateScrollOffset();
    }
  }

  moveSelection(direction: "up" | "down"): void {
    if (this.state.entities.length === 0) return;

    if (direction === "up") {
      this.selectEntity(Math.max(0, this.state.selectedIndex - 1));
    } else {
      this.selectEntity(
        Math.min(this.state.entities.length - 1, this.state.selectedIndex + 1)
      );
    }
  }

  private updateScrollOffset(): void {
    const visibleItems = this.height - 3; // Account for header and borders

    if (this.state.selectedIndex < this.state.scrollOffset) {
      this.state.scrollOffset = this.state.selectedIndex;
    } else if (
      this.state.selectedIndex >=
      this.state.scrollOffset + visibleItems
    ) {
      this.state.scrollOffset = this.state.selectedIndex - visibleItems + 1;
    }
  }

  toggleEntityExpansion(index: number): void {
    const entity = this.state.entities[index];
    if (!entity) return;

    if (this.state.expandedEntities.has(entity.id)) {
      this.state.expandedEntities.delete(entity.id);
    } else {
      this.state.expandedEntities.add(entity.id);
    }
  }

  private getEntityIcon(entity: Entity): string {
    const components = entity.getAllComponents();

    for (const component of components) {
      const name = component.constructor.name;
      if (name === "Transform2D") return "🎯";
      if (name === "Sprite2D") return "🖼️";
      if (name === "UIText") return "📝";
      if (name === "UIButton") return "🔘";
      if (name === "UIPanel") return "📋";
      if (name === "Collider2D") return "🔲";
    }

    return "⚪";
  }

  private getEntityName(entity: Entity): string {
    const components = entity.getAllComponents();

    for (const component of components) {
      const name = component.constructor.name;
      if (name === "UIText") return "Text";
      if (name === "UIButton") return "Button";
      if (name === "UIPanel") return "Panel";
      if (name === "Sprite2D") return "Sprite";
    }

    return `Entity-${entity.id.slice(0, 8)}`;
  }

  render(): string[] {
    const lines: string[] = [];

    // Header
    lines.push("┌─ Scene ─┐".padEnd(this.width, "─"));

    if (this.state.entities.length === 0) {
      lines.push("│ No entities");
      lines.push("│");
    } else {
      const visibleItems = this.height - 3;
      const endIndex = Math.min(
        this.state.scrollOffset + visibleItems,
        this.state.entities.length
      );

      for (let i = this.state.scrollOffset; i < endIndex; i++) {
        const entity = this.state.entities[i];
        const isSelected = i === this.state.selectedIndex;
        const isExpanded = this.state.expandedEntities.has(entity.id);
        const icon = this.getEntityIcon(entity);
        const name = this.getEntityName(entity);

        const expandIcon = isExpanded ? "▼" : "▶";
        const prefix = isSelected ? "│>" : "│ ";
        const entityLine = `${prefix}${expandIcon}${icon} ${name}`;

        lines.push(
          entityLine.substring(0, this.width - 1).padEnd(this.width - 1) + "│"
        );

        if (isExpanded) {
          const components = entity.getAllComponents();
          for (const component of components) {
            const componentName = component.constructor.name;
            const componentLine = `│  └─ ${componentName}`;
            lines.push(
              componentLine
                .substring(0, this.width - 1)
                .padEnd(this.width - 1) + "│"
            );
          }
        }
      }
    }

    // Fill remaining space
    while (lines.length < this.height - 1) {
      lines.push("│".padEnd(this.width - 1) + "│");
    }

    // Footer
    lines.push("└".padEnd(this.width - 1, "─") + "┘");

    return lines;
  }

  handleInput(key: string): boolean {
    switch (key) {
      case "ArrowUp":
      case "k":
        this.moveSelection("up");
        return true;

      case "ArrowDown":
      case "j":
        this.moveSelection("down");
        return true;

      case "Enter":
      case " ":
        this.toggleEntityExpansion(this.state.selectedIndex);
        return true;

      case "r":
        this.refreshEntities();
        return true;

      default:
        return false;
    }
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  getSelectedEntity(): Entity | null {
    return this.state.entities[this.state.selectedIndex] || null;
  }

  getState(): SceneHierarchyState {
    return { ...this.state };
  }
}
