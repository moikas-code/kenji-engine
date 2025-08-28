import type { GlobalEngineConfig } from "../../../../../kenji";
import { configManager } from "../../../../../kenji";
import { defaultGlobalConfig } from "../../../../../kenji";

// Validate loaded configuration
export const validateLoadedConfig = (
  config: GlobalEngineConfig | null,
): boolean => {
  if (!config) {
    console.warn("Config validation failed: config is null");
    return false;
  }

  // Basic structure validation
  const requiredSections = [
    "ui",
    "editor",
    "build",
    "export",
    "templates",
    "shortcuts",
  ];
  for (const section of requiredSections) {
    if (!config[section as keyof GlobalEngineConfig]) {
      console.warn(`Missing required config section: ${section}`);
      return false;
    }
  }

  // Validate critical values
  if (!["dark", "light", "auto"].includes(config.ui.theme)) {
    console.warn(`Invalid theme value: ${config.ui.theme}`);
    return false;
  }

  return true;
};

// Get safe config with fallback to defaults
export const getSafeConfig = (): GlobalEngineConfig => {
  const config = configManager.getGlobalConfig();
  return validateLoadedConfig(config) ? config : defaultGlobalConfig;
};

// Create emergency config object (DRY - extracted from duplicated code)
export const createEmergencyConfig = (): GlobalEngineConfig => ({
  version: "0.0.1",
  ui: {
    theme: "dark",
    colors: {
      primary: "#FFFFFF",
      secondary: "#6B7280",
      accent: "#8B5CF6",
      background: "#000000",
      foreground: "#FFFFFF",
    },
    showDebugOverlay: false,
    enableConsole: true,
  },
  editor: {
    defaultTemplate: "basic-game",
    autoSave: true,
    autoSaveInterval: 60,
    showLineNumbers: true,
    tabSize: 2,
    insertSpaces: true,
    preferredEditor: "native",
    externalEditorCommand: "code",
    nativeEditor: {
      fontSize: 12,
      lineHeight: 1.2,
      showMinimap: false,
      wordWrap: true,
      highlightCurrentLine: true,
      bracketMatching: true,
    },
  },
  build: {
    defaultPlatform: "itch.io",
    defaultOutputDir: "dist",
    optimizationLevel: "basic",
    sourceMap: true,
    minify: false,
  },
  export: {
    defaultBundled: true,
    compressionLevel: 6,
    includeSourceMaps: false,
    generateManifest: true,
  },
  templates: {},
  shortcuts: {
    "new-project": "ctrl+n",
    "open-project": "ctrl+o",
    "save-project": "ctrl+s",
    "build-project": "ctrl+b",
    "export-project": "ctrl+e",
    "toggle-console": "`",
    "toggle-debug": "t",
  },
});

// Get field value from config object
export const getFieldValue = (
  fieldId: string,
  config: GlobalEngineConfig | null,
): string => {
  if (!config) return "";
  const keys = fieldId.split(".");
  let value: any = config;
  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = value[key];
    } else {
      return "";
    }
  }
  return value?.toString() || "";
};

// Update field in config
export const updateField = (
  fieldId: string,
  value: string | boolean,
  config: GlobalEngineConfig | null,
  setGlobalConfig: (config: GlobalEngineConfig) => void,
): void => {
  if (!config) return;
  configManager.setGlobalConfigValue(fieldId, value);
  setGlobalConfig(configManager.getGlobalConfig());
};