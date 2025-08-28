# Configuration Management System

The Kenji Engine features a comprehensive configuration management system that handles both global engine settings and project-specific configurations. This system provides a unified way to manage settings, templates, and preferences across the entire engine.

## Overview

The configuration system is built around three main components:

1. **Global Engine Configuration** - Engine-wide settings stored in `~/.kenji-engine/config.json`
2. **Project Configuration** - Project-specific settings in `kenji.config.json`
3. **Configuration Manager** - Central service for managing all configuration operations

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Project Config │    │  Configuration   │    │  Global Config  │
│  (kenji.json)   │◄───┤    Manager      │───►│  (~/.kenji/)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Templates     │
                       │   System        │
                       └─────────────────┘
```

## Global Engine Configuration

The global configuration contains engine-wide settings that apply to all projects and the TUI environment.

### Location
- **File**: `~/.kenji-engine/config.json`
- **Created**: Automatically on first run
- **Format**: JSON

### Structure

```typescript
interface GlobalEngineConfig {
  version: string;
  ui: {
    theme: 'dark' | 'light' | 'auto';
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      foreground: string;
    };
    showDebugOverlay: boolean;
    enableConsole: boolean;
  };
  editor: {
    defaultTemplate: string;
    autoSave: boolean;
    autoSaveInterval: number;
    showLineNumbers: boolean;
    tabSize: number;
    insertSpaces: boolean;
  };
  build: {
    defaultPlatform: 'itch.io' | 'standalone' | 'web';
    defaultOutputDir: string;
    optimizationLevel: 'none' | 'basic' | 'advanced';
    sourceMap: boolean;
    minify: boolean;
  };
  export: {
    defaultBundled: boolean;
    compressionLevel: number;
    includeSourceMaps: boolean;
    generateManifest: boolean;
  };
  templates: Record<string, ProjectTemplate>;
  shortcuts: Record<string, string>;
}
```

### Default Values

The system provides sensible defaults for all configuration options:

```json
{
  "version": "1.0.0",
  "ui": {
    "theme": "dark",
    "colors": {
      "primary": "#FF8800",
      "secondary": "#666666",
      "accent": "#00FF88",
      "background": "#000000",
      "foreground": "#FFFFFF"
    },
    "showDebugOverlay": false,
    "enableConsole": true
  },
  "editor": {
    "defaultTemplate": "basic-game",
    "autoSave": true,
    "autoSaveInterval": 30,
    "showLineNumbers": true,
    "tabSize": 2,
    "insertSpaces": true
  },
  "build": {
    "defaultPlatform": "itch.io",
    "defaultOutputDir": "dist",
    "optimizationLevel": "basic",
    "sourceMap": true,
    "minify": false
  },
  "export": {
    "defaultBundled": true,
    "compressionLevel": 6,
    "includeSourceMaps": false,
    "generateManifest": true
  }
}
```

## Project Configuration

Each project has its own configuration file that defines project-specific settings.

### Location
- **File**: `kenji.config.json` (in project root)
- **Created**: During project creation
- **Format**: JSON

### Structure

```typescript
interface KenjiConfig {
  name: string;
  version: string;
  description?: string;
  author?: string;
  engine: {
    version: string;
    width: number;
    height: number;
    fps: number;
  };
  entry: string;
  assets: string[];
  export: {
    platform: 'itch.io' | 'standalone' | 'web';
    bundled: boolean;
    outputDir: string;
  };
  scripts?: Record<string, string>;
}
```

### Configuration Cascading

The system implements a cascading configuration approach:

1. **Global Defaults** - Engine-wide defaults
2. **Project Config** - Project-specific overrides
3. **Runtime Overrides** - Instance-specific modifications

```typescript
// Example: Export platform cascading
Global Default: "itch.io"
Project Config: "standalone"  // Overrides global default
Runtime: "web"               // Overrides project config
```

## Project Templates

Templates provide starting points for new projects with pre-configured settings and files.

### Built-in Templates

#### Basic Game Template
- **Name**: `basic-game`
- **Category**: Game
- **Description**: Simple game template with basic structure
- **Files**: `src/main.ts` with basic game loop

#### Pong Game Template
- **Name**: `pong-game`
- **Category**: Game
- **Description**: Classic Pong game implementation
- **Files**: Complete Pong game with ball, paddles, and scoring

### Template Structure

```typescript
interface ProjectTemplate {
  name: string;
  description: string;
  category: 'game' | 'tool' | 'demo' | 'custom';
  config: Partial<KenjiConfig>;
  files: TemplateFile[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

interface TemplateFile {
  path: string;
  content: string;
  executable?: boolean;
}
```

### Creating Custom Templates

```typescript
// Example custom template
const customTemplate: ProjectTemplate = {
  name: "My Custom Game",
  description: "A template for my custom game type",
  category: "game",
  config: {
    engine: {
      version: "1.0.0",
      width: 100,
      height: 30,
      fps: 30
    },
    export: {
      platform: "web",
      bundled: true,
      outputDir: "build"
    }
  },
  files: [
    {
      path: "src/main.ts",
      content: `// Custom game code here`,
      executable: true
    },
    {
      path: "README.md",
      content: `# My Custom Game\n\nGame description...`
    }
  ]
};

// Add to configuration manager
configManager.addTemplate(customTemplate);
```

## Configuration Manager API

The `ConfigurationManager` class provides the main interface for configuration operations.

### Loading and Saving

```typescript
// Load global configuration
const globalConfig = configManager.getGlobalConfig();

// Load project configuration
const projectConfig = await configManager.loadProjectConfig('/path/to/project');

// Save configurations
await configManager.saveGlobalConfig();
await configManager.saveProjectConfig('/path/to/project', projectConfig);
```

### Configuration Updates

```typescript
// Update global configuration
configManager.updateGlobalConfig({
  ui: {
    theme: 'light'
  }
});

// Update project configuration
const updatedConfig = configManager.setConfigValue(projectConfig, 'engine.fps', 60);
```

### Template Management

```typescript
// Get available templates
const templates = configManager.getAvailableTemplates();

// Get specific template
const template = configManager.getTemplate('basic-game');

// Add custom template
configManager.addTemplate(customTemplate);

// Remove template
configManager.removeTemplate('template-name');
```

### Configuration Validation

```typescript
// Validate project configuration
const projectValidation = configManager.validateProjectConfig(config);
if (!projectValidation.isValid) {
  console.error('Invalid project config:', projectValidation.errors);
}

// Validate global configuration
const globalValidation = configManager.validateGlobalConfig(config);
```

### Configuration Export/Import

```typescript
// Export configuration
const configJson = await configManager.exportConfiguration('global');

// Import configuration
await configManager.importConfiguration('global', configJson);
```

## Real-time Configuration Updates

The system supports real-time configuration watching for dynamic updates:

```typescript
// Watch project configuration changes
configManager.watchProjectConfig('/path/to/project', (config) => {
  console.log('Project config updated:', config);
  // Update application state
});

// Stop watching
configManager.unwatchProjectConfig('/path/to/project');
```

## TUI Integration

The configuration system integrates with the Terminal User Interface through the Settings view.

### Accessing Settings
1. Launch Kenji Engine TUI
2. Navigate to "Settings" from the main menu
3. Use arrow keys to navigate between sections
4. Press 'S' to save changes
5. Press 'ESC' to return to main menu

### Settings Sections
- **General**: UI theme, debug overlay, console settings
- **Editor**: Default template, auto-save, editor preferences
- **Build**: Default platform, optimization, output settings
- **Export**: Bundle settings, compression, manifest generation
- **Templates**: View available project templates

## Migration and Versioning

The system handles configuration migration automatically:

```typescript
// Automatic migration on config load
const config = await configManager.loadProjectConfig('/path/to/project');
// If config.version < currentVersion, migration is applied automatically
```

### Migration Example
```typescript
// From version 0.x to 1.0.0
function migrateConfig(config: any, fromVersion: string, toVersion: string): KenjiConfig {
  let migratedConfig = { ...config };

  if (fromVersion.startsWith('0.') && toVersion.startsWith('1.')) {
    // Add version field to engine if missing
    if (!migratedConfig.engine.version) {
      migratedConfig.engine.version = '1.0.0';
    }

    // Migrate old export format
    if (migratedConfig.export && !migratedConfig.export.outputDir) {
      migratedConfig.export.outputDir = 'dist';
    }
  }

  return mergeWithDefaults(migratedConfig);
}
```

## Best Practices

### 1. Configuration Organization
- Use meaningful configuration paths
- Group related settings together
- Document configuration options

### 2. Template Design
- Keep templates focused on specific use cases
- Include comprehensive README files
- Test templates before distribution

### 3. Validation
- Always validate configuration before use
- Provide clear error messages
- Handle migration gracefully

### 4. Performance
- Cache configuration values when possible
- Use watchers sparingly
- Batch configuration updates

## Troubleshooting

### Common Issues

#### Configuration File Not Found
```bash
# Check if global config exists
ls -la ~/.kenji-engine/config.json

# Recreate global config
rm -rf ~/.kenji-engine
# Restart Kenji Engine to recreate
```

#### Invalid Configuration
```typescript
// Check validation errors
const validation = configManager.validateProjectConfig(config);
console.log('Errors:', validation.errors);
console.log('Warnings:', validation.warnings);
```

#### Template Not Loading
```typescript
// Verify template exists
const templates = configManager.getAvailableTemplates();
console.log('Available templates:', Object.keys(templates));

// Check template structure
const template = configManager.getTemplate('template-name');
console.log('Template structure:', template);
```

### Debug Mode
Enable debug mode to see configuration loading details:

```typescript
// In TUI, press 't' to toggle debug overlay
// Configuration events will be logged to console
```

## API Reference

### ConfigurationManager Methods

#### Global Configuration
- `getGlobalConfig(): GlobalEngineConfig`
- `updateGlobalConfig(updates: Partial<GlobalEngineConfig>): void`
- `saveGlobalConfig(): Promise<void>`

#### Project Configuration
- `loadProjectConfig(path: string): Promise<KenjiConfig>`
- `saveProjectConfig(path: string, config: KenjiConfig): Promise<void>`
- `getCascadedConfig(projectConfig: KenjiConfig): KenjiConfig`

#### Templates
- `getAvailableTemplates(): Record<string, ProjectTemplate>`
- `getTemplate(name: string): ProjectTemplate | null`
- `addTemplate(template: ProjectTemplate): void`
- `removeTemplate(name: string): void`

#### Validation
- `validateProjectConfig(config: any): ValidationResult`
- `validateGlobalConfig(config: any): ValidationResult`

#### Utilities
- `getConfigValue<T>(config, path, defaultValue?): T | undefined`
- `setConfigValue(config, path, value): Config`
- `exportConfiguration(type, configJson): Promise<string>`
- `importConfiguration(type, configJson, projectPath?): Promise<void>`

#### Real-time Updates
- `watchProjectConfig(path, callback): void`
- `unwatchProjectConfig(path): void`

This configuration system provides a robust foundation for managing all aspects of the Kenji Engine, ensuring consistency, flexibility, and ease of use across different projects and use cases.</content>
</xai:function_call/>
<xai:function_call name="bash">
<parameter name="command">cd /Users/warrengates/Documents/code/meep/kenji-engine && bun run build