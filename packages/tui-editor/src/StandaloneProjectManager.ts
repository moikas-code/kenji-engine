import { mkdir, writeFile } from "fs/promises";
import { join, resolve } from "path";
import { existsSync } from "fs";

export interface StandaloneProjectTemplate {
  name: string;
  description: string;
  files: Record<string, string>;
}

export class StandaloneProjectManager {
  private templates: Record<string, StandaloneProjectTemplate> = {
    breakout: {
      name: "Breakout Game",
      description: "Classic brick-breaking game with paddle and ball",
      files: {
        "package.json": this.getBreakoutPackageJson(),
        "src/main.ts": this.getBreakoutMainTs(),
        "src/game/BreakoutGame.ts": this.getBreakoutGameTs(),
        "src/engine/GameEngine.ts": this.getGameEngineTs(),
        "src/engine/Entity.ts": this.getEntityTs(),
        "src/engine/Component.ts": this.getComponentTs(),
        "src/engine/System.ts": this.getSystemTs(),
        "src/engine/World.ts": this.getWorldTs(),
        "src/engine/components/Transform2D.ts": this.getTransform2DTs(),
        "src/engine/components/Velocity2D.ts": this.getVelocity2DTs(),
        "src/engine/components/Sprite2D.ts": this.getSprite2DTs(),
        "src/engine/components/Collider2D.ts": this.getCollider2DTs(),
        "index.html": this.getIndexHtml(),
        "README.md": this.getReadmeMd(),
        ".gitignore": this.getGitignore(),
        "tsconfig.json": this.getTsConfig(),
      },
    },
    empty: {
      name: "Empty Project",
      description: "Minimal project setup with embedded game engine",
      files: {
        "package.json": this.getEmptyPackageJson(),
        "src/main.ts": this.getEmptyMainTs(),
        "src/engine/GameEngine.ts": this.getGameEngineTs(),
        "src/engine/Entity.ts": this.getEntityTs(),
        "src/engine/Component.ts": this.getComponentTs(),
        "src/engine/System.ts": this.getSystemTs(),
        "src/engine/World.ts": this.getWorldTs(),
        "src/engine/components/Transform2D.ts": this.getTransform2DTs(),
        "src/engine/components/Velocity2D.ts": this.getVelocity2DTs(),
        "src/engine/components/Sprite2D.ts": this.getSprite2DTs(),
        "src/engine/components/Collider2D.ts": this.getCollider2DTs(),
        "index.html": this.getIndexHtml(),
        "README.md": this.getReadmeMd(),
        ".gitignore": this.getGitignore(),
        "tsconfig.json": this.getTsConfig(),
      },
    },
  };

  async createProject(
    name: string,
    template: string = "empty",
    targetDir?: string
  ): Promise<string> {
    const projectTemplate = this.templates[template];
    if (!projectTemplate) {
      throw new Error(
        `Template '${template}' not found. Available: ${Object.keys(
          this.templates
        ).join(", ")}`
      );
    }

    const projectPath = resolve(targetDir || process.cwd(), name);

    if (existsSync(projectPath)) {
      throw new Error(`Directory '${projectPath}' already exists`);
    }

    // Create project directory
    await mkdir(projectPath, { recursive: true });

    // Create all template files
    for (const [filePath, content] of Object.entries(projectTemplate.files)) {
      const fullPath = join(projectPath, filePath);
      const dir = join(fullPath, "..");

      // Ensure directory exists
      await mkdir(dir, { recursive: true });

      // Write file with project name substitution
      const processedContent = content.replace(/{{PROJECT_NAME}}/g, name);
      await writeFile(fullPath, processedContent, "utf8");
    }

    return projectPath;
  }

  getAvailableTemplates(): Record<string, StandaloneProjectTemplate> {
    return this.templates;
  }

