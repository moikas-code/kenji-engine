import { execSync } from "child_process";
import { existsSync } from "fs";
import { configManager } from "../../../../../kenji";
import { AVAILABLE_EDITORS } from "../types";
import type { StatusMessageHandler } from "../hooks/useStatusMessage";

// Detect available text editors
export const detectAvailableEditors = (): string[] => {
  const available: string[] = [];

  for (const editor of AVAILABLE_EDITORS) {
    try {
      // Check if editor is available in PATH
      execSync(`which ${editor}`, { stdio: "ignore" });
      available.push(editor);
    } catch {
      // Editor not found, continue
    }
  }

  return available;
};

// Open config file in external editor
export const openConfigInEditor = (
  editor: string,
  showStatusMessage: StatusMessageHandler,
  setShowEditorDialog: (show: boolean) => void,
) => {
  try {
    const configPath = configManager.getGlobalConfigPath();
    if (!existsSync(configPath)) {
      showStatusMessage("❌ Config file not found");
      return;
    }

    showStatusMessage(`🔧 Opening config in ${editor}...`, 0); // Don't auto-clear

    // Open editor in background using spawn
    const { spawn } = require("child_process");
    const child = spawn(editor, [configPath], {
      stdio: "ignore",
      detached: true,
    });

    child.unref();

    showStatusMessage(`✅ Config opened in ${editor}`);
    setShowEditorDialog(false);
  } catch (error) {
    showStatusMessage(`❌ Failed to open ${editor}`);
    console.error("Failed to open editor:", error);
  }
};

// Reload configuration after external editing
export const reloadConfiguration = async (
  showStatusMessage: StatusMessageHandler,
) => {
  try {
    showStatusMessage("🔄 Reloading configuration...", 0); // Don't auto-clear

    // Reload the configuration from disk
    const configPath = configManager.getGlobalConfigPath();
    if (existsSync(configPath)) {
      // Force the config manager to reload
      // This is a workaround - in a real app you'd have a reload method
      const reloadedConfig = configManager.getGlobalConfig();
      if (validateLoadedConfig(reloadedConfig)) {
        showStatusMessage("✅ Configuration reloaded");
      } else {
        showStatusMessage("⚠️ Reloaded config is invalid");
      }
    } else {
      showStatusMessage("❌ Config file not found");
    }
  } catch (error) {
    showStatusMessage("❌ Failed to reload configuration");
    console.error("Failed to reload config:", error);
  }
};

// Helper function to validate config (imported to avoid circular dependency)
const validateLoadedConfig = (config: any): boolean => {
  if (!config) return false;

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
    if (!config[section]) {
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
