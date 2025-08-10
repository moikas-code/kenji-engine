import { spawn } from "child_process";
import { readFile, writeFile, mkdir, copyFile } from "fs/promises";
import { join } from "path";
import { existsSync, statSync } from "fs";

export interface BuildOptions {
  projectPath: string;
  outputDir: string;
  minify: boolean;
  target: "web" | "node" | "both";
  sourcemap: boolean;
}

export interface BuildResult {
  success: boolean;
  outputPath: string;
  bundleSize: number;
  buildTime: number;
  errors: string[];
  warnings: string[];
}

export class BuildManager {
  async buildProject(options: BuildOptions): Promise<BuildResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate project structure
      await this.validateProject(options.projectPath);

      // Ensure output directory exists
      await mkdir(options.outputDir, { recursive: true });

      // Build based on target
      let bundleSize = 0;

      if (options.target === "web" || options.target === "both") {
        bundleSize += await this.buildWeb(options);
      }

      if (options.target === "node" || options.target === "both") {
        bundleSize += await this.buildNode(options);
      }

      // Copy assets
      await this.copyAssets(options.projectPath, options.outputDir);

      const buildTime = Date.now() - startTime;

      return {
        success: true,
        outputPath: options.outputDir,
        bundleSize,
        buildTime,
        errors,
        warnings,
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));

      return {
        success: false,
        outputPath: options.outputDir,
        bundleSize: 0,
        buildTime: Date.now() - startTime,
        errors,
        warnings,
      };
    }
  }

  private async validateProject(projectPath: string): Promise<void> {
    const packageJsonPath = join(projectPath, "package.json");
    const srcPath = join(projectPath, "src");
    const mainPath = join(projectPath, "src/main.ts");

    if (!existsSync(packageJsonPath)) {
      throw new Error("package.json not found. Is this a valid project?");
    }

    if (!existsSync(srcPath)) {
      throw new Error("src directory not found");
    }

    if (!existsSync(mainPath)) {
      throw new Error("src/main.ts not found");
    }
  }

  private async buildWeb(options: BuildOptions): Promise<number> {
    const entryPoint = join(options.projectPath, "src/main.ts");
    const outputFile = join(options.outputDir, "main.js");

    // Build command arguments
    const args = [
      "build",
      entryPoint,
      "--outfile",
      outputFile,
      "--target",
      "browser",
      "--format",
      "esm",
    ];

    if (options.minify) {
      args.push("--minify");
    }

    if (options.sourcemap) {
      args.push("--sourcemap");
    }

    // Execute build
    await this.executeBunBuild(args);

    // Copy index.html if it exists
    const indexHtmlSrc = join(options.projectPath, "index.html");
    const indexHtmlDest = join(options.outputDir, "index.html");

    if (existsSync(indexHtmlSrc)) {
      await copyFile(indexHtmlSrc, indexHtmlDest);
    } else {
      // Generate default index.html
      await this.generateIndexHtml(options.outputDir);
    }

    // Return bundle size
    if (existsSync(outputFile)) {
      return statSync(outputFile).size;
    }

    return 0;
  }

  private async buildNode(options: BuildOptions): Promise<number> {
    const entryPoint = join(options.projectPath, "src/main.ts");
    const outputFile = join(options.outputDir, "main.node.js");

    // Build command arguments
    const args = [
      "build",
      entryPoint,
      "--outfile",
      outputFile,
      "--target",
      "node",
      "--format",
      "esm",
    ];

    if (options.minify) {
      args.push("--minify");
    }

    if (options.sourcemap) {
      args.push("--sourcemap");
    }

    // Execute build
    await this.executeBunBuild(args);

    // Return bundle size
    if (existsSync(outputFile)) {
      return statSync(outputFile).size;
    }

    return 0;
  }

  private async executeBunBuild(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const process = spawn("bun", args, {
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      process.stdout?.on("data", (data) => {
        stdout += data.toString();
      });

      process.stderr?.on("data", (data) => {
        stderr += data.toString();
      });

      process.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Build failed with code ${code}: ${stderr}`));
        }
      });

      process.on("error", (error) => {
        reject(new Error(`Build process error: ${error.message}`));
      });
    });
  }

  private async copyAssets(
    projectPath: string,
    outputDir: string
  ): Promise<void> {
    const assetsDir = join(projectPath, "assets");

    if (existsSync(assetsDir)) {
      const outputAssetsDir = join(outputDir, "assets");
      await mkdir(outputAssetsDir, { recursive: true });

      // TODO: Implement recursive asset copying
      // For now, just create the directory
    }
  }

  private async generateIndexHtml(outputDir: string): Promise<void> {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kuuzuki Game</title>
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
        <div>Built with Kuuzuki Game Engine</div>
    </div>
    <script type="module" src="main.js"></script>
</body>
</html>`;

    await writeFile(join(outputDir, "index.html"), html, "utf8");
  }

  async getProjectInfo(projectPath: string): Promise<any> {
    const packageJsonPath = join(projectPath, "package.json");

    if (!existsSync(packageJsonPath)) {
      throw new Error("package.json not found");
    }

    const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
    return packageJson;
  }

  formatFileSize(bytes: number): string {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(unitIndex > 0 ? 1 : 0)}${units[unitIndex]}`;
  }
}
