import { mkdir, writeFile, readFile } from "fs/promises";
import { join, resolve } from "path";
import { existsSync } from "fs";

export interface ProjectTemplate {
  name: string;
  description: string;
  files: Record<string, string>;
}

export class ProjectManager {
  private templates: Record<string, ProjectTemplate> = {
    breakout: {
      name: "Breakout Game",
      description: "Classic brick-breaking game with paddle and ball",
      files: {
        "package.json": this.getBreakoutPackageJson(),
        "src/main.ts": this.getBreakoutMainTs(),
        "src/game/BreakoutGame.ts": this.getBreakoutGameTs(),
        "src/game/systems/PaddleSystem.ts": this.getPaddleSystemTs(),
        "src/game/systems/BallSystem.ts": this.getBallSystemTs(),
        "src/game/systems/BrickSystem.ts": this.getBrickSystemTs(),
        "index.html": this.getIndexHtml(),
        "README.md": this.getReadmeMd(),
        ".gitignore": this.getGitignore(),
        "tsconfig.json": this.getTsConfig(),
      },
    },
    platformer: {
      name: "Platformer Game",
      description: "Side-scrolling platformer with jumping and obstacles",
      files: {
        "package.json": this.getPlatformerPackageJson(),
        "src/main.ts": this.getPlatformerMainTs(),
        "src/game/PlatformerGame.ts": this.getPlatformerGameTs(),
        "index.html": this.getIndexHtml(),
        "README.md": this.getReadmeMd(),
        ".gitignore": this.getGitignore(),
        "tsconfig.json": this.getTsConfig(),
      },
    },
    empty: {
      name: "Empty Project",
      description: "Minimal project setup with basic structure",
      files: {
        "package.json": this.getEmptyPackageJson(),
        "src/main.ts": this.getEmptyMainTs(),
        "index.html": this.getIndexHtml(),
        "README.md": this.getReadmeMd(),
        ".gitignore": this.getGitignore(),
        "tsconfig.json": this.getTsConfig(),
      },
    },
  };

