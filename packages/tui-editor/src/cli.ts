#!/usr/bin/env bun

import { Command } from "commander";
import chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import { KuuzukiEditor } from "./KuuzukiEditor";
import { ProjectManager } from "./ProjectManager";
import { BuildManager } from "./BuildManager";
import { KuuzukiGameEngineCLI } from "./KuuzukiGameEngineCLI";

const program = new Command();

program
  .name("kuuzuki-editor")
  .description("Terminal-based visual game editor for Kuuzuki Game Engine")
  .version("1.0.0");

program
  .command("start")
  .description("Start the TUI editor")
  .option("-w, --width <width>", "Terminal width", "120")
  .option("-h, --height <height>", "Terminal height", "30")
  .option("-p, --project <path>", "Project path", process.cwd())
  .action((options: any) => {
    console.log(chalk.cyan("🚀 Starting Kuuzuki TUI Editor..."));
    console.log(chalk.gray(`Project: ${options.project}`));
    console.log(chalk.gray(`Terminal: ${options.width}x${options.height}`));

    try {
      const editor = new KuuzukiEditor({
        width: parseInt(options.width),
        height: parseInt(options.height),
        projectPath: options.project,
      });

      console.log(chalk.green("✓ Editor initialized"));
      console.log(chalk.yellow("Controls:"));
      console.log("  Tab: Switch panels");
      console.log("  Q: Quit");
      console.log("  Space: Pause/Resume game");
      console.log("  Arrow keys: Navigate");
      console.log("");

      editor.start();
    } catch (error) {
      console.error(chalk.red("❌ Failed to start editor:"), error);
      process.exit(1);
    }
  });

program
  .command("create <name>")
  .description("Create a new game project")
  .option("-t, --template <template>", "Project template", "breakout")
  .option("-d, --directory <dir>", "Target directory", process.cwd())
  .action(async (name: any, options: any) => {
    console.log(chalk.cyan(`🎮 Creating new game project: ${name}`));
    console.log(chalk.gray(`Template: ${options.template}`));
    console.log(chalk.gray(`Directory: ${options.directory}`));

    try {
      const projectManager = new ProjectManager();
      const projectPath = await projectManager.createProject(
        name,
        options.template,
        options.directory
      );

      console.log(chalk.green(`✅ Project created successfully!`));
      console.log(chalk.white(`📁 Location: ${projectPath}`));
      console.log("");
      console.log(chalk.yellow("Next steps:"));
      console.log(`  cd ${name}`);
      console.log("  bun install");
      console.log("  bun run dev");
      console.log("");
      console.log(chalk.cyan("Or start the TUI editor:"));
      console.log(`  kuuzuki-editor start --project ${projectPath}`);
    } catch (error) {
      console.error(chalk.red("❌ Failed to create project:"), error);
      process.exit(1);
    }
  });
program
  .command("build")
  .description("Build the current project")
  .option("-o, --output <path>", "Output directory", "dist")
  .option("-m, --minify", "Minify output", false)
  .option("-t, --target <target>", "Build target", "web")
  .option("-s, --sourcemap", "Generate sourcemaps", false)
  .action(async (options: any) => {
    console.log(chalk.cyan("🔨 Building project..."));
    console.log(chalk.gray(`Output: ${options.output}`));
    console.log(chalk.gray(`Target: ${options.target}`));
    console.log(chalk.gray(`Minify: ${options.minify ? "Yes" : "No"}`));

    try {
      const buildManager = new BuildManager();
      const result = await buildManager.buildProject({
        projectPath: process.cwd(),
        outputDir: options.output,
        minify: options.minify,
        target: options.target,
        sourcemap: options.sourcemap,
      });

      if (result.success) {
        console.log(chalk.green("✅ Build completed successfully!"));
        console.log(
          chalk.white(
            `📦 Bundle size: ${buildManager.formatFileSize(result.bundleSize)}`
          )
        );
        console.log(chalk.white(`⏱️  Build time: ${result.buildTime}ms`));
        console.log(chalk.white(`📁 Output: ${result.outputPath}`));

        if (result.warnings.length > 0) {
          console.log(chalk.yellow(`⚠️  ${result.warnings.length} warnings:`));
          result.warnings.forEach((warning) =>
            console.log(chalk.yellow(`   ${warning}`))
          );
        }
      } else {
        console.log(chalk.red("❌ Build failed!"));
        result.errors.forEach((error) => console.log(chalk.red(`   ${error}`)));
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red("❌ Build error:"), error);
      process.exit(1);
    }
  });
