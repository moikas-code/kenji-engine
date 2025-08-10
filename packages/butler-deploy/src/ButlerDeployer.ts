import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";

export interface ItchConfig {
  user: string;
  game: string;
  channel: string;
  apiKey?: string;
}

export interface DeploymentConfig {
  buildDir: string;
  version?: string;
  userVersion?: string;
  changelog?: string;
  dryRun?: boolean;
}

export interface DeploymentResult {
  success: boolean;
  version: string;
  buildId?: string;
  url: string;
  logs: string[];
  errors: string[];
}

export class ButlerDeployer {
  private butlerPath: string;
  private config: ItchConfig;

  constructor(config: ItchConfig, butlerPath = "butler") {
    this.config = config;
    this.butlerPath = butlerPath;
  }

  async verifyButler(): Promise<boolean> {
    try {
      const result = await this.runCommand([this.butlerPath, "--version"]);
      return result.success;
    } catch (error) {
      return false;
    }
  }

  async login(apiKey?: string): Promise<boolean> {
    const key = apiKey || this.config.apiKey || process.env.BUTLER_API_KEY;

    if (!key) {
      throw new Error(
        "No API key provided. Set BUTLER_API_KEY environment variable or pass apiKey parameter."
      );
    }

    try {
      const result = await this.runCommand([this.butlerPath, "login"], key);
      return result.success;
    } catch (error) {
      console.error("Butler login failed:", error);
      return false;
    }
  }

  async push(deployConfig: DeploymentConfig): Promise<DeploymentResult> {
    const {
      buildDir,
      version,
      userVersion,
      changelog,
      dryRun = false,
    } = deployConfig;

    // Verify build directory exists
    try {
      await fs.access(buildDir);
    } catch (error) {
      throw new Error(`Build directory does not exist: ${buildDir}`);
    }

    // Generate version if not provided
    const finalVersion = version || this.generateVersion();
    const finalUserVersion = userVersion || finalVersion;

    // Build butler command
    const target = `${this.config.user}/${this.config.game}:${this.config.channel}`;
    const args = [
      this.butlerPath,
      "push",
      buildDir,
      target,
      "--userversion",
      finalUserVersion,
    ];

    if (dryRun) {
      args.push("--dry-run");
    }

    if (changelog) {
      // Write changelog to temporary file
      const changelogPath = path.join(buildDir, ".butler-changelog.txt");
      await fs.writeFile(changelogPath, changelog);
      args.push("--userversion-file", changelogPath);
    }

    console.log(`Deploying to ${target} (version: ${finalUserVersion})`);

    try {
      const result = await this.runCommand(args);

      // Clean up changelog file if created
      if (changelog) {
        const changelogPath = path.join(buildDir, ".butler-changelog.txt");
        try {
          await fs.unlink(changelogPath);
        } catch (error) {
          // Ignore cleanup errors
        }
      }

      return {
        success: result.success,
        version: finalVersion,
        buildId: this.extractBuildId(result.stdout),
        url: `https://${this.config.user}.itch.io/${this.config.game}`,
        logs: result.stdout,
        errors: result.stderr,
      };
    } catch (error) {
      throw new Error(`Deployment failed: ${error}`);
    }
  }

  async status(): Promise<any> {
    const target = `${this.config.user}/${this.config.game}:${this.config.channel}`;
    const result = await this.runCommand([this.butlerPath, "status", target]);

    if (result.success) {
      return this.parseStatusOutput(result.stdout);
    }

    throw new Error(`Failed to get status: ${result.stderr.join("\n")}`);
  }

  private async runCommand(
    args: string[],
    input?: string
  ): Promise<{
    success: boolean;
    stdout: string[];
    stderr: string[];
  }> {
    return new Promise((resolve, reject) => {
      const process = spawn(args[0], args.slice(1), {
        stdio: input ? "pipe" : "inherit",
      });

      const stdout: string[] = [];
      const stderr: string[] = [];

      if (process.stdout) {
        process.stdout.on("data", (data) => {
          const lines = data.toString().split("\n").filter(Boolean);
          stdout.push(...lines);
          lines.forEach((line: string) => console.log(`[butler] ${line}`));
        });
      }

      if (process.stderr) {
        process.stderr.on("data", (data) => {
          const lines = data.toString().split("\n").filter(Boolean);
          stderr.push(...lines);
          lines.forEach((line: string) => console.error(`[butler] ${line}`));
        });
      }

      if (input && process.stdin) {
        process.stdin.write(input);
        process.stdin.end();
      }

      process.on("close", (code) => {
        resolve({
          success: code === 0,
          stdout,
          stderr,
        });
      });

      process.on("error", (error) => {
        reject(error);
      });
    });
  }

  private generateVersion(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const hour = now.getHours().toString().padStart(2, "0");
    const minute = now.getMinutes().toString().padStart(2, "0");

    return `${year}.${month}.${day}-${hour}${minute}`;
  }

  private extractBuildId(logs: string[]): string | undefined {
    for (const log of logs) {
      const match = log.match(/Build ID: (\d+)/);
      if (match) {
        return match[1];
      }
    }
    return undefined;
  }

  private parseStatusOutput(logs: string[]): any {
    // Parse butler status output - this would need to be implemented
    // based on actual butler status output format
    return {
      logs,
      parsed: "Status parsing not implemented yet",
    };
  }
}
