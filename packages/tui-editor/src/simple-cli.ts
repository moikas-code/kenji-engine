#!/usr/bin/env bun

import chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import { StandaloneProjectManager } from "./StandaloneProjectManager";

// Simple ASCII art for the logo
const KENJI_LOGO = `
██╗  ██╗███████╗███╗   ██╗     ██╗██╗
██║ ██╔╝██╔════╝████╗  ██║     ██║██║
█████╔╝ █████╗  ██╔██╗ ██║     ██║██║
██╔═██╗ ██╔══╝  ██║╚██╗██║██   ██║██║
██║  ██╗███████╗██║ ╚████║╚█████╔╝██║
╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝ ╚════╝ ╚═╝
                 GAME ENGINE                          `;

interface MenuOption {
  key: string;
  label: string;
  description: string;
  icon: string;
}

class SimpleKenjiCLI {
  private currentDirectory: string;
  private projectManager: StandaloneProjectManager;
  private options: MenuOption[];

  constructor() {
    this.currentDirectory = process.cwd();
    this.projectManager = new StandaloneProjectManager();
    this.options = [
      {
        key: "1",
        label: "Open Project",
        description: "Browse and open an existing game project",
        icon: "📂",
      },
      {
        key: "2",
        label: "Create New Project",
        description: "Start a new game project with templates",
        icon: "🆕",
      },
      {
        key: "3",
        label: "Recent Projects",
        description: "Open recently used projects",
        icon: "🕒",
      },
      {
        key: "4",
        label: "Example Projects",
        description: "Explore example games and templates",
        icon: "🎮",
      },
      {
        key: "5",
        label: "Settings",
        description: "Configure editor preferences",
        icon: "⚙️",
      },
      {
        key: "6",
        label: "Help & Documentation",
        description: "View guides and documentation",
        icon: "❓",
      },
      {
        key: "q",
        label: "Exit",
        description: "Close the Kenji Game Engine",
        icon: "🚪",
      },
    ];
  }

  public async start(): Promise<void> {
    console.clear();
    this.showLogo();
    await this.showMainMenu();
  }

  private showLogo(): void {
    console.log(chalk.cyan(KENJI_LOGO));
    console.log(chalk.gray("    Terminal-based Visual Game Editor"));
    console.log("");
    console.log(chalk.yellow(`📁 Current Directory: ${this.currentDirectory}`));
    console.log("");
  }