program
  .command("deploy")
  .description("Deploy to itch.io")
  .option("-k, --api-key <key>", "Itch.io API key")
  .option("-u, --user <user>", "Itch.io username")
  .option("-g, --game <game>", "Game name")
  .option("-c, --channel <channel>", "Release channel", "web")
  .option("-b, --build-first", "Build before deploying", true)
  .action(async (options: any) => {
    console.log(chalk.cyan("🚀 Deploying to itch.io..."));
    console.log(chalk.gray(`User: ${options.user || "Not specified"}`));
    console.log(chalk.gray(`Game: ${options.game || "Not specified"}`));
    console.log(chalk.gray(`Channel: ${options.channel}`));

    try {
      // Build first if requested
      if (options.buildFirst) {
        console.log(chalk.cyan("🔨 Building project first..."));
        const buildManager = new BuildManager();
        const buildResult = await buildManager.buildProject({
          projectPath: process.cwd(),
          outputDir: "dist",
          minify: true,
          target: "web",
          sourcemap: false,
        });

        if (!buildResult.success) {
          console.log(chalk.red("❌ Build failed! Cannot deploy."));
          buildResult.errors.forEach((error) =>
            console.log(chalk.red(`   ${error}`))
          );
          process.exit(1);
        }

        console.log(chalk.green("✅ Build completed!"));
      }

      // Check for butler (itch.io deployment tool)
      console.log(chalk.cyan("🔍 Checking for butler..."));

      // For now, show instructions since butler integration is complex
      console.log(
        chalk.yellow("⚠️  Automated deployment requires butler CLI tool")
      );
      console.log("");
      console.log(chalk.white("To deploy manually:"));
      console.log("1. Install butler: https://itch.io/docs/butler/");
      console.log("2. Login: butler login");
      console.log(
        `3. Push: butler push dist ${options.user}/${options.game}:${options.channel}`
      );
      console.log("");
      console.log(chalk.cyan("Or use the butler-deploy package:"));
      console.log("bun add @kuuzuki-ge/butler-deploy");
    } catch (error) {
      console.error(chalk.red("❌ Deployment error:"), error);
      process.exit(1);
    }
  });
async function showInteractiveMenu() {
  console.clear();
  console.log(chalk.cyan.bold("🎮 Kuuzuki Game Engine"));
  console.log(chalk.gray("Terminal-based Visual Game Editor"));
  console.log("");

  // Check for projects in current directory
  const currentDir = process.cwd();
  const projectDirs = findGameProjects(currentDir);

  console.log(chalk.yellow("📁 Available Actions:"));
  console.log("");
  console.log(chalk.white("1. 🆕 Create New Project"));
  console.log(chalk.white("2. 🎯 Open TUI Editor"));
  console.log(chalk.white("3. 🔨 Build Project"));
  console.log(chalk.white("4. 🚀 Deploy Project"));
  console.log(chalk.white("5. ❓ Show Help"));
  console.log(chalk.white("6. 🚪 Exit"));
  console.log("");

  if (projectDirs.length > 0) {
    console.log(chalk.green("🎮 Found Game Projects:"));
    projectDirs.forEach((dir, index) => {
      console.log(chalk.gray(`   ${index + 1}. ${path.basename(dir)}`));
    });
    console.log("");
  } else {
    console.log(
      chalk.gray("💡 Tip: Create a 'projects' folder to organize your games")
    );
    console.log("");
  }

  // Simple input handling using readline
  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(chalk.cyan("Choose an option (1-6): "), async (choice) => {
    rl.close();

    switch (choice.trim()) {
      case "1":
        console.log(chalk.green("🆕 Creating new project..."));
        await promptCreateProject();
        break;
      case "2":
        console.log(chalk.green("🎯 Opening TUI Editor..."));
        await promptOpenEditor(projectDirs);
        break;
      case "3":
        console.log(chalk.green("🔨 Building project..."));
        await promptBuildProject();
        break;
      case "4":
        console.log(chalk.green("🚀 Deploying project..."));
        await promptDeployProject();
        break;
      case "5":
        console.log(chalk.green("❓ Showing help..."));
        program.outputHelp();
        process.exit(0);
        break;
      case "6":
      case "q":
        console.log(chalk.yellow("👋 Goodbye!"));
        process.exit(0);
        break;
      default:
        console.log(chalk.red(`❌ Invalid choice: ${choice}`));
        console.log(chalk.gray("Please run the command again and choose 1-6"));
        process.exit(1);
    }
  });
}

