import { promises as fs } from "fs";
import path from "path";
import {
  ButlerDeployer,
  ItchConfig,
  DeploymentConfig,
  DeploymentResult,
} from "./ButlerDeployer.js";
import { GameMetadata, ManifestGenerator } from "./GameManifest.js";

export interface PipelineConfig {
  projectRoot: string;
  buildDir: string;
  outputDir: string;
  itch: ItchConfig;
  metadata: GameMetadata;
  targets: BuildTarget[];
}

export interface BuildTarget {
  name: string;
  platform: "web" | "desktop";
  channel: string;
  buildCommand?: string;
  postBuild?: string[];
}

export interface PipelineResult {
  success: boolean;
  builds: BuildResult[];
  deployments: DeploymentResult[];
  errors: string[];
}

export interface BuildResult {
  target: string;
  success: boolean;
  outputPath: string;
  files: string[];
  size: number;
}

export class DeploymentPipeline {
  private config: PipelineConfig;
  private deployer: ButlerDeployer;

  constructor(config: PipelineConfig) {
    this.config = config;
    this.deployer = new ButlerDeployer(config.itch);
  }

  async run(
    options: {
      dryRun?: boolean;
      skipBuild?: boolean;
      skipDeploy?: boolean;
      changelog?: string;
      version?: string;
    } = {}
  ): Promise<PipelineResult> {
    const result: PipelineResult = {
      success: true,
      builds: [],
      deployments: [],
      errors: [],
    };

    try {
      // Verify butler is available
      const butlerAvailable = await this.deployer.verifyButler();
      if (!butlerAvailable && !options.skipDeploy) {
        throw new Error(
          "Butler CLI not found. Please install butler from https://itch.io/docs/butler/"
        );
      }

      // Login to itch.io if not dry run
      if (!options.dryRun && !options.skipDeploy) {
        const loginSuccess = await this.deployer.login();
        if (!loginSuccess) {
          throw new Error("Failed to login to itch.io. Check your API key.");
        }
      }

      // Build for each target
      if (!options.skipBuild) {
        for (const target of this.config.targets) {
          try {
            const buildResult = await this.buildTarget(target, options.version);
            result.builds.push(buildResult);

            if (!buildResult.success) {
              result.success = false;
              result.errors.push(`Build failed for target: ${target.name}`);
            }
          } catch (error) {
            result.success = false;
            result.errors.push(`Build error for ${target.name}: ${error}`);
          }
        }
      }

      // Deploy each successful build
      if (!options.skipDeploy && result.builds.some((b) => b.success)) {
        for (const build of result.builds.filter((b) => b.success)) {
          try {
            const target = this.config.targets.find(
              (t) => t.name === build.target
            );
            if (!target) continue;

            const deployConfig: DeploymentConfig = {
              buildDir: build.outputPath,
              version: options.version,
              changelog: options.changelog,
              dryRun: options.dryRun,
            };

            // Update deployer config for this target
            this.deployer = new ButlerDeployer({
              ...this.config.itch,
              channel: target.channel,
            });

            const deployResult = await this.deployer.push(deployConfig);
            result.deployments.push(deployResult);

            if (!deployResult.success) {
              result.success = false;
              result.errors.push(`Deployment failed for ${target.name}`);
            }
          } catch (error) {
            result.success = false;
            result.errors.push(`Deploy error for ${build.target}: ${error}`);
          }
        }
      }
    } catch (error) {
      result.success = false;
      result.errors.push(`Pipeline error: ${error}`);
    }

    return result;
  }

  private async buildTarget(
    target: BuildTarget,
    version?: string
  ): Promise<BuildResult> {
    const targetOutputDir = path.join(this.config.outputDir, target.name);

    // Ensure output directory exists
    await fs.mkdir(targetOutputDir, { recursive: true });

    // Copy build files
    await this.copyBuildFiles(this.config.buildDir, targetOutputDir);

    // Generate platform-specific files
    await this.generatePlatformFiles(target, targetOutputDir, version);

    // Run post-build commands if specified
    if (target.postBuild) {
      for (const command of target.postBuild) {
        console.log(`Running post-build command: ${command}`);
        // Would execute command here
      }
    }

    // Calculate build size and list files
    const files = await this.listFiles(targetOutputDir);
    const size = await this.calculateSize(targetOutputDir);

    return {
      target: target.name,
      success: true,
      outputPath: targetOutputDir,
      files,
      size,
    };
  }

