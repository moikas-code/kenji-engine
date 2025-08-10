/**
 * Kuuzuki Game Engine - Build Configuration
 *
 * Centralized configuration for all build processes including:
 * - Package build settings
 * - Web bundle optimization
 * - TypeScript compilation
 * - Asset processing
 * - Deployment targets
 */

export interface BuildTarget {
  name: string;
  platform: "node" | "browser" | "universal";
  minify: boolean;
  sourcemap: boolean | "external" | "inline";
  format: "esm" | "cjs" | "iife";
  external?: string[];
  define?: Record<string, string>;
}

export interface PackageBuildConfig {
  name: string;
  entryPoint: string;
  outputDir: string;
  targets: BuildTarget[];
  generateTypes: boolean;
  copyAssets?: string[];
  external?: string[];
}

export const PACKAGE_CONFIGS: PackageBuildConfig[] = [
  {
    name: "@kenji-engine/core",
    entryPoint: "src/index.ts",
    outputDir: "dist",
    generateTypes: true,
    external: ["three"],
    targets: [
      {
        name: "node",
        platform: "node",
        minify: true,
        sourcemap: "external",
        format: "esm",
      },
      {
        name: "browser",
        platform: "browser",
        minify: true,
        sourcemap: "external",
        format: "esm",
        external: ["three"],
      },
    ],
  },
  {
    name: "@kenji-engine/pixel-art-generator",
    entryPoint: "src/index.ts",
    outputDir: "dist",
    generateTypes: true,
    external: ["@kenji-engine/core"],
    targets: [
      {
        name: "universal",
        platform: "universal",
        minify: true,
        sourcemap: "external",
        format: "esm",
      },
    ],
  },
  {
    name: "@kenji-engine/mcp-server",
    entryPoint: "src/server.ts",
    outputDir: "dist",
    generateTypes: true,
    external: ["@modelcontextprotocol/sdk", "zod"],
    targets: [
      {
        name: "node",
        platform: "node",
        minify: true,
        sourcemap: "external",
        format: "esm",
      },
    ],
  },
  {
    name: "@kenji-engine/cli",
    entryPoint: "src/index.ts",
    outputDir: "dist",
    generateTypes: true,
    targets: [
      {
        name: "node",
        platform: "node",
        minify: true,
        sourcemap: "external",
        format: "esm",
        define: {
          "process.env.NODE_ENV": '"production"',
        },
      },
    ],
  },
  {
    name: "@kenji-engine/butler-deploy",
    entryPoint: "src/index.ts",
    outputDir: "dist",
    generateTypes: true,
    targets: [
      {
        name: "node",
        platform: "node",
        minify: true,
        sourcemap: "external",
        format: "esm",
      },
    ],
  },
];

export interface WebBuildConfig {
  entryPoint: string;
  outputDir: string;
  htmlTemplate: string;
  assets: string[];
  optimization: {
    minify: boolean;
    treeshake: boolean;
    splitting: boolean;
    compression: boolean;
  };
  external: string[];
  define: Record<string, string>;
}

export const WEB_BUILD_CONFIG: WebBuildConfig = {
  entryPoint: "example/main.ts",
  outputDir: "dist/web",
  htmlTemplate: "example/index.html",
  assets: ["example/assets/**/*"],
  optimization: {
    minify: true,
    treeshake: true,
    splitting: true,
    compression: true,
  },
  external: ["three"],
  define: {
    "process.env.NODE_ENV": '"production"',
    "process.env.BUILD_TARGET": '"web"',
  },
};

export interface ItchBuildConfig {
  sourceDir: string;
  outputDir: string;
  manifest: {
    name: string;
    author: string;
    description: string;
    version: string;
    main: string;
    window: {
      width: number;
      height: number;
      resizable: boolean;
    };
  };
  excludePatterns: string[];
  deployScript: string;
}

export const ITCH_BUILD_CONFIG: ItchBuildConfig = {
  sourceDir: "dist/web",
  outputDir: "dist/itch",
  manifest: {
    name: "Kuuzuki Game Engine Demo",
    author: "Kuuzuki Team",
    description: "A complete game engine demo featuring Batman's Breakout",
    version: "1.0.0",
    main: "index.html",
    window: {
      width: 800,
      height: 600,
      resizable: true,
    },
  },
  excludePatterns: ["*.map", "*.ts", "node_modules/**"],
  deployScript: "deploy-itch.sh",
};

export interface TypeScriptConfig {
  configFile: string;
  declarationDir: string;
  emitDeclarationOnly: boolean;
  generateSourceMaps: boolean;
}

export const TYPESCRIPT_CONFIG: TypeScriptConfig = {
  configFile: "tsconfig.json",
  declarationDir: "dist",
  emitDeclarationOnly: true,
  generateSourceMaps: true,
};

export interface OptimizationConfig {
  bundleAnalysis: boolean;
  sizeLimit: {
    core: string;
    webBundle: string;
    totalSize: string;
  };
  compressionTargets: string[];
  treeshakeOptions: {
    moduleSideEffects: boolean;
    propertyReadSideEffects: boolean;
  };
}

export const OPTIMIZATION_CONFIG: OptimizationConfig = {
  bundleAnalysis: true,
  sizeLimit: {
    core: "500KB",
    webBundle: "2MB",
    totalSize: "5MB",
  },
  compressionTargets: ["gzip", "brotli"],
  treeshakeOptions: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
  },
};

export interface DeploymentConfig {
  targets: {
    npm: {
      registry: string;
      access: "public" | "restricted";
      tag: string;
    };
    itch: {
      user: string;
      game: string;
      channel: string;
    };
    github: {
      releases: boolean;
      pages: boolean;
    };
  };
}

export const DEPLOYMENT_CONFIG: DeploymentConfig = {
  targets: {
    npm: {
      registry: "https://registry.npmjs.org/",
      access: "public",
      tag: "latest",
    },
    itch: {
      user: "your-username",
      game: "kuuzuki-game-engine-demo",
      channel: "html",
    },
    github: {
      releases: true,
      pages: true,
    },
  },
};

// Build environment detection
export function getBuildEnvironment(): "development" | "production" | "test" {
  return (process.env.NODE_ENV as any) || "development";
}

// Platform detection
export function getTargetPlatform(): "node" | "browser" | "universal" {
  return (process.env.BUILD_TARGET as any) || "universal";
}

// Version management
export function getBuildVersion(): string {
  return process.env.BUILD_VERSION || "1.0.0";
}

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_DEBUG_LOGGING: getBuildEnvironment() === "development",
  ENABLE_PERFORMANCE_MONITORING: true,
  ENABLE_ERROR_REPORTING: getBuildEnvironment() === "production",
  ENABLE_ANALYTICS: getBuildEnvironment() === "production",
  ENABLE_HOT_RELOAD: getBuildEnvironment() === "development",
};

export default {
  PACKAGE_CONFIGS,
  WEB_BUILD_CONFIG,
  ITCH_BUILD_CONFIG,
  TYPESCRIPT_CONFIG,
  OPTIMIZATION_CONFIG,
  DEPLOYMENT_CONFIG,
  FEATURE_FLAGS,
  getBuildEnvironment,
  getTargetPlatform,
  getBuildVersion,
};