function findGameProjects(dir: string): string[] {
  const projects: string[] = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const projectPath = path.join(dir, entry.name);
        const packageJsonPath = path.join(projectPath, "package.json");

        if (fs.existsSync(packageJsonPath)) {
          try {
            const packageJson = JSON.parse(
              fs.readFileSync(packageJsonPath, "utf8")
            );
            if (
              packageJson.dependencies &&
              (packageJson.dependencies["@kuuzuki-ge/core"] ||
                packageJson.name?.includes("kuuzuki"))
            ) {
              projects.push(projectPath);
            }
          } catch (e) {
            // Skip invalid package.json files
          }
        }
      }
    }
  } catch (e) {
    // Skip directories we can't read
  }

  return projects;
}

async function promptCreateProject() {
  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(chalk.cyan("🎮 Create New Game Project"));
  console.log(chalk.gray("Available templates: breakout, platformer, empty"));
  console.log("");

  rl.question(chalk.white("Project name: "), async (name: string) => {
    if (!name.trim()) {
      console.log(chalk.red("❌ Project name is required"));
      rl.close();
      process.exit(1);
      return;
    }

    rl.question(
      chalk.white("Template (breakout/platformer/empty) [breakout]: "),
      async (template: string) => {
        rl.close();

        const selectedTemplate = template.trim() || "breakout";

        try {
          console.log(
            chalk.cyan(
              `🎮 Creating ${name} with ${selectedTemplate} template...`
            )
          );

          const projectManager = new ProjectManager();
          const projectPath = await projectManager.createProject(
            name.trim(),
            selectedTemplate,
            process.cwd()
          );

          console.log(chalk.green(`✅ Project created successfully!`));
          console.log(chalk.white(`📁 Location: ${projectPath}`));
          console.log("");
          console.log(chalk.yellow("Next steps:"));
          console.log(`  cd ${name.trim()}`);
          console.log("  bun install");
          console.log("  bun run dev");
          console.log("");
          console.log(chalk.cyan("Or start the TUI editor:"));
          console.log(`  kuuzuki-editor start --project ${projectPath}`);
        } catch (error) {
          console.error(chalk.red("❌ Failed to create project:"), error);
          process.exit(1);
        }
      }
    );
  });
}

async function promptOpenEditor(projects: string[]) {
  if (projects.length === 0) {
    console.log(chalk.yellow("No game projects found in current directory."));
    console.log(chalk.gray("Run: kuuzuki-editor start --project <path>"));
  } else if (projects.length === 1) {
    console.log(chalk.green(`Opening ${path.basename(projects[0])}...`));
    // Start editor with the project
    const editor = new KuuzukiEditor({
      width: 120,
      height: 30,
      projectPath: projects[0],
    });
    editor.start();
  } else {
    console.log(chalk.cyan("Multiple projects found. Choose one:"));
    projects.forEach((project, index) => {
      console.log(chalk.white(`${index + 1}. ${path.basename(project)}`));
    });
    console.log(chalk.gray("Run: kuuzuki-editor start --project <path>"));
  }
  process.exit(0);
}

async function promptBuildProject() {
  console.log(chalk.gray("Run: kuuzuki-editor build"));
  process.exit(0);
}

async function promptDeployProject() {
  console.log(chalk.gray("Run: kuuzuki-editor deploy"));
  process.exit(0);
}

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error(chalk.red("💥 Uncaught Exception:"), error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error(
    chalk.red("💥 Unhandled Rejection at:"),
    promise,
    "reason:",
    reason
  );
  process.exit(1);
});

// If no command provided, show new TUI interface
if (!process.argv.slice(2).length) {
  KuuzukiGameEngineCLI.start({
    currentDirectory: process.cwd(),
  });
} else {
  // Parse command line arguments
  program.parse();
}