  private async showMainMenu(): Promise<void> {
    console.log(chalk.white.bold("🎮 Main Menu"));
    console.log("");

    for (const option of this.options) {
      console.log(chalk.white(`${option.key}. ${option.icon} ${option.label}`));
      console.log(chalk.gray(`   ${option.description}`));
      console.log("");
    }

    const readline = require("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(chalk.cyan("Choose an option: "), async (choice: string) => {
      rl.close();
      await this.handleChoice(choice.trim());
    });
  }

  private async handleChoice(choice: string): Promise<void> {
    switch (choice) {
      case "1":
        await this.openProject();
        break;
      case "2":
        await this.createProject();
        break;
      case "3":
        console.log(chalk.yellow("📝 Recent projects feature coming soon!"));
        await this.waitAndRestart();
        break;
      case "4":
        console.log(chalk.yellow("📝 Example projects feature coming soon!"));
        await this.waitAndRestart();
        break;
      case "5":
        console.log(chalk.yellow("📝 Settings feature coming soon!"));
        await this.waitAndRestart();
        break;
      case "6":
        this.showHelp();
        await this.waitAndRestart();
        break;
      case "q":
      case "Q":
        this.exit();
        break;
      default:
        console.log(chalk.red(`❌ Invalid choice: ${choice}`));
        await this.waitAndRestart();
    }
  }

  private async openProject(): Promise<void> {
    console.clear();
    console.log(chalk.cyan("📂 Open Project"));
    console.log("");

    // Find projects in current directory
    const projects = this.findGameProjects(this.currentDirectory);

    if (projects.length === 0) {
      console.log(chalk.yellow("No game projects found in current directory."));
      console.log(
        chalk.gray(
          "Create a new project or navigate to a directory with existing projects."
        )
      );
      await this.waitAndRestart();
      return;
    }

    console.log(chalk.green(`Found ${projects.length} game project(s):`));
    console.log("");

    projects.forEach((project, index) => {
      console.log(chalk.white(`${index + 1}. ${path.basename(project)}`));
      console.log(chalk.gray(`   ${project}`));
    });

    console.log("");
    console.log(chalk.gray("0. Back to main menu"));
    console.log("");

    const readline = require("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(chalk.cyan("Select a project: "), async (choice: string) => {
      rl.close();
      const index = parseInt(choice) - 1;

      if (choice === "0") {
        console.clear();
        await this.start();
        return;
      }

      if (index >= 0 && index < projects.length) {
        const projectPath = projects[index];
        console.log(
          chalk.green(`🎮 Opening project: ${path.basename(projectPath)}`)
        );
        console.log(chalk.gray(`Path: ${projectPath}`));
        console.log("");
        console.log(chalk.yellow("🚀 Starting TUI Editor..."));
        console.log(chalk.gray("(This would launch the full TUI editor)"));

        // Here you would launch the actual TUI editor
        // For now, just show success message
        setTimeout(() => {
          console.log(chalk.green("✅ Project opened successfully!"));
          process.exit(0);
        }, 1500);
      } else {
        console.log(chalk.red("❌ Invalid selection"));
        await this.waitAndRestart();
      }
    });
  }

  private async createProject(): Promise<void> {
    console.clear();
    console.log(chalk.cyan("🆕 Create New Project"));
    console.log("");

    const readline = require("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(chalk.white("Project name: "), async (name: string) => {
      if (!name.trim()) {
        console.log(chalk.red("❌ Project name is required"));
        rl.close();
        await this.waitAndRestart();
        return;
      }

      console.log("");
      console.log(chalk.white("Available templates:"));
      console.log("1. breakout");
      console.log("2. empty (default)");
      console.log("");

      rl.question(
        chalk.white("Choose template (1-2) [2]: "),
        async (templateChoice: string) => {
          rl.close();

          const templates = ["breakout", "empty"];
          const templateIndex = parseInt(templateChoice) - 1;
          const template = templates[templateIndex] || "empty";

          try {
            console.log("");
            console.log(
              chalk.cyan(`🎮 Creating ${name} with ${template} template...`)
            );

            const projectPath = await this.projectManager.createProject(
              name.trim(),
              template,
              this.currentDirectory
            );

            console.log(chalk.green("✅ Project created successfully!"));
            console.log(chalk.white(`📁 Location: ${projectPath}`));
            console.log("");
            console.log(chalk.yellow("Next steps:"));
            console.log(`  cd ${name.trim()}`);
            console.log("  bun install");
            console.log("  bun run dev");
            console.log("");
            console.log(chalk.cyan("Or run: kenji-editor to open in TUI"));

            process.exit(0);
          } catch (error) {
            console.error(chalk.red("❌ Failed to create project:"), error);
            await this.waitAndRestart();
          }
        }
      );
    });
  }

  private findGameProjects(dir: string): string[] {
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
                (packageJson.dependencies["@kenji-ge/core"] ||
                  packageJson.name?.includes("kenji"))
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

  private showHelp(): void {
    console.clear();
    console.log(chalk.cyan("❓ Kenji Game Engine Help"));
    console.log("");
    console.log("Usage:");
    console.log("  kenji-editor                 Start the interactive TUI");
    console.log("  kenji-editor start           Start TUI editor directly");
    console.log("  kenji-editor create <name>   Create a new project");
    console.log("  kenji-editor build           Build current project");
    console.log("  kenji-editor deploy          Deploy to itch.io");
    console.log("");
    console.log(chalk.white("TUI Controls:"));
    console.log("  ↑↓ Arrow Keys    Navigate menus");
    console.log("  Enter           Select option");
    console.log("  Q               Quit");
    console.log("  Tab             Switch panels (in editor)");
    console.log("  Space           Pause/Resume game (in editor)");
    console.log("");
    console.log(chalk.white("Project Structure:"));
    console.log("  src/            Source code");
    console.log("  assets/         Game assets");
    console.log("  dist/           Built output");
    console.log("  package.json    Project configuration");
    console.log("");
    console.log(chalk.gray("For more help, visit: https://kenji.com/docs"));
  }

  private async waitAndRestart(): Promise<void> {
    console.log("");
    console.log(chalk.gray("Press any key to return to main menu..."));

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.once("data", () => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      console.clear();
      this.start();
    });
  }

  private exit(): void {
    console.clear();
    console.log(chalk.cyan("🎮 Kenji Game Engine"));
    console.log(chalk.yellow("👋 Thanks for using Kenji Game Engine!"));
    console.log(chalk.gray("Happy game development! 🚀"));
    console.log("");
    process.exit(0);
  }
}

// Start the CLI
const cli = new SimpleKenjiCLI();
cli.start().catch(console.error);
