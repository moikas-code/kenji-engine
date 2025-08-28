import type { GlobalEngineConfig } from "../../../../../kenji";
import { validateLoadedConfig, createEmergencyConfig } from "./configManager";
import { configManager } from "../../../../../kenji";
import { LOADING_TIMEOUT, SUCCESS_MESSAGE_DELAY } from "../types";
import type { StatusMessageHandler } from "../hooks/useStatusMessage";
import { existsSync, readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

// Debug function to test config manager
export const debugConfigManager = () => {
  const configPath = configManager.getGlobalConfigPath();
  if (existsSync(configPath)) {
    try {
      const { readFileSync } = require("fs");
      const rawContent = readFileSync(configPath, "utf8");
      const parsed = JSON.parse(rawContent);
    } catch (error) {
      console.error(
        "Direct file read error:",
        error instanceof Error ? error.message : String(error),
      );
    }
  }
  try {
    const config = configManager.getGlobalConfig();
    if (config) {
      // Check if this is default config (all values match defaults)
      const { defaultGlobalConfig } = require("../../../project/config");
      const isDefault =
        JSON.stringify(config) === JSON.stringify(defaultGlobalConfig);
      if (isDefault && existsSync(configPath)) {
        console.warn(
          "WARNING: Using default config despite config file existing!",
        );
        console.warn(
          "This suggests the config file could not be loaded (permissions/file error)",
        );
      }
    }
  } catch (error) {
    console.error("Config loading error:", error);
  }
};

// Force reload config from disk (bypasses config manager cache)
export const forceReloadConfigFromDisk = (): GlobalEngineConfig | null => {
  const configPath = join(homedir(), ".kenji-engine", "config.json");
  try {
    if (existsSync(configPath)) {
      const configText = readFileSync(configPath, "utf8");
      const config = JSON.parse(configText);
      if (validateLoadedConfig(config)) {
        return config;
      } else {
        console.warn("Force reloaded config is invalid");
        return null;
      }
    } else {
      return null;
    }
  } catch (error) {
    console.error(
      "Failed to force reload config:",
      error instanceof Error ? error.message : String(error),
    );
    return null;
  }
};

// Extracted loading logic (DRY - makes onMount more readable)
export const loadConfiguration = async (
  setLoadingStep: (step: string) => void,
  setGlobalConfig: (config: GlobalEngineConfig) => void,
  setIsLoading: (loading: boolean) => void,
  showStatusMessage: StatusMessageHandler,
  isLoading: boolean,
): Promise<void> => {
  // Debug config manager first
  debugConfigManager();

  // Add an immediate fallback timeout (1 second) to prevent hanging
  const immediateFallback = setTimeout(() => {
    if (isLoading) {
      console.warn(
        "Immediate fallback triggered - loading was taking too long",
      );
      setLoadingStep("Loading emergency configuration...");
      const emergencyConfig = createEmergencyConfig();
      setGlobalConfig(emergencyConfig);
      setIsLoading(false);
    }
  }, 1000);

  setLoadingStep("Initializing configuration manager...");

  let timeoutId: NodeJS.Timeout;
  const timeout = () => {
    // Only execute if still loading (prevent race condition)
    if (!isLoading) return;
    clearTimeout(immediateFallback);
    console.warn("Settings loading timeout - using emergency fallback");
    setLoadingStep("Emergency fallback activated...");
    showStatusMessage("Loading timeout, using emergency defaults");
    const emergencyConfig = createEmergencyConfig();
    setGlobalConfig(emergencyConfig);
    setIsLoading(false);
  };

  // Set timeout for config loading
  timeoutId = setTimeout(timeout, LOADING_TIMEOUT);

  try {
    setLoadingStep("Loading global configuration...");

    // Try to load config synchronously with timeout protection
    let config: GlobalEngineConfig | null = null;
    try {
      config = configManager.getGlobalConfig();
      if (config) {
        const isValid = validateLoadedConfig(config);
        if (isValid) {
          // Check if we're getting default config when file exists (permissions issue)
          const configPath = join(homedir(), ".kenji-engine", "config.json");
          if (existsSync(configPath)) {
            try {
              const rawContent = readFileSync(configPath, "utf8");
              const rawConfig = JSON.parse(rawContent);
              // Compare with what config manager returned
              const {
                defaultGlobalConfig,
              } = require("../../../project/config");
              const managerReturnedDefault =
                JSON.stringify(config) === JSON.stringify(defaultGlobalConfig);
              if (
                managerReturnedDefault &&
                rawConfig.version !== defaultGlobalConfig.version
              ) {
                console.warn(
                  "Config manager returned defaults but file exists with different content!",
                );
                const forceLoaded = forceReloadConfigFromDisk();
                if (forceLoaded) {
                  config = forceLoaded;
                }
              }
            } catch (diskError) {
              console.warn(
                "Could not verify config file on disk:",
                diskError instanceof Error
                  ? diskError.message
                  : String(diskError),
              );
            }
          }
        } else {
          console.warn("Config validation failed");
        }
      }
    } catch (error) {
      console.error("Synchronous config load failed:", error);
      config = null;
    }

    if (config && validateLoadedConfig(config)) {
      clearTimeout(timeoutId);
      clearTimeout(immediateFallback);
      setGlobalConfig(config);
      setLoadingStep("Configuration loaded successfully");
      // Small delay to let user see success message before hiding loading screen
      setTimeout(() => {
        setIsLoading(false);
      }, SUCCESS_MESSAGE_DELAY);
      return; // Exit early to avoid the finally block
    } else {
      // If config is invalid or missing, use emergency fallback immediately
      clearTimeout(timeoutId);
      clearTimeout(immediateFallback);
      console.warn(
        "Configuration invalid or missing, using emergency fallback",
      );
      setLoadingStep("Using emergency configuration...");
      showStatusMessage("Using emergency configuration", 2000);
      const emergencyConfig = createEmergencyConfig();
      setGlobalConfig(emergencyConfig);
      setIsLoading(false); // Set loading to false after emergency config
      return; // Exit early to avoid the finally block
    }
  } catch (error) {
    clearTimeout(timeoutId);
    clearTimeout(immediateFallback);
    console.error("Failed to load settings:", error);
    setLoadingStep("Error loading configuration");
    showStatusMessage("Failed to load settings, using emergency defaults");
    // Emergency fallback in catch block
    const emergencyConfig = createEmergencyConfig();
    setGlobalConfig(emergencyConfig);
    setIsLoading(false); // Set loading to false after emergency config in catch
  } finally {
    // Only set loading to false if it wasn't already set
    if (isLoading) {
      setIsLoading(false);
    }
  }
};