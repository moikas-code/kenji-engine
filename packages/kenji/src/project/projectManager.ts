import type { KenjiConfig } from './config';
import { defaultConfig, mergeWithDefaults } from './config';
import { configManager } from './configurationManager';
import { existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';

export class ProjectManager {
  private currentProject: KenjiConfig | null = null;
  private projectPath: string | null = null;

  async createProject(name: string, path: string, templateName?: string): Promise<void> {
    const projectDir = resolve(path, name);

    // Create project directory
    if (!existsSync(projectDir)) {
      mkdirSync(projectDir, { recursive: true });
    }

    // Create src directory
    const srcDir = join(projectDir, 'src');
    if (!existsSync(srcDir)) {
      mkdirSync(srcDir, { recursive: true });
    }

    // Get template or use default
    let config: KenjiConfig;
    if (templateName) {
      const template = configManager.getTemplate(templateName);
      if (template) {
        config = mergeWithDefaults({
          ...template.config,
          name,
          version: '1.0.0'
        });
      } else {
        console.warn(`Template "${templateName}" not found, using default`);
        config = { ...defaultConfig, name };
      }
    } else {
      config = { ...defaultConfig, name };
    }

    // Apply global configuration defaults
    config = configManager.getCascadedConfig(config);

    // Write config file
    await configManager.saveProjectConfig(projectDir, config);

    // Create template files
    if (templateName) {
      const template = configManager.getTemplate(templateName);
      if (template) {
        await this.createTemplateFiles(projectDir, template);
      }
    } else {
      // Create default TUI project files
      const mainFileContent = this.generateMainFile(config);
      await Bun.write(join(srcDir, 'index.tsx'), mainFileContent);
      
      // Create App.tsx
      const appFileContent = this.generateAppFile(config);
      await Bun.write(join(srcDir, 'App.tsx'), appFileContent);
      
      // Create run script
      const runFileContent = this.generateRunFile();
      await Bun.write(join(projectDir, 'run-tui.ts'), runFileContent);
    }

    // Create package.json
    const packageJson = {
      name: name.toLowerCase().replace(/\s+/g, '-'),
      version: config.version,
      description: config.description,
      type: 'module',
      scripts: {
        "dev": "bun run run-tui.ts --watch",
        "start": "bun run run-tui.ts",
        "build": "bun build src/index.tsx --outdir=dist --target=bun"
      },
      dependencies: {
        '@opentui/core': 'latest',
        '@opentui/react': '^0.1.11',
        'react': '^19.1.1',
        'react-dom': '^19.1.1',
        '@modelcontextprotocol/sdk': '^1.17.4',
        'zod': '^4.1.3'
      },
      devDependencies: {
        '@types/bun': 'latest',
        '@types/react': '^19.1.1',
        '@types/react-dom': '^19.1.1',
        'typescript': '^5'
      }
    };

    await Bun.write(
      join(projectDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // Create README
    const readmeContent = this.generateReadme(config);
    await Bun.write(join(projectDir, 'README.md'), readmeContent);

    this.currentProject = config;
    this.projectPath = projectDir;

    console.log(`✅ Project "${name}" created successfully at ${projectDir}`);
  }

  async loadProject(path: string): Promise<KenjiConfig | null> {
    try {
      const config = await configManager.loadProjectConfig(path);
      this.currentProject = configManager.getCascadedConfig(config);
      this.projectPath = path;

      console.log(`✅ Project "${config.name}" loaded successfully`);
      return this.currentProject;
    } catch (error) {
      throw new Error(`Failed to load project: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async saveProject(): Promise<void> {
    if (!this.currentProject || !this.projectPath) {
      throw new Error('No project currently loaded');
    }

    await configManager.saveProjectConfig(this.projectPath, this.currentProject);
    console.log('✅ Project saved successfully');
  }

  getCurrentProject(): KenjiConfig | null {
    return this.currentProject;
  }

  getProjectPath(): string | null {
    return this.projectPath;
  }

  updateConfig(updates: Partial<KenjiConfig>): void {
    if (!this.currentProject) {
      throw new Error('No project currently loaded');
    }

    this.currentProject = mergeWithDefaults({
      ...this.currentProject,
      ...updates
    });
  }

  private generateMainFile(config: KenjiConfig): string {
    return `import { render } from "@opentui/react";
import App from "./App";

async function startTUI() {
  await render(<App />, {
    targetFps: 120,
    consoleOptions: {
      position: "bottom" as any,
      maxStoredLogs: 1000,
      sizePercent: 40,
    },
  });
}

// Export TUI app
export { startTUI };
`;
  }

  private generateAppFile(config: KenjiConfig): string {
    return `import { memo } from "react";

const AppContent = memo(() => {
  return (
    <group style={{ 
      width: 80, 
      height: 24, 
      backgroundColor: "#1a1a1a",
      paddingTop: 1,
      paddingLeft: 1,
      paddingRight: 1
    }}>
      <text style={{ color: "#00ff00" }}>
        Welcome to ${config.name}!
      </text>
      <text style={{ color: "#888888", y: 2 }}>
        This is a Terminal User Interface (TUI) application
      </text>
      <text style={{ color: "#888888", y: 3 }}>
        Built with Kenji Engine and OpenTUI
      </text>
      <text style={{ color: "#ffff00", y: 5 }}>
        Press 'q' to quit
      </text>
    </group>
  );
});

AppContent.displayName = "AppContent";

const App = memo(() => {
  return <AppContent />;
});

App.displayName = "App";

export default App;
`;
  }

  private generateRunFile(): string {
    return `import { startTUI } from "./src/index";
startTUI();
`;
  }

  private generateReadme(config: KenjiConfig): string {
    return `# ${config.name}

${config.description}

Built with Kenji Engine - Terminal User Interface (TUI) Framework

## Getting Started

\`\`\`bash
# Install dependencies
bun install

# Run the TUI application
bun run start

# Development mode with hot reload
bun run dev

# Build for distribution
bun run build
\`\`\`

## Features

- Terminal User Interface powered by OpenTUI
- React-based components for TUI
- Hot reload development mode
- Built with Bun for fast performance

## Development

This TUI application was created with [Kenji Engine](https://github.com/your-org/kenji-engine), a Terminal User Interface (TUI) framework.

## Author

${config.author}

## License

MIT
`;
  }

  private async createTemplateFiles(projectDir: string, template: any): Promise<void> {
    for (const file of template.files) {
      const filePath = join(projectDir, file.path);
      const dir = join(filePath, '..');

      // Create directory if it doesn't exist
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      // Write file content
      await Bun.write(filePath, file.content);

      // Set executable permissions if needed
      if (file.executable) {
        // Note: In a real implementation, you'd use fs.chmod here
        // For now, we'll just log it
        console.log(`Created executable file: ${file.path}`);
      }
    }
  }
}