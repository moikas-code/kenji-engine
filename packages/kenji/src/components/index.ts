export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface Sprite {
  chars: string;
  color: string;
}

export interface Collider {
  type: 'AABB' | 'Circle';
  active: boolean;
}

export interface PlayerControlled {
  upKey: string;
  downKey: string;
}

export interface AIControlled {
  difficulty: number;
}

export interface Score {
  value: number;
}

export const ComponentTypes = {
  Position: 'Position',
  Velocity: 'Velocity',
  Dimensions: 'Dimensions',
  Sprite: 'Sprite',
  Collider: 'Collider',
  PlayerControlled: 'PlayerControlled',
  AIControlled: 'AIControlled',
  Score: 'Score'
} as const;