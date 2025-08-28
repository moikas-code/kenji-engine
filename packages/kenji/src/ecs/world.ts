type Entity = number;
type ComponentType = string;
type Component = Record<string, any>;

export class World {
  private nextEntityId: Entity = 1;
  private entities: Set<Entity> = new Set();
  private components: Map<ComponentType, Map<Entity, Component>> = new Map();
  private entityPools: Entity[] = [];

  createEntity(): Entity {
    const entity = this.entityPools.pop() ?? this.nextEntityId++;
    this.entities.add(entity);
    return entity;
  }

  destroyEntity(entity: Entity): void {
    if (!this.entities.has(entity)) return;
    
    this.entities.delete(entity);
    
    for (const componentMap of this.components.values()) {
      componentMap.delete(entity);
    }
    
    this.entityPools.push(entity);
  }

  addComponent(entity: Entity, type: ComponentType, component: Component): void {
    if (!this.entities.has(entity)) return;
    
    if (!this.components.has(type)) {
      this.components.set(type, new Map());
    }
    
    this.components.get(type)!.set(entity, component);
  }

  removeComponent(entity: Entity, type: ComponentType): void {
    const componentMap = this.components.get(type);
    if (componentMap) {
      componentMap.delete(entity);
    }
  }

  getComponent(entity: Entity, type: ComponentType): Component | undefined {
    return this.components.get(type)?.get(entity);
  }

  hasComponent(entity: Entity, type: ComponentType): boolean {
    return this.components.get(type)?.has(entity) ?? false;
  }

  query(...componentTypes: ComponentType[]): Entity[] {
    const result: Entity[] = [];
    
    for (const entity of this.entities) {
      if (componentTypes.every(type => this.hasComponent(entity, type))) {
        result.push(entity);
      }
    }
    
    return result;
  }

  clear(): void {
    this.entities.clear();
    this.components.clear();
    this.entityPools = [];
    this.nextEntityId = 1;
  }

  getEntityCount(): number {
    return this.entities.size;
  }
}