  private async copyBuildFiles(
    sourceDir: string,
    targetDir: string
  ): Promise<void> {
    try {
      // Ensure source directory exists
      await fs.access(sourceDir);

      const entries = await fs.readdir(sourceDir, { withFileTypes: true });

      for (const entry of entries) {
        const sourcePath = path.join(sourceDir, entry.name);
        const targetPath = path.join(targetDir, entry.name);

        // Skip if target would be inside source (prevent recursion)
        if (targetPath.startsWith(sourceDir)) {
          continue;
        }

        if (entry.isDirectory()) {
          // Skip deploy directories to prevent recursion
          if (entry.name === "deploy") {
            continue;
          }
          await fs.mkdir(targetPath, { recursive: true });
          await this.copyBuildFiles(sourcePath, targetPath);
        } else {
          await fs.copyFile(sourcePath, targetPath);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not copy build files: ${error}`);
    }
  }

  private async generatePlatformFiles(
    target: BuildTarget,
    outputDir: string,
    version?: string
  ): Promise<void> {
    const metadata = {
      ...this.config.metadata,
      version: version || this.config.metadata.version,
    };

    // Generate itch.io manifest
    const manifest = ManifestGenerator.generateItchManifest(metadata);
    await fs.writeFile(
      path.join(outputDir, ".itch.toml"),
      this.tomlStringify(manifest)
    );

    // Generate package.json
    const packageJson = ManifestGenerator.generatePackageJson(metadata);
    await fs.writeFile(
      path.join(outputDir, "package.json"),
      JSON.stringify(packageJson, null, 2)
    );

    // Generate README
    const readme = ManifestGenerator.generateReadme(metadata);
    await fs.writeFile(path.join(outputDir, "README.md"), readme);

    // Generate build info
    const buildInfo = {
      target: target.name,
      platform: target.platform,
      channel: target.channel,
      version: metadata.version,
      buildTime: new Date().toISOString(),
      engine: "Kuuzuki Game Engine",
      engineVersion: "0.0.1",
    };

    await fs.writeFile(
      path.join(outputDir, "build-info.json"),
      JSON.stringify(buildInfo, null, 2)
    );
  }

  private async listFiles(dir: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const subFiles = await this.listFiles(path.join(dir, entry.name));
          files.push(...subFiles.map((f) => path.join(entry.name, f)));
        } else {
          files.push(entry.name);
        }
      }
    } catch (error) {
      console.warn(`Could not list files in ${dir}:`, error);
    }

    return files;
  }

  private async calculateSize(dir: string): Promise<number> {
    let totalSize = 0;

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          totalSize += await this.calculateSize(fullPath);
        } else {
          const stats = await fs.stat(fullPath);
          totalSize += stats.size;
        }
      }
    } catch (error) {
      console.warn(`Could not calculate size for ${dir}:`, error);
    }

    return totalSize;
  }

  private tomlStringify(obj: any): string {
    const lines: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        lines.push(`${key} = [`);
        for (const item of value) {
          if (typeof item === "object") {
            lines.push(
              `  { ${Object.entries(item)
                .map(([k, v]) => `${k} = "${v}"`)
                .join(", ")} },`
            );
          } else {
            lines.push(`  "${item}",`);
          }
        }
        lines.push(`]`);
      } else if (typeof value === "object") {
        lines.push(`[${key}]`);
        if (value && typeof value === "object") {
          for (const [subKey, subValue] of Object.entries(value)) {
            lines.push(`${subKey} = "${subValue}"`);
          }
        }
      } else {
        lines.push(`${key} = "${value}"`);
      }
    }

    return lines.join("\n");
  }
}