  private getBreakoutPackageJson(): string {
    return JSON.stringify(
      {
        name: "{{PROJECT_NAME}}",
        version: "1.0.0",
        type: "module",
        description: "Breakout game with embedded Kenji Game Engine",
        main: "dist/main.js",
        scripts: {
          dev: "bun run --watch src/main.ts",
          build:
            "bun build src/main.ts --outdir dist --target browser --minify",
          start: "bun run build && python3 -m http.server 8000",
          serve: "python3 -m http.server 8000",
        },
        devDependencies: {
          "@types/bun": "latest",
          typescript: "^5.0.0",
        },
        keywords: ["game", "breakout", "kenji", "typescript"],
        author: "",
        license: "MIT",
      },
      null,
      2
    );
  }

  private getEmptyPackageJson(): string {
    return JSON.stringify(
      {
        name: "{{PROJECT_NAME}}",
        version: "1.0.0",
        type: "module",
        description: "Game with embedded Kenji Game Engine",
        main: "dist/main.js",
        scripts: {
          dev: "bun run --watch src/main.ts",
          build:
            "bun build src/main.ts --outdir dist --target browser --minify",
          start: "bun run build && python3 -m http.server 8000",
          serve: "python3 -m http.server 8000",
        },
        devDependencies: {
          "@types/bun": "latest",
          typescript: "^5.0.0",
        },
        keywords: ["game", "kenji", "typescript"],
        author: "",
        license: "MIT",
      },
      null,
      2
    );
  }

  private getBreakoutMainTs(): string {
    return `import { GameEngine } from "./engine/GameEngine";
import { BreakoutGame } from "./game/BreakoutGame";

async function main() {
  const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
  if (!canvas) {
    throw new Error("Canvas element not found");
  }

  const engine = new GameEngine({
    canvas,
    targetFPS: 60,
    debug: true
  });

  await engine.initialize();

  const game = new BreakoutGame();
  game.initialize(engine.world);

  engine.start();
}

main().catch(console.error);
`;
  }

  private getEmptyMainTs(): string {
    return `import { GameEngine } from "./engine/GameEngine";

async function main() {
  const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
  if (!canvas) {
    throw new Error("Canvas element not found");
  }

  const engine = new GameEngine({
    canvas,
    targetFPS: 60,
    debug: true
  });

  await engine.initialize();

  // TODO: Initialize your game here
  // const game = new YourGame();
  // game.initialize(engine.world);

  engine.start();
}

main().catch(console.error);
`;
  }

  private getBreakoutGameTs(): string {
    return `import { World, Entity } from "../engine/Entity";
import { Transform2D } from "../engine/components/Transform2D";
import { Velocity2D } from "../engine/components/Velocity2D";
import { Sprite2D } from "../engine/components/Sprite2D";
import { Collider2D } from "../engine/components/Collider2D";

export class BreakoutGame {
  initialize(world: World): void {
    // Create game entities
    this.createPaddle(world);
    this.createBall(world);
    this.createBricks(world);
  }

  private createPaddle(world: World): void {
    const paddle = new Entity()
      .addComponent(new Transform2D(400, 550))
      .addComponent(new Velocity2D(0, 0))
      .addComponent(new Sprite2D(80, 10, "#FFFFFF"))
      .addComponent(new Collider2D(80, 10))
      .addTag("paddle");
    
    world.addEntity(paddle);
  }

  private createBall(world: World): void {
    const ball = new Entity()
      .addComponent(new Transform2D(400, 300))
      .addComponent(new Velocity2D(200, -200))
      .addComponent(new Sprite2D(10, 10, "#FFFF00"))
      .addComponent(new Collider2D(10, 10))
      .addTag("ball");
    
    world.addEntity(ball);
  }

  private createBricks(world: World): void {
    const colors = ["#FF0000", "#FF8800", "#FFFF00", "#00FF00", "#0088FF"];
    
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 10; col++) {
        const brick = new Entity()
          .addComponent(new Transform2D(80 + col * 64, 50 + row * 32))
          .addComponent(new Sprite2D(60, 30, colors[row]))
          .addComponent(new Collider2D(60, 30))
          .addTag("brick");
        
        world.addEntity(brick);
      }
    }
  }
}
`;
  }

