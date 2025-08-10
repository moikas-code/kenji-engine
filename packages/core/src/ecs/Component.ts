import type { Entity } from './Entity';

export abstract class Component {
  entity?: Entity;
}