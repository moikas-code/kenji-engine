import { Component } from "./Component";

export class Entity {
  readonly id: string = crypto.randomUUID();
  private components = new Map<string, Component>();
  private tags = new Set<string>();
  public active: boolean = true;

  addComponent<T extends Component>(component: T): this {
    this.components.set(component.constructor.name, component);
    component.entity = this;
    return this;
  }

  removeComponent<T extends Component>(
    componentClass: new (...args: any[]) => T
  ): this {
    this.components.delete(componentClass.name);
    return this;
  }

  getComponent<T extends Component>(
    componentClass: new (...args: any[]) => T
  ): T | undefined {
    return this.components.get(componentClass.name) as T;
  }

  hasComponent<T extends Component>(
    componentClass: new (...args: any[]) => T
  ): boolean {
    return this.components.has(componentClass.name);
  }

  hasComponents(
    ...componentClasses: (new (...args: any[]) => Component)[]
  ): boolean {
    return componentClasses.every((cls) => this.components.has(cls.name));
  }

  addTag(tag: string): this {
    this.tags.add(tag);
    return this;
  }

  hasTag(tag: string): boolean {
    return this.tags.has(tag);
  }

  getAllComponents(): Component[] {
    return Array.from(this.components.values());
  }
}