  // Embedded game engine files
  private getGameEngineTs(): string {
    return `import { World } from "./World";

export interface GameEngineOptions {
  canvas: HTMLCanvasElement;
  targetFPS?: number;
  debug?: boolean;
}

export class GameEngine {
  public world: World;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private targetFPS: number;
  private debug: boolean;
  private running: boolean = false;
  private lastFrameTime: number = 0;

  constructor(options: GameEngineOptions) {
    this.canvas = options.canvas;
    this.targetFPS = options.targetFPS || 60;
    this.debug = options.debug || false;
    
    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not get 2D context from canvas");
    }
    this.ctx = ctx;
    
    this.world = new World();
  }

  async initialize(): Promise<void> {
    console.log("🎮 Kenji Game Engine initialized");
  }

  start(): void {
    this.running = true;
    this.lastFrameTime = performance.now();
    this.gameLoop();
  }

  stop(): void {
    this.running = false;
  }

  private gameLoop(): void {
    if (!this.running) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;

    // Update world
    this.world.update(deltaTime);

    // Render
    this.render();

    // Schedule next frame
    setTimeout(() => this.gameLoop(), 1000 / this.targetFPS);
  }

  private render(): void {
    // Clear canvas
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render all entities
    this.world.render(this.ctx);

    // Debug info
    if (this.debug) {
      this.ctx.fillStyle = "#FFFFFF";
      this.ctx.font = "12px monospace";
      this.ctx.fillText(\`Entities: \${this.world.entities.length}\`, 10, 20);
      this.ctx.fillText(\`FPS: \${Math.round(1000 / (performance.now() - this.lastFrameTime))}\`, 10, 35);
    }
  }
}
`;
  }

  private getEntityTs(): string {
    return `import { Component } from "./Component";

export class Entity {
  private static nextId = 1;
  private id: number;
  private components: Map<string, Component> = new Map();
  private tags: Set<string> = new Set();

  constructor() {
    this.id = Entity.nextId++;
  }

  getId(): number {
    return this.id;
  }

  addComponent<T extends Component>(component: T): this {
    this.components.set(component.constructor.name, component);
    return this;
  }

  getComponent<T extends Component>(componentClass: new (...args: any[]) => T): T | undefined {
    return this.components.get(componentClass.name) as T;
  }

  hasComponent<T extends Component>(componentClass: new (...args: any[]) => T): boolean {
    return this.components.has(componentClass.name);
  }

  hasComponents(...componentClasses: (new (...args: any[]) => Component)[]): boolean {
    return componentClasses.every(cls => this.hasComponent(cls));
  }

  removeComponent<T extends Component>(componentClass: new (...args: any[]) => T): void {
    this.components.delete(componentClass.name);
  }

  addTag(tag: string): this {
    this.tags.add(tag);
    return this;
  }

  hasTag(tag: string): boolean {
    return this.tags.has(tag);
  }

  removeTag(tag: string): void {
    this.tags.delete(tag);
  }

  getTags(): string[] {
    return Array.from(this.tags);
  }
}

export class World {
  public entities: Entity[] = [];

  addEntity(entity: Entity): void {
    this.entities.push(entity);
  }

  removeEntity(entity: Entity): void {
    const index = this.entities.indexOf(entity);
    if (index !== -1) {
      this.entities.splice(index, 1);
    }
  }

  update(deltaTime: number): void {
    // Basic update - in a full engine this would run systems
    // For now, just a placeholder
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Basic rendering - render all entities with Sprite2D components
    for (const entity of this.entities) {
      const transform = entity.getComponent(require("./components/Transform2D").Transform2D);
      const sprite = entity.getComponent(require("./components/Sprite2D").Sprite2D);
      
      if (transform && sprite) {
        ctx.fillStyle = sprite.color;
        ctx.fillRect(transform.x, transform.y, sprite.width, sprite.height);
      }
    }
  }
}
`;
  }

  private getComponentTs(): string {
    return `export abstract class Component {
  // Base component class
}
`;
  }

  private getSystemTs(): string {
    return `import { Entity } from "./Entity";

export abstract class System {
  public priority: number = 0;

  abstract getRelevantEntities(entities: Entity[]): Entity[];
  abstract update(deltaTime: number, entities: Entity[]): void;
}
`;
  }

