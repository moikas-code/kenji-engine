#!/usr/bin/env bun

// Dynamic imports for TUI to avoid module resolution issues
import { ProjectManager, configManager } from "../kenji";
import { existsSync } from "fs";
import { resolve, dirname } from "path";

interface CLIOptions {
  command?: string;
  project?: string;
  help?: boolean;
  version?: boolean;
}

class KenjiCLI {
  private projectManager: ProjectManager;

  constructor() {
    this.projectManager = new ProjectManager();
  }

  async run(args: string[]): Promise<void> {
    const options = this.parseArgs(args);

    if (options.help) {
      this.showHelp();
      return;
    }

    if (options.version) {
      this.showVersion();
      return;
    }

    // Handle specific commands
    switch (options.command) {
      case "create":
        await this.createProject(args.slice(1));
        break;

      case "run":
        await this.runProject(options.project);
        break;

      case "build":
        await this.buildProject(options.project);
        break;

      case "menu":
      case undefined:
        await this.showMenu();
        break;

      case "config":
        await this.handleConfigCommand(args.slice(1));
        break;

      default:
        console.error(`Unknown command: ${options.command}`);
        this.showHelp();
        process.exit(1);
    }
  }

  private parseArgs(args: string[]): CLIOptions {
    const options: CLIOptions = {};

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      switch (arg) {
        case "--help":
        case "-h":
          options.help = true;
          break;

        case "--version":
        case "-v":
          options.version = true;
          break;

        case "--project":
        case "-p":
          const nextArg = args[++i];
          if (nextArg) {
            options.project = nextArg;
          }
          break;

        default:
          if (!options.command && arg && !arg.startsWith("-")) {
            options.command = arg;
          }
          break;
      }
    }

