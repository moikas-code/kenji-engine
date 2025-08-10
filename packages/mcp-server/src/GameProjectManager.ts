export interface CreateProjectConfig {
  name: string;
  path: string;
  template: "empty" | "pong" | "breakout" | "platformer";
  type: "2d" | "3d";
}

export class GameProjectManager {
  async createProject(config: CreateProjectConfig) {
    const projectPath = `${config.path}/${config.name}`;

    // Create project directory structure
    await this.createDirectoryStructure(projectPath);

    // Generate package.json
    await this.generatePackageJson(projectPath, config);

    // Generate main.ts based on template
    await this.generateMainFile(projectPath, config);

    // Generate other config files
    await this.generateConfigFiles(projectPath, config);

    return {
      path: projectPath,
      structure: await this.getProjectStructure(projectPath),
    };
  }

  private async createDirectoryStructure(projectPath: string) {
    const dirs = ["src", "src/components", "src/systems", "src/assets", "dist"];

    for (const dir of dirs) {
      await Bun.write(`${projectPath}/${dir}/.gitkeep`, "");
    }
  }

  private async generatePackageJson(
    projectPath: string,
    config: CreateProjectConfig
  ) {
    const packageJson = {
      name: config.name,
      version: "0.0.1",
      type: "module",
      scripts: {
        dev: "bun run --watch src/main.ts",
        build: "bun run build.ts",
        deploy: "bun run deploy.ts",
        start: "bun run src/main.ts",
      },
      dependencies: {
        "@kenji-engine/core": "latest",
        "@kenji-engine/pixel-art-generator": "latest",
      },
      devDependencies: {
        "@types/bun": "latest",
        typescript: "^5.0.0",
      },
    };

    if (config.type === "3d") {
      (packageJson.dependencies as any)["three"] = "latest";
      (packageJson.dependencies as any)["@types/three"] = "latest";
    }

    await Bun.write(
      `${projectPath}/package.json`,
      JSON.stringify(packageJson, null, 2)
    );
  }

  private async generateMainFile(
    projectPath: string,
    config: CreateProjectConfig
  ) {
    let mainContent = "";

    switch (config.template) {
      case "pong":
        mainContent = this.generatePongTemplate(config.type);
        break;
      case "breakout":
        mainContent = this.generateBreakoutTemplate(config.type);
        break;
      case "platformer":
        mainContent = this.generatePlatformerTemplate(config.type);
        break;
      default:
        mainContent = this.generateEmptyTemplate(config.type);
    }

    await Bun.write(`${projectPath}/src/main.ts`, mainContent);
  }

  private generateEmptyTemplate(type: "2d" | "3d"): string {
    return `import { GameEngine, Entity } from '@kenji-engine/core';

async function main() {
  // Get canvas element
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  if (!canvas) {
    throw new Error('Canvas element with id "game-canvas" not found');
  }

  // Configure canvas
  canvas.width = 800;
  canvas.height = 600;

  // Initialize game engine
  const engine = new GameEngine({
    canvas,
    mode: '${type}',
    targetFPS: 60,
    debug: true
  });

  await engine.initialize();

  // TODO: Add your game entities and systems here

  // Start the game
  console.log('Starting game...');
  engine.start();
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', main);`;
  }

  private generatePongTemplate(type: "2d" | "3d"): string {
    return `import { GameEngine, Entity, Transform2D, Velocity2D, Sprite2D } from '@kenji-engine/core';
import { PongAssetGenerator } from '@kenji-engine/pixel-art-generator';

async function main() {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  if (!canvas) {
    throw new Error('Canvas element with id "game-canvas" not found');
  }

  canvas.width = 800;
  canvas.height = 600;

  const engine = new GameEngine({
    canvas,
    mode: '${type}',
    targetFPS: 60,
    debug: true
  });

  await engine.initialize();

  // Generate pong assets
  console.log('Generating pong assets...');
  const assets = await PongAssetGenerator.generateAll();

  // Create paddles
  const leftPaddle = new Entity()
    .addComponent(new Transform2D(20, 250))
    .addComponent(new Sprite2D(assets.paddle));

  const rightPaddle = new Entity()
    .addComponent(new Transform2D(760, 250))
    .addComponent(new Sprite2D(assets.paddle));

  // Create ball
  const ball = new Entity()
    .addComponent(new Transform2D(396, 296))
    .addComponent(new Velocity2D(200, 150))
    .addComponent(new Sprite2D(assets.ball));

  // Add entities to world
  engine.world
    .addEntity(leftPaddle)
    .addEntity(rightPaddle)
    .addEntity(ball);

  // TODO: Add pong-specific systems (input, collision, scoring)

  console.log('Starting Pong game...');
  engine.start();
}

document.addEventListener('DOMContentLoaded', main);`;
  }

  private generateBreakoutTemplate(type: "2d" | "3d"): string {
    return this.generateEmptyTemplate(type); // Placeholder
  }

  private generatePlatformerTemplate(type: "2d" | "3d"): string {
    return this.generateEmptyTemplate(type); // Placeholder
  }

  private async generateConfigFiles(
    projectPath: string,
    config: CreateProjectConfig
  ) {
    // Generate tsconfig.json
    const tsConfig = {
      compilerOptions: {
        target: "ES2022",
        module: "ESNext",
        moduleResolution: "bundler",
        allowImportingTsExtensions: true,
        noEmit: true,
        strict: true,
        skipLibCheck: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        forceConsistentCasingInFileNames: true,
      },
      include: ["src/**/*"],
      exclude: ["node_modules", "dist"],
    };

    await Bun.write(
      `${projectPath}/tsconfig.json`,
      JSON.stringify(tsConfig, null, 2)
    );

    // Generate index.html
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.name}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #000;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            font-family: 'Courier New', monospace;
        }
        #game-canvas {
            border: 2px solid #333;
            image-rendering: pixelated;
            image-rendering: -moz-crisp-edges;
            image-rendering: crisp-edges;
        }
    </style>
</head>
<body>
    <canvas id="game-canvas" width="800" height="600"></canvas>
    <script type="module" src="src/main.ts"></script>
</body>
</html>`;

    await Bun.write(`${projectPath}/index.html`, html);
  }

  private async getProjectStructure(projectPath: string): Promise<any> {
    return {
      "src/": "Source code directory",
      "src/main.ts": "Main game entry point",
      "src/components/": "Custom game components",
      "src/systems/": "Custom game systems",
      "src/assets/": "Generated game assets",
      "package.json": "Project dependencies",
      "tsconfig.json": "TypeScript configuration",
      "index.html": "Game HTML wrapper",
    };
  }
}
