import { EventEmitter } from 'events';
import type {
  KenjiConfig,
  GlobalEngineConfig,
  ProjectTemplate,
  ValidationResult,
  ConfigChangeEvent
} from './config';
import {
  defaultGlobalConfig,
  validateConfig,
  validateGlobalConfig,
  validateTemplate,
  mergeWithDefaults,
  mergeGlobalConfigWithDefaults,
  validateConfigDetailed,
  migrateConfig,
  getConfigValue,
  setConfigValue
} from './config';
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'fs';
import { homedir, platform } from 'os';
import { join } from 'path';

export class ConfigurationManager extends EventEmitter {
  private globalConfig: GlobalEngineConfig;
  private globalConfigPath: string;
  private watchers: Map<string, () => void> = new Map();

  constructor() {
    super();
    this.globalConfigPath = this.findBestConfigPath();
    this.ensureConfigDirectoryExists();
    this.globalConfig = this.initializeGlobalConfigSync();
  }

  // Ensure config directory exists with proper permissions
  private ensureConfigDirectoryExists(): void {
    try {
      const configDir = join(this.globalConfigPath, '..');
      if (!existsSync(configDir)) {
        mkdirSync(configDir, { recursive: true, mode: 0o755 });
        console.log(`Created config directory: ${configDir}`);
      }
    } catch (error) {
      console.warn(`Could not create config directory: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Find the best config path with fallback locations
  private findBestConfigPath(): string {
    const configPaths = this.getConfigPaths();

    for (const configPath of configPaths) {
      // Try to create directory and test write access
      try {
        const configDir = join(configPath, '..');
        if (!existsSync(configDir)) {
          mkdirSync(configDir, { recursive: true, mode: 0o755 });
        }

        // Test write access by creating a temporary file
        const testFile = join(configDir, '.kenji-test');
        writeFileSync(testFile, 'test', { mode: 0o644 });

        // Clean up test file
        try {
          const { unlinkSync } = require('fs');
          unlinkSync(testFile);
        } catch {
          // Ignore cleanup errors
        }

        return join(configDir, 'config.json');
      } catch (error) {
        console.debug(`Config path ${configPath} not accessible:`, error instanceof Error ? error.message : String(error));
        continue;
      }
    }

    // If all paths fail, use the first one (will handle errors gracefully)
    return configPaths[0] || join(homedir(), '.kenji-engine', 'config.json');
  }

  // Get prioritized list of config paths
  private getConfigPaths(): string[] {
    const paths: string[] = [];
    const home = homedir();

    // Primary: User config directory
    paths.push(join(home, '.kenji-engine', 'config.json'));

    // Fallback 1: XDG config directory (Linux/Unix)
    if (platform() === 'linux' || platform() === 'darwin') {
      const xdgConfig = process.env.XDG_CONFIG_HOME || join(home, '.config');
      paths.push(join(xdgConfig, 'kenji-engine', 'config.json'));
    }

    // Fallback 2: AppData (Windows)
    if (platform() === 'win32') {
      const appData = process.env.APPDATA ?? join(home, 'AppData', 'Roaming');
      paths.push(join(appData, 'kenji-engine', 'config.json'));
    }

    // Fallback 3: Current working directory
    paths.push(join(process.cwd(), '.kenji-engine', 'config.json'));

    // Fallback 4: Temp directory (last resort)
    const tempDir = require('os').tmpdir();
    paths.push(join(tempDir, 'kenji-engine-config.json'));

    return paths;
  }

  private initializeGlobalConfigSync(): GlobalEngineConfig {
    try {
      if (existsSync(this.globalConfigPath)) {
        const configText = readFileSync(this.globalConfigPath, 'utf8');
        const config = JSON.parse(configText);

        if (validateGlobalConfig(config)) {
          return mergeGlobalConfigWithDefaults(config);
        } else {
          console.warn('Invalid global config, using defaults');
          return defaultGlobalConfig;
        }
      } else {
        return defaultGlobalConfig;
      }
    } catch (error) {
      console.warn('Failed to load global config:', error);
      return defaultGlobalConfig;
    }
  }

  async saveGlobalConfig(): Promise<void> {
    const saveErrors: string[] = [];

    // Try each config path until one works
    const configPaths = this.getConfigPaths();

    for (const configPath of configPaths) {
      try {
        const configDir = join(configPath, '..');

        // Ensure directory exists with proper permissions
        try {
          mkdirSync(configDir, { recursive: true, mode: 0o755 });
        } catch (error) {
          saveErrors.push(`Failed to create directory ${configDir}: ${error instanceof Error ? error.message : String(error)}`);
          continue;
        }

        // Try to save using Bun first (faster)
        try {
          await Bun.write(configPath, JSON.stringify(this.globalConfig, null, 2));
          this.globalConfigPath = configPath; // Update to successful path
          this.emit('global-config-saved', this.globalConfig);
          return;
        } catch (bunError) {
          // Fall back to Node.js fs
          try {
            writeFileSync(configPath, JSON.stringify(this.globalConfig, null, 2), { mode: 0o644 });
            this.globalConfigPath = configPath;
            this.emit('global-config-saved', this.globalConfig);
            return;
          } catch (fsError) {
            saveErrors.push(`Failed to write to ${configPath}: ${fsError instanceof Error ? fsError.message : String(fsError)}`);
            continue;
          }
        }
      } catch (error) {
        saveErrors.push(`Failed to save to ${configPath}: ${error instanceof Error ? error.message : String(error)}`);
        continue;
      }
    }

    // If all paths failed, throw an error with details
    throw new Error(`Failed to save global config to any location. Errors: ${saveErrors.join('; ')}`);
  }

  getGlobalConfig(): GlobalEngineConfig {
    return { ...this.globalConfig };
  }

  getGlobalConfigPath(): string {
    return this.globalConfigPath;
  }

  updateGlobalConfig(updates: Partial<GlobalEngineConfig>): void {
    const oldConfig = { ...this.globalConfig };
    this.globalConfig = mergeGlobalConfigWithDefaults({
      ...this.globalConfig,
      ...updates
    });

    this.emitConfigChange('global', oldConfig, this.globalConfig);
  }

  // Project Configuration Management
  async loadProjectConfig(projectPath: string): Promise<KenjiConfig> {
    const configPath = join(projectPath, 'kenji.config.json');

    if (!existsSync(configPath)) {
      throw new Error('No kenji.config.json found in project directory');
    }

    try {
      const configFile = Bun.file(configPath);
      const configText = await configFile.text();
      const config = JSON.parse(configText);

      if (!validateConfig(config)) {
        throw new Error('Invalid project configuration');
      }

      // Check for version migration
      const currentVersion = config.engine?.version || '0.0.0';
      const targetVersion = this.globalConfig.version;

      if (currentVersion !== targetVersion) {
        const migratedConfig = migrateConfig(config, currentVersion, targetVersion);
        await this.saveProjectConfig(projectPath, migratedConfig);
        return migratedConfig;
      }

      return mergeWithDefaults(config);
    } catch (error) {
      throw new Error(`Failed to load project config: ${error}`);
    }
  }

  async saveProjectConfig(projectPath: string, config: KenjiConfig): Promise<void> {
    const configPath = join(projectPath, 'kenji.config.json');

    try {
      await Bun.write(configPath, JSON.stringify(config, null, 2));
      this.emit('project-config-saved', { projectPath, config });
    } catch (error) {
      throw new Error(`Failed to save project config: ${error}`);
    }
  }

  // Template Management
  getAvailableTemplates(): Record<string, ProjectTemplate> {
    return { ...this.globalConfig.templates };
  }

  getTemplate(templateName: string): ProjectTemplate | null {
    return this.globalConfig.templates[templateName] || null;
  }

  addTemplate(template: ProjectTemplate): void {
    if (!validateTemplate(template)) {
      throw new Error('Invalid template configuration');
    }

    this.updateGlobalConfig({
      templates: {
        ...this.globalConfig.templates,
        [template.name.toLowerCase().replace(/\s+/g, '-')]: template
      }
    });
  }

  removeTemplate(templateName: string): void {
    const templates = { ...this.globalConfig.templates };
    delete templates[templateName];

    this.updateGlobalConfig({ templates });
  }

  // Configuration Validation
  validateProjectConfig(config: any): ValidationResult {
    return validateConfigDetailed(config);
  }

  validateGlobalConfig(config: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!config || typeof config !== 'object') {
      errors.push('Global configuration must be an object');
      return { isValid: false, errors, warnings };
    }

    // Add specific global config validations here
    if (config.ui?.theme && !['dark', 'light', 'auto'].includes(config.ui.theme)) {
      errors.push('UI theme must be one of: dark, light, auto');
    }

    if (config.editor?.autoSaveInterval && (config.editor.autoSaveInterval < 5 || config.editor.autoSaveInterval > 300)) {
      errors.push('Auto-save interval must be between 5 and 300 seconds');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Configuration Cascading
  getCascadedConfig(projectConfig: KenjiConfig): KenjiConfig {
    // Apply global defaults to project config
    const cascaded = { ...projectConfig };

    // Apply global build defaults
    if (!cascaded.export.platform) {
      cascaded.export.platform = this.globalConfig.build.defaultPlatform;
    }

    if (!cascaded.export.outputDir) {
      cascaded.export.outputDir = this.globalConfig.build.defaultOutputDir;
    }

    if (cascaded.export.bundled === undefined) {
      cascaded.export.bundled = this.globalConfig.export.defaultBundled;
    }

    return cascaded;
  }

  // Real-time Configuration Updates
  watchProjectConfig(projectPath: string, callback: (config: KenjiConfig) => void): void {
    const configPath = join(projectPath, 'kenji.config.json');

    if (this.watchers.has(configPath)) {
      this.unwatchProjectConfig(projectPath);
    }

    const watcher = async () => {
      try {
        const config = await this.loadProjectConfig(projectPath);
        callback(config);
      } catch (error) {
        console.error('Error watching project config:', error);
      }
    };

    // Simple polling-based watcher (in production, use fs.watch or similar)
    const interval = setInterval(watcher, 1000);
    this.watchers.set(configPath, () => clearInterval(interval));
  }

  unwatchProjectConfig(projectPath: string): void {
    const configPath = join(projectPath, 'kenji.config.json');
    const cleanup = this.watchers.get(configPath);

    if (cleanup) {
      cleanup();
      this.watchers.delete(configPath);
    }
  }

  // Configuration Export/Import
  async exportConfiguration(type: 'global' | 'project', projectPath?: string): Promise<string> {
    let config: any;

    if (type === 'global') {
      config = this.globalConfig;
    } else if (projectPath) {
      config = await this.loadProjectConfig(projectPath);
    } else {
      throw new Error('Project path required for project config export');
    }

    return JSON.stringify(config, null, 2);
  }

  async importConfiguration(type: 'global' | 'project', configJson: string, projectPath?: string): Promise<void> {
    try {
      const config = JSON.parse(configJson);

      if (type === 'global') {
        const validation = this.validateGlobalConfig(config);
        if (!validation.isValid) {
          throw new Error(`Invalid global config: ${validation.errors.join(', ')}`);
        }

        this.globalConfig = mergeGlobalConfigWithDefaults(config);
        await this.saveGlobalConfig();
      } else if (projectPath) {
        const validation = this.validateProjectConfig(config);
        if (!validation.isValid) {
          throw new Error(`Invalid project config: ${validation.errors.join(', ')}`);
        }

        const mergedConfig = mergeWithDefaults(config);
        await this.saveProjectConfig(projectPath, mergedConfig);
      } else {
        throw new Error('Project path required for project config import');
      }
    } catch (error) {
      throw new Error(`Failed to import configuration: ${error}`);
    }
  }

  // Utility Methods
  getConfigValue<T>(config: KenjiConfig | GlobalEngineConfig, path: string, defaultValue?: T): T | undefined {
    const keys = path.split('.');
    let value: any = config;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }

    return value;
  }

  setGlobalConfigValue(path: string, value: any): void {
    const config = this.globalConfig;
    const updatedConfig = this.setConfigValue(config, path, value) as GlobalEngineConfig;
    this.globalConfig = updatedConfig;
  }

  setConfigValue(config: KenjiConfig | GlobalEngineConfig, path: string, value: any): KenjiConfig | GlobalEngineConfig {
    const keys = path.split('.');
    const newConfig = JSON.parse(JSON.stringify(config)); // Deep clone
    let current: any = newConfig;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!key) continue;
      if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
        current[key] = {};
      }
      current = current[key];
    }

    const lastKey = keys[keys.length - 1];
    if (lastKey) {
      current[lastKey] = value;
    }
    return newConfig;
  }

  private emitConfigChange(type: 'global' | 'project', oldConfig: any, newConfig: any): void {
    const changes: ConfigChangeEvent[] = [];

    // Simple change detection - in production, use a proper diff library
    const findChanges = (obj1: any, obj2: any, currentPath = '') => {
      for (const key in obj2) {
        const path = currentPath ? `${currentPath}.${key}` : key;

        if (!(key in obj1)) {
          changes.push({
            type,
            path,
            oldValue: undefined,
            newValue: obj2[key],
            timestamp: Date.now()
          });
        } else if (typeof obj2[key] === 'object' && obj2[key] !== null) {
          findChanges(obj1[key], obj2[key], path);
        } else if (obj1[key] !== obj2[key]) {
          changes.push({
            type,
            path,
            oldValue: obj1[key],
            newValue: obj2[key],
            timestamp: Date.now()
          });
        }
      }
    };

    findChanges(oldConfig, newConfig);

    changes.forEach(change => {
      this.emit('config-changed', change);
    });
  }

  // Config troubleshooting and diagnostics
  getConfigDiagnostics(): {
    configPath: string;
    configExists: boolean;
    configReadable: boolean;
    configWritable: boolean;
    usingDefaultConfig: boolean;
    permissions: {
      directory: string;
      directoryExists: boolean;
      directoryWritable: boolean;
      filePermissions?: string;
    };
    alternativePaths: string[];
  } {
    const configDir = join(this.globalConfigPath, '..');
    const alternativePaths = this.getConfigPaths();

    let configReadable = false;
    let configWritable = false;
    let filePermissions: string | undefined;

    if (existsSync(this.globalConfigPath)) {
      try {
        readFileSync(this.globalConfigPath, 'utf8');
        configReadable = true;
      } catch {
        configReadable = false;
      }

      try {
        // Test write access
        const testContent = readFileSync(this.globalConfigPath, 'utf8');
        writeFileSync(this.globalConfigPath, testContent, { flag: 'w' });
        configWritable = true;
      } catch {
        configWritable = false;
      }

      try {
        // Get file permissions
        const { statSync } = require('fs');
        const stats = statSync(this.globalConfigPath);
        filePermissions = (stats.mode & parseInt('777', 8)).toString(8);
      } catch {
        // Ignore permission check errors
      }
    }

    const { defaultGlobalConfig } = require('./config');
    // Check if config file exists and was successfully loaded
    const configFileExists = existsSync(this.globalConfigPath);
    const configMatchesDefaults = JSON.stringify(this.globalConfig) === JSON.stringify(defaultGlobalConfig);
    const usingDefaultConfig = !configFileExists || configMatchesDefaults;

    return {
      configPath: this.globalConfigPath,
      configExists: existsSync(this.globalConfigPath),
      configReadable,
      configWritable,
      usingDefaultConfig,
      permissions: {
        directory: configDir,
        directoryExists: existsSync(configDir),
        directoryWritable: this.isDirectoryWritable(configDir),
        filePermissions
      },
      alternativePaths
    };
  }

  private isDirectoryWritable(dirPath: string): boolean {
    try {
      const testFile = join(dirPath, '.kenji-write-test');
      writeFileSync(testFile, 'test');
      const { unlinkSync } = require('fs');
      unlinkSync(testFile);
      return true;
    } catch {
      return false;
    }
  }

  // Attempt to fix common config issues
  async repairConfig(): Promise<{
    success: boolean;
    message: string;
    actions: string[];
  }> {
    const diagnostics = this.getConfigDiagnostics();
    const actions: string[] = [];

    try {
      // Ensure config directory exists
      if (!diagnostics.permissions.directoryExists) {
        mkdirSync(diagnostics.permissions.directory, { recursive: true, mode: 0o755 });
        actions.push(`Created config directory: ${diagnostics.permissions.directory}`);
      }

      // Try to create a basic config file if it doesn't exist
      if (!diagnostics.configExists) {
        writeFileSync(this.globalConfigPath, JSON.stringify(this.globalConfig, null, 2), { mode: 0o644 });
        actions.push(`Created config file: ${this.globalConfigPath}`);
      }

      // Test if we can now read and write
      const newDiagnostics = this.getConfigDiagnostics();

      if (newDiagnostics.configReadable && newDiagnostics.configWritable) {
        return {
          success: true,
          message: 'Config repair successful',
          actions
        };
      } else {
        return {
          success: false,
          message: 'Config repair failed - still having permission issues',
          actions
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Config repair failed: ${error instanceof Error ? error.message : String(error)}`,
        actions
      };
    }
  }

  // Cleanup
  dispose(): void {
    this.watchers.forEach(cleanup => cleanup());
    this.watchers.clear();
    this.removeAllListeners();
  }
}

// Singleton instance
export const configManager = new ConfigurationManager();