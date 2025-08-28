import type { PluginInfo } from "../types";

// Mock plugin data (since plugin system doesn't exist yet)
export const plugins: PluginInfo[] = [
  {
    id: "typescript-support",
    name: "TypeScript Support",
    description: "Enhanced TypeScript integration and type checking",
    version: "1.2.0",
    enabled: true,
    author: "Kenji Team",
    category: "Development"
  },
  {
    id: "asset-optimizer",
    name: "Asset Optimizer",
    description: "Automatic asset optimization and compression",
    version: "0.8.1",
    enabled: false,
    author: "Kenji Team",
    category: "Build"
  },
  {
    id: "debug-tools",
    name: "Debug Tools",
    description: "Advanced debugging and profiling tools",
    version: "1.0.3",
    enabled: true,
    author: "Kenji Team",
    category: "Development"
  },
  {
    id: "export-web",
    name: "Web Export",
    description: "Export games for web platforms",
    version: "0.9.2",
    enabled: true,
    author: "Kenji Team",
    category: "Export"
  }
];