  private getWorldTs(): string {
    return `import { Entity } from "./Entity";
import { System } from "./System";

export class World {
  public entities: Entity[] = [];
  private systems: System[] = [];

  addEntity(entity: Entity): void {
    this.entities.push(entity);
  }

  removeEntity(entity: Entity): void {
    const index = this.entities.indexOf(entity);
    if (index !== -1) {
      this.entities.splice(index, 1);
    }
  }

  addSystem(system: System): void {
    this.systems.push(system);
    this.systems.sort((a, b) => a.priority - b.priority);
  }

  update(deltaTime: number): void {
    for (const system of this.systems) {
      const relevantEntities = system.getRelevantEntities(this.entities);
      system.update(deltaTime, relevantEntities);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Import here to avoid circular dependencies
    const { Transform2D } = require("./components/Transform2D");
    const { Sprite2D } = require("./components/Sprite2D");
    
    for (const entity of this.entities) {
      const transform = entity.getComponent(Transform2D);
      const sprite = entity.getComponent(Sprite2D);
      
      if (transform && sprite) {
        ctx.fillStyle = sprite.color;
        ctx.fillRect(transform.x, transform.y, sprite.width, sprite.height);
      }
    }
  }
}
`;
  }

  private getTransform2DTs(): string {
    return `import { Component } from "../Component";

export class Transform2D extends Component {
  constructor(
    public x: number = 0,
    public y: number = 0,
    public rotation: number = 0,
    public scaleX: number = 1,
    public scaleY: number = 1
  ) {
    super();
  }
}
`;
  }

  private getVelocity2DTs(): string {
    return `import { Component } from "../Component";

export class Velocity2D extends Component {
  constructor(
    public x: number = 0,
    public y: number = 0
  ) {
    super();
  }
}
`;
  }

  private getSprite2DTs(): string {
    return `import { Component } from "../Component";

export class Sprite2D extends Component {
  constructor(
    public width: number,
    public height: number,
    public color: string = "#FFFFFF"
  ) {
    super();
  }
}
`;
  }

  private getCollider2DTs(): string {
    return `import { Component } from "../Component";

export class Collider2D extends Component {
  constructor(
    public width: number,
    public height: number,
    public offsetX: number = 0,
    public offsetY: number = 0
  ) {
    super();
  }
}
`;
  }

  private getIndexHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{PROJECT_NAME}}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #000;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            font-family: Arial, sans-serif;
        }
        
        #gameCanvas {
            border: 2px solid #333;
            background: #111;
        }
        
        .game-info {
            position: absolute;
            top: 10px;
            left: 10px;
            color: white;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    <div class="game-info">
        <div>{{PROJECT_NAME}}</div>
        <div>Built with Kenji Game Engine</div>
    </div>
    <script type="module" src="dist/main.js"></script>
</body>
</html>
`;
  }

  private getReadmeMd(): string {
    return `# {{PROJECT_NAME}}

A game built with embedded Kenji Game Engine.

## Development

\`\`\`bash
# Install dependencies
bun install

# Start development server (auto-reload)
bun run dev

# Build for production
bun run build

# Serve built files
bun run serve
\`\`\`

## Controls

TODO: Add your game controls here

## Features

TODO: Add your game features here

## Built With

- Embedded Kenji Game Engine - Lightweight TypeScript game engine
- [Bun](https://bun.sh) - Fast JavaScript runtime and package manager
- TypeScript - Type-safe JavaScript

## License

MIT
`;
  }

  private getGitignore(): string {
    return `# Dependencies
node_modules/
.pnp
.pnp.js

# Production builds
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# OS generated files
Thumbs.db
`;
  }

  private getTsConfig(): string {
    return JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          lib: ["ES2022", "DOM"],
          module: "ESNext",
          moduleResolution: "bundler",
          allowImportingTsExtensions: true,
          noEmit: true,
          strict: true,
          skipLibCheck: true,
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          forceConsistentCasingInFileNames: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          exactOptionalPropertyTypes: true,
          noImplicitReturns: true,
          noFallthroughCasesInSwitch: true,
          noUncheckedIndexedAccess: true,
          noImplicitOverride: true,
          useDefineForClassFields: true,
        },
        include: ["src/**/*"],
        exclude: ["node_modules", "dist"],
      },
      null,
      2
    );
  }
}
