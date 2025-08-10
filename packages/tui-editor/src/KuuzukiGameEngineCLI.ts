#!/usr/bin/env bun

import { MainMenuTUI } from "./components/MainMenuTUI";
import { ProjectManager } from "./ProjectManager";
import { KuuzukiEditor } from "./KuuzukiEditor";
import chalk from "chalk";
import * as fs from "fs";
import * as path from "path";

export interface KuuzukiGameEngineCLIOptions {
  width?: number;
  height?: number;
  currentDirectory?: string;
}

export class KuuzukiGameEngineCLI {
  private mainMenu: MainMenuTUI;
  private projectManager: ProjectManager;
  private running: boolean = false;
  private currentDirectory: string;

  constructor(options: KuuzukiGameEngineCLIOptions = {}) {
    this.currentDirectory = options.currentDirectory || process.cwd();

    const width = options.width || process.stdout.columns || 120;
    const height = options.height || process.stdout.rows || 30;

    this.projectManager = new ProjectManager();

    this.mainMenu = new MainMenuTUI("main-menu", {
      width,
      height,
      currentDirectory: this.currentDirectory,
      onOpenProject: (projectPath: string) => this.openProject(projectPath),
      onCreateProject: (projectName: string, template: string) =>
        this.createProject(projectName, template),
      onExit: () => this.exit(),
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Handle terminal resize
    process.stdout.on("resize", () => {
      const width = process.stdout.columns || 120;
      const height = process.stdout.rows || 30;
      this.mainMenu.width = width;
      this.mainMenu.height = height;
    });

    // Handle process termination
    process.on("SIGINT", () => {
      this.exit();
    });

    process.on("SIGTERM", () => {
      this.exit();
    });

    // Handle input
    if (process.stdin.setRawMode) {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding("utf8");

      process.stdin.on("data", (key: string) => {
        this.handleInput(key);
      });
    } else {
      console.log(
        chalk.yellow("⚠️  Raw mode not available - limited input support")
      );
    }
  }

  private handleInput(key: string): void {
    // Handle global shortcuts
    if (key === "\u0003") {
      // Ctrl+C
      this.exit();
      return;
    }

    // Pass input to main menu
    this.mainMenu.handleKeyPress(key);
  }

  public start(): void {
    this.running = true;

    // Clear screen and hide cursor
    console.clear();
    process.stdout.write("\x1B[?25l"); // Hide cursor

    console.log(chalk.cyan("🎮 Kuuzuki Game Engine - Starting TUI..."));
    console.log(chalk.gray("Loading interface..."));

    // Small delay to show loading message
    setTimeout(() => {
      this.gameLoop();
    }, 500);
  }

  private gameLoop(): void {
    if (!this.running) return;

    // Clear screen
    console.clear();

    // Create a simple buffer for rendering
    const buffer = this.createSimpleBuffer();

    // Render main menu
    this.mainMenu.render(buffer, 0);

    // Output buffer to console
    this.outputBuffer(buffer);

    // Continue loop
    setTimeout(() => this.gameLoop(), 50); // ~20 FPS
  }

  private createSimpleBuffer(): any {
    const width = process.stdout.columns || 120;
    const height = process.stdout.rows || 30;
    const buffer: string[][] = [];

    // Initialize buffer with spaces
    for (let y = 0; y < height; y++) {
      buffer[y] = [];
      for (let x = 0; x < width; x++) {
        buffer[y][x] = " ";
      }
    }

    return {
      width,
      height,
      buffer,
      clear: () => {
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            buffer[y][x] = " ";
          }
        }
      },
      drawText: (
        text: string,
        x: number,
        y: number,
        color?: any,
        bgColor?: any
      ) => {
        if (y >= 0 && y < height) {
          for (let i = 0; i < text.length && x + i < width && x + i >= 0; i++) {
            buffer[y][x + i] = text[i];
          }
        }
      },
      drawBorder: (
        x: number,
        y: number,
        width: number,
        height: number,
        color?: any
      ) => {
        // Top and bottom borders
        for (let i = 0; i < width; i++) {
          if (x + i >= 0 && x + i < this.width) {
            if (y >= 0 && y < this.height) buffer[y][x + i] = "─";
            if (y + height - 1 >= 0 && y + height - 1 < this.height) {
              buffer[y + height - 1][x + i] = "─";
            }
          }
        }

        // Left and right borders
        for (let i = 0; i < height; i++) {
          if (y + i >= 0 && y + i < this.height) {
            if (x >= 0 && x < this.width) buffer[y + i][x] = "│";
            if (x + width - 1 >= 0 && x + width - 1 < this.width) {
              buffer[y + i][x + width - 1] = "│";
            }
          }
        }

        // Corners
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
          buffer[y][x] = "┌";
        }
        if (
          x + width - 1 >= 0 &&
          x + width - 1 < this.width &&
          y >= 0 &&
          y < this.height
        ) {
          buffer[y][x + width - 1] = "┐";
        }
        if (
          x >= 0 &&
          x < this.width &&
          y + height - 1 >= 0 &&
          y + height - 1 < this.height
        ) {
          buffer[y + height - 1][x] = "└";
        }
        if (
          x + width - 1 >= 0 &&
          x + width - 1 < this.width &&
          y + height - 1 >= 0 &&
          y + height - 1 < this.height
        ) {
          buffer[y + height - 1][x + width - 1] = "┘";
        }
      },
    };
  }

  private outputBuffer(buffer: any): void {
    let output = "";
    for (let y = 0; y < buffer.height; y++) {
      for (let x = 0; x < buffer.width; x++) {
        output += buffer.buffer[y][x];
      }
      if (y < buffer.height - 1) output += "\n";
    }
    console.log(output);
  }

  private async openProject(projectPath: string): Promise<void> {
    try {
      console.clear();
      console.log(
        chalk.cyan(`🎮 Opening project: ${path.basename(projectPath)}`)
      );
      console.log(chalk.gray(`Path: ${projectPath}`));
      console.log(chalk.yellow("Starting TUI Editor..."));

      // Stop the main menu loop
      this.running = false;

      // Restore terminal
      if (process.stdin.setRawMode) {
        process.stdin.setRawMode(false);
      }
      process.stdout.write("\x1B[?25h"); // Show cursor

      // Start the editor
      const editor = new KuuzukiEditor({
        width: process.stdout.columns || 120,
        height: process.stdout.rows || 30,
        projectPath: projectPath,
      });

      editor.start();
    } catch (error) {
      console.error(chalk.red("❌ Failed to open project:"), error);
      // Restart main menu
      setTimeout(() => this.start(), 2000);
    }
  }

  private async createProject(
    projectName: string,
    template: string
  ): Promise<void> {
    try {
      console.clear();
      console.log(chalk.cyan(`🆕 Creating project: ${projectName}`));
      console.log(chalk.gray(`Template: ${template}`));
      console.log(chalk.gray(`Directory: ${this.currentDirectory}`));

      const projectPath = await this.projectManager.createProject(
        projectName,
        template,
        this.currentDirectory
      );

      console.log(chalk.green("✅ Project created successfully!"));
      console.log(chalk.white(`📁 Location: ${projectPath}`));
      console.log("");
      console.log(chalk.yellow("Opening project in TUI Editor..."));

      // Open the newly created project
      setTimeout(() => {
        this.openProject(projectPath);
      }, 1500);
    } catch (error) {
      console.error(chalk.red("❌ Failed to create project:"), error);
      console.log(chalk.gray("Press any key to return to main menu..."));

      // Wait for key press then restart main menu
      process.stdin.once("data", () => {
        this.start();
      });
    }
  }

  public exit(): void {
    this.running = false;

    // Restore terminal
    if (process.stdin.setRawMode) {
      process.stdin.setRawMode(false);
      process.stdin.pause();
    }
    process.stdout.write("\x1B[?25h"); // Show cursor

    console.clear();
    console.log(chalk.cyan("🎮 Kuuzuki Game Engine"));
    console.log(chalk.yellow("👋 Thanks for using Kuuzuki Game Engine!"));
    console.log(chalk.gray("Happy game development! 🚀"));
    console.log("");

    process.exit(0);
  }

  // Static method to start the CLI
  static start(options: KuuzukiGameEngineCLIOptions = {}): void {
    const cli = new KuuzukiGameEngineCLI(options);
    cli.start();
  }
}