    return options;
  }

  private showHelp(): void {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                               KENJI ENGINE                                   ║
║                          Terminal Game Engine                               ║
╚══════════════════════════════════════════════════════════════════════════════╝

Usage: kenji [command] [options]

Commands:
   menu                    Show the main menu (default)
   create <name>           Create a new game project
   run [path]              Run a game project
   build [path]            Build a game project for distribution
   config <cmd>            Manage configuration settings

Options:
  -h, --help              Show this help message
  -v, --version           Show version information
  -p, --project <path>    Specify project path

Examples:
  kenji                   # Show main menu
  kenji create "My Game"  # Create new project
  kenji run ./my-game     # Run specific project
  kenji build             # Build current directory project

For more information, visit: https://github.com/your-org/kenji-engine
`);
  }

  private showVersion(): void {
    console.log("");
    console.log(
      "\x1b[36m\x1b[1m    ██╗  ██╗███████╗███╗   ██╗     ██╗██╗\x1b[0m",
    );
    console.log(
      "\x1b[36m\x1b[1m    ██║ ██╔╝██╔════╝████╗  ██║     ██║██║\x1b[0m",
    );
    console.log(
      "\x1b[36m\x1b[1m    █████╔╝ █████╗  ██╔██╗ ██║     ██║██║\x1b[0m",
    );
    console.log("\x1b[36m    ██╔═██╗ ██╔══╝  ██║╚██╗██║██   ██║██║\x1b[0m");
    console.log("\x1b[36m    ██║  ██╗███████╗██║ ╚████║╚█████╔╝██║\x1b[0m");
    console.log("\x1b[36m    ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝ ╚════╝ ╚═╝\x1b[0m");
    console.log("");
    console.log("\x1b[37m\x1b[1m              Terminal Game Engine\x1b[0m");
    console.log("\x1b[90m                    v0.0.1\x1b[0m");
    console.log("");
    console.log("\x1b[2m    ────────────────────────────────────────\x1b[0m");
    console.log("");
    console.log("\x1b[37m  Built with TypeScript & Bun\x1b[0m");
    console.log("\x1b[90m  MIT License\x1b[0m");
    console.log("");
  }

  private async showMenu(): Promise<void> {
    // Use the new OpenTUI/SolidJS menu by spawning the menu script
    // This avoids issues with dynamic imports and context
    const { spawn } = await import("child_process");
    const { fileURLToPath } = await import("url");
    const { dirname, join } = await import("path");
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const menuScriptPath = join(__dirname, "menu.ts");
    
    // Debug info if needed
    if (process.env.KENJI_DEBUG === "true") {
      console.log("Running from:", process.cwd());
      console.log("Script location:", import.meta.url);
      console.log("Menu script:", menuScriptPath);
    }
    
    // Spawn the menu script with bun
    const child = spawn("bun", [menuScriptPath], {
      stdio: "inherit",
      env: process.env,
      cwd: dirname(menuScriptPath), // Run from the CLI directory
    });
    
    // Wait for the child process to exit
    await new Promise<void>((resolve, reject) => {
      child.on("error", (error) => {
        console.error("Failed to start TUI:", error);
        reject(error);
      });
      
      child.on("exit", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`TUI exited with code ${code}`));
        }
      });
    });
  }

  private async handleConfigCommand(args: string[]): Promise<void> {
    const subCommand = args[0];

    switch (subCommand) {
      case "diagnose":
      case "diag":
        this.diagnoseConfig();
        break;

      case "repair":
      case "fix":
        await this.repairConfig();
        break;

      case "path":
        console.log("Config path:", configManager.getGlobalConfigPath());
        break;

      case "create":
        await this.createDefaultConfig();
        break;

      default:
        this.showConfigHelp();
        break;
    }
  }

  private diagnoseConfig(): void {
    console.log("🔍 Kenji Engine Configuration Diagnostics");
    console.log("==========================================");

    const diagnostics = configManager.getConfigDiagnostics();

    console.log(`📁 Config Path: ${diagnostics.configPath}`);
    console.log(`📄 File Exists: ${diagnostics.configExists ? "✅" : "❌"}`);
    console.log(`📖 Readable: ${diagnostics.configReadable ? "✅" : "❌"}`);
    console.log(`✏️  Writable: ${diagnostics.configWritable ? "✅" : "❌"}`);
    console.log(
      `🔄 Using Defaults: ${diagnostics.usingDefaultConfig ? "⚠️" : "✅"}`,
    );

    console.log("\n📂 Directory Info:");
    console.log(`   Path: ${diagnostics.permissions.directory}`);
    console.log(
      `   Exists: ${diagnostics.permissions.directoryExists ? "✅" : "❌"}`,
    );
    console.log(
      `   Writable: ${diagnostics.permissions.directoryWritable ? "✅" : "❌"}`,
    );
    if (diagnostics.permissions.filePermissions) {
      console.log(
        `   File Permissions: ${diagnostics.permissions.filePermissions}`,
      );
    }

    console.log("\n🔄 Alternative Paths:");
    diagnostics.alternativePaths.forEach((path: string, index: number) => {
      console.log(`   ${index + 1}. ${path}`);
    });

    console.log("\n💡 Recommendations:");
    if (!diagnostics.configExists) {
      console.log(
        "   • Run 'kenji config create' to create a default config file",
      );
    }
    if (!diagnostics.configWritable) {
      console.log("   • Check file permissions and directory access");
      console.log("   • Run 'kenji config repair' to attempt automatic fix");
    }
    if (diagnostics.usingDefaultConfig && diagnostics.configExists) {
      console.log("   • Config file exists and is being loaded successfully");
      console.log(
        "   • Current config values happen to match defaults (this is normal)",
      );
      console.log(
        "   • To customize: Edit ~/.kenji-engine/config.json or use Settings UI",
      );
    }
    if (!diagnostics.usingDefaultConfig && diagnostics.configExists) {
      console.log("   • Configuration is customized and working correctly!");
    }
  }

  private async repairConfig(): Promise<void> {
    console.log("🔧 Attempting to repair configuration...");

    const result = await configManager.repairConfig();

    if (result.success) {
      console.log("✅ Config repair successful!");
    } else {
      console.log("❌ Config repair failed!");
    }

    console.log(`📝 Actions taken: ${result.actions.join(", ")}`);
    console.log(`💬 Message: ${result.message}`);
  }

  private async createDefaultConfig(): Promise<void> {
    console.log("📄 Creating default configuration file...");

    try {
      await configManager.saveGlobalConfig();
      console.log("✅ Default config created successfully!");
      console.log(`📁 Location: ${configManager.getGlobalConfigPath()}`);
    } catch (error) {
      console.error(
        "❌ Failed to create default config:",
        error instanceof Error ? error.message : String(error),
      );
      console.log(
        "💡 Try running 'kenji config repair' to fix permissions issues",
      );
    }
  }

  private showConfigHelp(): void {
    console.log(`
Kenji Engine Configuration Management

Usage: kenji config <command>

Commands:
  diagnose, diag    Show detailed configuration diagnostics
  repair, fix       Attempt to repair configuration issues
  create            Create a default configuration file
  path              Show current configuration file path

Examples:
  kenji config diagnose    # Show config status and issues
  kenji config repair      # Fix permission and access issues
  kenji config create      # Create fresh config file
  kenji config path        # Show where config is stored

The configuration system automatically tries multiple locations:
1. ~/.kenji-engine/config.json (primary)
2. ~/.config/kenji-engine/config.json (Linux/Mac)
3. %APPDATA%/kenji-engine/config.json (Windows)
4. ./kenji-engine/config.json (current directory)
5. System temp directory (fallback)

This ensures the app works even with permission restrictions.
`);
  }

  private async createProject(args: string[]): Promise<void> {
    if (args.length === 0) {
      console.error("❌ Project name is required");
      console.log("Usage: kenji create <project-name> [path]");
      process.exit(1);
    }

    const name = args[0] || "";
    const path = args[1] || "./";

    try {
      console.log("🔨 Creating new project...");
      await this.projectManager.createProject(name, path);

      console.log("");
      console.log("🎉 Project created successfully!");
      console.log("");
      console.log("Next steps:");
      console.log(`  cd ${name}`);
      console.log("  bun install");
      console.log("  bun run start");
    } catch (error) {
      console.error(
        "❌ Failed to create project:",
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  }

  private async runProject(projectPath?: string): Promise<void> {
    const path = projectPath || process.cwd();
    const configPath = resolve(path, "kenji.config.json");

    if (!existsSync(configPath)) {
      console.error("❌ No kenji.config.json found in the specified directory");
      console.log('Run "kenji create <name>" to create a new project');
      process.exit(1);
    }

    try {
      const config = await this.projectManager.loadProject(path);
      if (!config) {
        console.error("❌ Failed to load project configuration");
        process.exit(1);
      }

      console.log(`🚀 Running ${config.name}...`);

      // Import and run the project's entry file
      const entryPath = resolve(path, config.entry);
      if (!existsSync(entryPath)) {
        console.error(`❌ Entry file not found: ${config.entry}`);
        process.exit(1);
      }

      // Dynamic import of the game
      await import(entryPath);
    } catch (error) {
      console.error(
        "❌ Failed to run project:",
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  }

  private async buildProject(projectPath?: string): Promise<void> {
    const path = projectPath || process.cwd();

    try {
      const config = await this.projectManager.loadProject(path);
      if (!config) {
        console.error("❌ Failed to load project configuration");
        process.exit(1);
      }

      console.log(
        `🔨 Building ${config.name} for ${config.export.platform}...`,
      );
      console.log("🚧 Build functionality coming soon!");
      console.log("");
      console.log("Planned features:");
      console.log("- Bun bundling with optimization");
      console.log("- Standalone executables");
      console.log("- Multi-platform builds");
      console.log("- Asset bundling");
    } catch (error) {
      console.error(
        "❌ Failed to build project:",
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  const cli = new KenjiCLI();
  const args = process.argv.slice(2);

  try {
    await cli.run(args);
  } catch (error) {
    console.error(
      "❌ Kenji CLI error:",
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { KenjiCLI };
