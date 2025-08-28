// Project-specific configuration
export interface KenjiConfig {
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

// Global engine configuration
export interface GlobalEngineConfig {
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
    autoSaveInterval: number; // seconds
    showLineNumbers: boolean;
    tabSize: number;
    insertSpaces: boolean;
    // New editor preference fields
    preferredEditor: 'native' | 'external';
    externalEditorCommand: string;
    nativeEditor: {
      fontSize: number;
      lineHeight: number;
      showMinimap: boolean;
      wordWrap: boolean;
      highlightCurrentLine: boolean;
      bracketMatching: boolean;
    };
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
    compressionLevel: number; // 0-9
    includeSourceMaps: boolean;
    generateManifest: boolean;
  };
  templates: {
    [templateName: string]: ProjectTemplate;
  };
  shortcuts: {
    [action: string]: string; // key combination
  };
}

// Project template configuration
export interface ProjectTemplate {
  name: string;
  description: string;
  category: 'game' | 'tool' | 'demo' | 'custom';
  config: Partial<KenjiConfig>;
  files: TemplateFile[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export interface TemplateFile {
  path: string;
  content: string;
  executable?: boolean;
}

// Configuration validation result
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Configuration change event
export interface ConfigChangeEvent {
  type: 'global' | 'project';
  path: string;
  oldValue: any;
  newValue: any;
  timestamp: number;
}

export const defaultConfig: KenjiConfig = {
  name: 'My Game',
  version: '1.0.0',
  description: 'A game built with Kenji Engine',
  author: 'Unknown',
  engine: {
    version: '1.0.0',
    width: 80,
    height: 24,
    fps: 60
  },
  entry: 'src/main.ts',
  assets: [],
  export: {
    platform: 'itch.io',
    bundled: true,
    outputDir: 'dist'
  },
  scripts: {
    start: 'bun run src/main.ts',
    build: 'bun build src/main.ts --outdir dist',
    test: 'bun test'
  }
};

// Default global engine configuration
export const defaultGlobalConfig: GlobalEngineConfig = {
  version: '1.0.0',
  ui: {
    theme: 'dark',
    colors: {
      primary: '#FF8800',
      secondary: '#666666',
      accent: '#00FF88',
      background: '#000000',
      foreground: '#FFFFFF'
    },
    showDebugOverlay: false,
    enableConsole: true
  },
  editor: {
    defaultTemplate: 'basic-game',
    autoSave: true,
    autoSaveInterval: 30,
    showLineNumbers: true,
    tabSize: 2,
    insertSpaces: true,
    // New editor preference defaults
    preferredEditor: 'native',
    externalEditorCommand: 'code',
    nativeEditor: {
      fontSize: 12,
      lineHeight: 1.2,
      showMinimap: false,
      wordWrap: true,
      highlightCurrentLine: true,
      bracketMatching: true
    }
  },
  build: {
    defaultPlatform: 'itch.io',
    defaultOutputDir: 'dist',
    optimizationLevel: 'basic',
    sourceMap: true,
    minify: false
  },
  export: {
    defaultBundled: true,
    compressionLevel: 6,
    includeSourceMaps: false,
    generateManifest: true
  },
  templates: {
    'basic-game': {
      name: 'Basic Game',
      description: 'A simple game template with basic structure',
      category: 'game',
      config: {
        engine: {
          version: '1.0.0',
          width: 80,
          height: 24,
          fps: 60
        }
      },
      files: [
        {
          path: 'src/main.ts',
          content: `#!/usr/bin/env bun

// Basic Game Template
console.clear();
console.log('🎮 Game Starting...');

let running = true;
let frame = 0;

const gameLoop = () => {
  if (!running) return;

  console.clear();
  console.log(\`Frame: \${frame}\`);
  frame++;

  setTimeout(gameLoop, 1000/60);
};

process.on('SIGINT', () => {
  running = false;
  console.log('Game stopped');
  process.exit(0);
});

gameLoop();
`,
          executable: true
        }
      ]
    },
    'pong-game': {
      name: 'Pong Game',
      description: 'Classic Pong game template',
      category: 'game',
      config: {
        engine: {
          version: '1.0.0',
          width: 80,
          height: 24,
          fps: 60
        }
      },
      files: [
        {
          path: 'src/main.ts',
          content: `#!/usr/bin/env bun

// Pong Game Template
console.clear();
console.log('🏓 Pong Game Starting...');

// Game state
let ball = { x: 40, y: 12, dx: 1, dy: 1 };
let paddle1 = { y: 10 };
let paddle2 = { y: 10 };
let score1 = 0;
let score2 = 0;
let running = true;

const gameLoop = () => {
  if (!running) return;

  // Update ball position
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Ball collision with walls
  if (ball.y <= 1 || ball.y >= 22) ball.dy *= -1;

  // Ball collision with paddles
  if (ball.x === 5 && ball.y >= paddle1.y && ball.y <= paddle1.y + 4) {
    ball.dx *= -1;
  }
  if (ball.x === 75 && ball.y >= paddle2.y && ball.y <= paddle2.y + 4) {
    ball.dx *= -1;
  }

  // Scoring
  if (ball.x < 0) {
    score2++;
    ball = { x: 40, y: 12, dx: 1, dy: 1 };
  }
  if (ball.x > 80) {
    score1++;
    ball = { x: 40, y: 12, dx: -1, dy: 1 };
  }

  // Draw game
  console.clear();
  console.log('╔' + '═'.repeat(78) + '╗');

  for (let y = 0; y < 22; y++) {
    let line = '║';

    for (let x = 0; x < 78; x++) {
      if (x === Math.floor(ball.x) && y === Math.floor(ball.y)) {
        line += '●';
      } else if (x === 3 && y >= paddle1.y && y <= paddle1.y + 4) {
        line += '█';
      } else if (x === 75 && y >= paddle2.y && y <= paddle2.y + 4) {
        line += '█';
      } else if (x === 39) {
        line += '│';
      } else {
        line += ' ';
      }
    }

    line += '║';
    console.log(line);
  }

  console.log('╚' + '═'.repeat(78) + '╝');
  console.log(\`Player 1: \${score1} | Player 2: \${score2}\`);

  setTimeout(gameLoop, 1000/60);
};

process.on('SIGINT', () => {
  running = false;
  console.log('Game stopped');
  process.exit(0);
});

gameLoop();
`,
          executable: true
        }
      ]
    }
  },
  shortcuts: {
    'new-project': 'ctrl+n',
    'open-project': 'ctrl+o',
    'save-project': 'ctrl+s',
    'build-project': 'ctrl+b',
    'export-project': 'ctrl+e',
    'toggle-console': '`',
    'toggle-debug': 't'
  }
};

export function validateConfig(config: any): config is KenjiConfig {
  return (
    typeof config === 'object' &&
    typeof config.name === 'string' &&
    typeof config.version === 'string' &&
    typeof config.engine === 'object' &&
    typeof config.engine.version === 'string' &&
    typeof config.engine.width === 'number' &&
    typeof config.engine.height === 'number' &&
    typeof config.engine.fps === 'number' &&
    typeof config.entry === 'string' &&
    Array.isArray(config.assets) &&
    typeof config.export === 'object' &&
    typeof config.export.platform === 'string' &&
    typeof config.export.bundled === 'boolean' &&
    typeof config.export.outputDir === 'string'
  );
}

export function validateGlobalConfig(config: any): config is GlobalEngineConfig {
  return (
    typeof config === 'object' &&
    typeof config.version === 'string' &&
    typeof config.ui === 'object' &&
    typeof config.editor === 'object' &&
    typeof config.build === 'object' &&
    typeof config.export === 'object' &&
    typeof config.templates === 'object' &&
    typeof config.shortcuts === 'object'
  );
}

export function validateTemplate(template: any): template is ProjectTemplate {
  return (
    typeof template === 'object' &&
    typeof template.name === 'string' &&
    typeof template.description === 'string' &&
    typeof template.category === 'string' &&
    ['game', 'tool', 'demo', 'custom'].includes(template.category) &&
    typeof template.config === 'object' &&
    Array.isArray(template.files)
  );
}

export function mergeWithDefaults(config: Partial<KenjiConfig>): KenjiConfig {
  return {
    ...defaultConfig,
    ...config,
    engine: {
      ...defaultConfig.engine,
      ...config.engine
    },
    export: {
      ...defaultConfig.export,
      ...config.export
    }
  };
}

export function mergeGlobalConfigWithDefaults(config: Partial<GlobalEngineConfig>): GlobalEngineConfig {
  return {
    ...defaultGlobalConfig,
    ...config,
    ui: {
      ...defaultGlobalConfig.ui,
      ...config.ui,
      colors: {
        ...defaultGlobalConfig.ui.colors,
        ...config.ui?.colors
      }
    },
    editor: {
      ...defaultGlobalConfig.editor,
      ...config.editor
    },
    build: {
      ...defaultGlobalConfig.build,
      ...config.build
    },
    export: {
      ...defaultGlobalConfig.export,
      ...config.export
    },
    templates: {
      ...defaultGlobalConfig.templates,
      ...config.templates
    },
    shortcuts: {
      ...defaultGlobalConfig.shortcuts,
      ...config.shortcuts
    }
  };
}

export function validateConfigDetailed(config: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!config || typeof config !== 'object') {
    errors.push('Configuration must be an object');
    return { isValid: false, errors, warnings };
  }

  // Required fields validation
  if (!config.name || typeof config.name !== 'string') {
    errors.push('Project name is required and must be a string');
  }

  if (!config.version || typeof config.version !== 'string') {
    errors.push('Project version is required and must be a string');
  }

  // Engine validation
  if (!config.engine || typeof config.engine !== 'object') {
    errors.push('Engine configuration is required');
  } else {
    if (!config.engine.version || typeof config.engine.version !== 'string') {
      errors.push('Engine version is required');
    }
    if (typeof config.engine.width !== 'number' || config.engine.width < 10 || config.engine.width > 200) {
      errors.push('Engine width must be a number between 10 and 200');
    }
    if (typeof config.engine.height !== 'number' || config.engine.height < 5 || config.engine.height > 100) {
      errors.push('Engine height must be a number between 5 and 100');
    }
    if (typeof config.engine.fps !== 'number' || config.engine.fps < 1 || config.engine.fps > 120) {
      errors.push('Engine FPS must be a number between 1 and 120');
    }
  }

  // Entry point validation
  if (!config.entry || typeof config.entry !== 'string') {
    errors.push('Entry point is required and must be a string');
  }

  // Assets validation
  if (!Array.isArray(config.assets)) {
    errors.push('Assets must be an array');
  } else {
    config.assets.forEach((asset: any, index: number) => {
      if (typeof asset !== 'string') {
        errors.push(`Asset at index ${index} must be a string`);
      }
    });
  }

  // Export validation
  if (!config.export || typeof config.export !== 'object') {
    errors.push('Export configuration is required');
  } else {
    if (!['itch.io', 'standalone', 'web'].includes(config.export.platform)) {
      errors.push('Export platform must be one of: itch.io, standalone, web');
    }
    if (typeof config.export.bundled !== 'boolean') {
      errors.push('Export bundled must be a boolean');
    }
    if (!config.export.outputDir || typeof config.export.outputDir !== 'string') {
      errors.push('Export output directory is required');
    }
  }

  // Warnings for optional fields
  if (!config.description) {
    warnings.push('Project description is recommended');
  }

  if (!config.author) {
    warnings.push('Project author is recommended');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function migrateConfig(config: any, fromVersion: string, toVersion: string): KenjiConfig {
  // Handle version migrations
  let migratedConfig = { ...config };

  // Example migration from 0.x to 1.0.0
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

export function getConfigValue<T>(config: KenjiConfig, path: string, defaultValue?: T): T | undefined {
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

export function setConfigValue(config: KenjiConfig, path: string, value: any): KenjiConfig {
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