  async createProject(
    name: string,
    template: string = "breakout",
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

  getAvailableTemplates(): Record<string, ProjectTemplate> {
    return this.templates;
  }

  private getBreakoutPackageJson(): string {
    return JSON.stringify(
      {
        name: "{{PROJECT_NAME}}",
        version: "1.0.0",
        type: "module",
        description: "Breakout game built with Kuuzuki Game Engine",
        main: "dist/main.js",
        scripts: {
          dev: "bun run src/main.ts",
          build: "kuuzuki-editor build",
          deploy: "kuuzuki-editor deploy",
          start: "bun run build && bun run dist/main.js",
        },
        dependencies: {
          "@kenji-engine/core": "^1.0.0",
        },
        devDependencies: {
          "@types/bun": "latest",
          typescript: "^5.0.0",
        },
        keywords: ["game", "breakout", "kuuzuki", "typescript"],
        author: "",
        license: "MIT",
      },
      null,
      2
    );
  }

  private getPlatformerPackageJson(): string {
    return JSON.stringify(
      {
        name: "{{PROJECT_NAME}}",
        version: "1.0.0",
        type: "module",
        description: "Platformer game built with Kuuzuki Game Engine",
        main: "dist/main.js",
        scripts: {
          dev: "bun run src/main.ts",
          build: "kuuzuki-editor build",
          deploy: "kuuzuki-editor deploy",
          start: "bun run build && bun run dist/main.js",
        },
        dependencies: {
          "@kenji-engine/core": "^1.0.0",
        },
        devDependencies: {
          "@types/bun": "latest",
          typescript: "^5.0.0",
        },
        keywords: ["game", "platformer", "kuuzuki", "typescript"],
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
        description: "Game built with Kuuzuki Game Engine",
        main: "dist/main.js",
        scripts: {
          dev: "bun run src/main.ts",
          build: "kuuzuki-editor build",
          deploy: "kuuzuki-editor deploy",
          start: "bun run build && bun run dist/main.js",
        },
        dependencies: {
          "@kenji-engine/core": "^1.0.0",
        },
        devDependencies: {
          "@types/bun": "latest",
          typescript: "^5.0.0",
        },
        keywords: ["game", "kuuzuki", "typescript"],
        author: "",
        license: "MIT",
      },
      null,
      2
    );
  }

  private getBreakoutMainTs(): string {
    return `import { GameEngine } from "@kenji-engine/core";
import { BreakoutGame } from "./game/BreakoutGame";

async function main() {
  const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
  if (!canvas) {
    throw new Error("Canvas element not found");
  }

  const engine = new GameEngine({
    canvas,
    mode: "2d",
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

  private getPlatformerMainTs(): string {
    return `import { GameEngine } from "@kenji-engine/core";
import { PlatformerGame } from "./game/PlatformerGame";

async function main() {
  const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
  if (!canvas) {
    throw new Error("Canvas element not found");
  }

  const engine = new GameEngine({
    canvas,
    mode: "2d",
    targetFPS: 60,
    debug: true
  });

  await engine.initialize();

  const game = new PlatformerGame();
  game.initialize(engine.world);

  engine.start();
}

main().catch(console.error);
`;
  }

  private getEmptyMainTs(): string {
    return `import { GameEngine } from "@kenji-engine/core";

async function main() {
  const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
  if (!canvas) {
    throw new Error("Canvas element not found");
  }

  const engine = new GameEngine({
    canvas,
    mode: "2d",
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
    return `import { World, Entity, Transform2D, Velocity2D, Sprite2D, Collider2D } from "@kenji-engine/core";
import { PaddleSystem } from "./systems/PaddleSystem";
import { BallSystem } from "./systems/BallSystem";
import { BrickSystem } from "./systems/BrickSystem";

export class BreakoutGame {
  initialize(world: World): void {
    // Add game systems
    world.addSystem(new PaddleSystem());
    world.addSystem(new BallSystem());
    world.addSystem(new BrickSystem());

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

  private getPlatformerGameTs(): string {
    return `import { World, Entity, Transform2D, Velocity2D, Sprite2D, Collider2D } from "@kenji-engine/core";

export class PlatformerGame {
  initialize(world: World): void {
    // TODO: Add platformer-specific systems
    
    // Create game entities
    this.createPlayer(world);
    this.createPlatforms(world);
  }

  private createPlayer(world: World): void {
    const player = new Entity()
      .addComponent(new Transform2D(100, 400))
      .addComponent(new Velocity2D(0, 0))
      .addComponent(new Sprite2D(32, 32, "#00FF00"))
      .addComponent(new Collider2D(32, 32))
      .addTag("player");
    
    world.addEntity(player);
  }

  private createPlatforms(world: World): void {
    // Ground platform
    const ground = new Entity()
      .addComponent(new Transform2D(0, 550))
      .addComponent(new Sprite2D(800, 50, "#8B4513"))
      .addComponent(new Collider2D(800, 50))
      .addTag("platform");
    
    world.addEntity(ground);

    // Floating platforms
    for (let i = 0; i < 5; i++) {
      const platform = new Entity()
        .addComponent(new Transform2D(150 + i * 120, 450 - i * 60))
        .addComponent(new Sprite2D(100, 20, "#654321"))
        .addComponent(new Collider2D(100, 20))
        .addTag("platform");
      
      world.addEntity(platform);
    }
  }
}
`;
  }

  private getPaddleSystemTs(): string {
    return `import { System, Entity, Transform2D, Velocity2D } from "@kenji-engine/core";

export class PaddleSystem extends System {
  priority = 10;

  getRelevantEntities(entities: Entity[]): Entity[] {
    return entities.filter(entity => 
      entity.hasTag("paddle") && 
      entity.hasComponents(Transform2D, Velocity2D)
    );
  }

  update(deltaTime: number, entities: Entity[]): void {
    for (const entity of entities) {
      const transform = entity.getComponent(Transform2D)!;
      const velocity = entity.getComponent(Velocity2D)!;

      // TODO: Add paddle input handling
      // TODO: Add boundary constraints
      
      // Update position
      transform.x += velocity.x * deltaTime;
      transform.y += velocity.y * deltaTime;
    }
  }
}
`;
  }

  private getBallSystemTs(): string {
    return `import { System, Entity, Transform2D, Velocity2D } from "@kenji-engine/core";

export class BallSystem extends System {
  priority = 20;

  getRelevantEntities(entities: Entity[]): Entity[] {
    return entities.filter(entity => 
      entity.hasTag("ball") && 
      entity.hasComponents(Transform2D, Velocity2D)
    );
  }

  update(deltaTime: number, entities: Entity[]): void {
    for (const entity of entities) {
      const transform = entity.getComponent(Transform2D)!;
      const velocity = entity.getComponent(Velocity2D)!;

      // TODO: Add collision detection
      // TODO: Add boundary bouncing
      
      // Update position
      transform.x += velocity.x * deltaTime;
      transform.y += velocity.y * deltaTime;
    }
  }
}
`;
  }

  private getBrickSystemTs(): string {
    return `import { System, Entity, Transform2D, Collider2D } from "@kenji-engine/core";

export class BrickSystem extends System {
  priority = 30;

  getRelevantEntities(entities: Entity[]): Entity[] {
    return entities.filter(entity => 
      entity.hasTag("brick") && 
      entity.hasComponents(Transform2D, Collider2D)
    );
  }

  update(deltaTime: number, entities: Entity[]): void {
    // TODO: Add brick collision detection
    // TODO: Add brick destruction logic
    // TODO: Add score tracking
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
        <div>Built with Kuuzuki Game Engine</div>
    </div>
    <script type="module" src="dist/main.js"></script>
</body>
</html>
`;
  }

  private getReadmeMd(): string {
    return `# {{PROJECT_NAME}}

A game built with [Kuuzuki Game Engine](https://github.com/moikas-code/kenji-engine).

## Development

\`\`\`bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Deploy to itch.io
bun run deploy
\`\`\`

## Controls

TODO: Add your game controls here

## Features

TODO: Add your game features here

## Built With

- [Kuuzuki Game Engine](https://github.com/moikas-code/kenji-engine) - Modern TypeScript game engine
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
