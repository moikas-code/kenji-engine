#!/usr/bin/env bun

import { parseArgs } from "util";
import { promises as fs } from "fs";
import path from "path";
import { DeploymentPipeline, PipelineConfig } from "./DeploymentPipeline.js";

interface CLIOptions {
  config?: string;
  "dry-run"?: boolean;
  "skip-build"?: boolean;
  "skip-deploy"?: boolean;
  version?: string;
  changelog?: string;
  help?: boolean;
}

const HELP_TEXT = `
Kuuzuki Game Engine - Itch.io Deployment Tool

Usage: bun deploy [options]

Options:
  --config <path>     Path to deployment config file (default: deploy.config.json)
  --dry-run          Run deployment without actually pushing to itch.io
  --skip-build       Skip the build step and use existing build
  --skip-deploy      Only build, don't deploy
  --version <ver>    Override version number
  --changelog <msg>  Add changelog message
  --help             Show this help message

Environment Variables:
  BUTLER_API_KEY     Your itch.io API key (required for deployment)
  ITCH_USER          Your itch.io username (can be set in config)
  ITCH_GAME          Your itch.io game name (can be set in config)

Examples:
  bun deploy                           # Deploy with default config
  bun deploy --dry-run                 # Test deployment without pushing
  bun deploy --version "1.0.0"        # Deploy with specific version
  bun deploy --skip-build              # Deploy existing build
  bun deploy --config custom.json     # Use custom config file
`;

async function loadConfig(configPath: string): Promise<PipelineConfig> {
  try {
    const configFile = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(configFile);

    // Validate required fields
    if (!config.itch?.user || !config.itch?.game) {
      throw new Error("Config must include itch.user and itch.game");
    }

    if (!config.metadata?.title || !config.metadata?.author) {
      throw new Error("Config must include metadata.title and metadata.author");
    }

    return config;
  } catch (error) {
    if (error instanceof Error && error.message.includes("ENOENT")) {
      throw new Error(`Config file not found: ${configPath}`);
    }
    throw error;
  }
}

async function generateDefaultConfig(): Promise<PipelineConfig> {
  const packageJsonPath = path.join(process.cwd(), "package.json");
  let packageJson: any = {};

  try {
    const packageContent = await fs.readFile(packageJsonPath, "utf-8");
    packageJson = JSON.parse(packageContent);
  } catch (error) {
    console.warn("Could not read package.json, using defaults");
  }

  return {
    projectRoot: process.cwd(),
    buildDir: path.join(process.cwd(), "dist"),
    outputDir: path.join(process.cwd(), "dist", "deploy"),
    itch: {
      user: process.env.ITCH_USER || "your-username",
      game: process.env.ITCH_GAME || "your-game",
      channel: "web",
    },
    metadata: {
      title: packageJson.name || "My Game",
      author: packageJson.author || "Game Developer",
      version: packageJson.version || "1.0.0",
      description:
        packageJson.description || "A game built with Kuuzuki Game Engine",
      tags: ["html5", "arcade", "kuuzuki-ge"],
      genre: "Arcade",
      platforms: ["web"],
      minPlayers: 1,
      maxPlayers: 1,
      controls: ["Arrow keys or WASD to move", "Mouse to interact with UI"],
      features: [
        "Classic arcade gameplay",
        "Pixel-perfect graphics",
        "Responsive controls",
        "Web-based - no download required",
      ],
    },
    targets: [
      {
        name: "web",
        platform: "web",
        channel: "web",
      },
    ],
  };
}

async function main() {
  try {
    const { values: options } = parseArgs({
      args: process.argv.slice(2),
      options: {
        config: { type: "string" },
        "dry-run": { type: "boolean" },
        "skip-build": { type: "boolean" },
        "skip-deploy": { type: "boolean" },
        version: { type: "string" },
        changelog: { type: "string" },
        help: { type: "boolean" },
      },
    }) as { values: CLIOptions };

    if (options.help) {
      console.log(HELP_TEXT);
      process.exit(0);
    }

    // Load or generate config
    const configPath =
      options.config || path.join(process.cwd(), "deploy.config.json");
    let config: PipelineConfig;

    try {
      config = await loadConfig(configPath);
      console.log(`✓ Loaded config from ${configPath}`);
    } catch (error) {
      console.log(`⚠ Config file not found, generating default config...`);
      config = await generateDefaultConfig();

      // Save default config for future use
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
      console.log(`✓ Generated default config at ${configPath}`);
      console.log(
        `⚠ Please edit the config file to set your itch.io username and game name`
      );
    }

    // Override config with environment variables
    if (process.env.ITCH_USER) {
      config.itch.user = process.env.ITCH_USER;
    }
    if (process.env.ITCH_GAME) {
      config.itch.game = process.env.ITCH_GAME;
    }

    // Validate API key for deployment
    if (
      !options["skip-deploy"] &&
      !options["dry-run"] &&
      !process.env.BUTLER_API_KEY
    ) {
      console.error(
        "❌ BUTLER_API_KEY environment variable is required for deployment"
      );
      console.log(
        "   Get your API key from: https://itch.io/user/settings/api-keys"
      );
      process.exit(1);
    }

    // Create pipeline and run
    const pipeline = new DeploymentPipeline(config);

    console.log(`🚀 Starting deployment pipeline...`);
    console.log(`   Game: ${config.metadata.title}`);
    console.log(`   Target: ${config.itch.user}/${config.itch.game}`);
    console.log(`   Version: ${options.version || config.metadata.version}`);

    if (options["dry-run"]) {
      console.log(`   Mode: DRY RUN (no actual deployment)`);
    }

    const result = await pipeline.run({
      dryRun: options["dry-run"],
      skipBuild: options["skip-build"],
      skipDeploy: options["skip-deploy"],
      version: options.version,
      changelog: options.changelog,
    });

    // Report results
    console.log("\n📊 Deployment Results:");

    if (result.builds.length > 0) {
      console.log("\n🔨 Builds:");
      for (const build of result.builds) {
        const status = build.success ? "✓" : "❌";
        const sizeKB = Math.round(build.size / 1024);
        console.log(
          `   ${status} ${build.target}: ${build.files.length} files, ${sizeKB}KB`
        );
      }
    }

    if (result.deployments.length > 0) {
      console.log("\n🚀 Deployments:");
      for (const deploy of result.deployments) {
        const status = deploy.success ? "✓" : "❌";
        console.log(`   ${status} ${deploy.version}: ${deploy.url}`);
      }
    }

    if (result.errors.length > 0) {
      console.log("\n❌ Errors:");
      for (const error of result.errors) {
        console.log(`   • ${error}`);
      }
    }

    if (result.success) {
      console.log("\n🎉 Deployment completed successfully!");
      if (result.deployments.length > 0) {
        console.log(`\n🎮 Play your game at: ${result.deployments[0].url}`);
      }
    } else {
      console.log("\n💥 Deployment failed!");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
