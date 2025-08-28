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
  console.log("🔧 Config Manager Debug Info:");
  console.log("- Config path:", configPath);
  console.log("- Config file exists:", existsSync(configPath));

  if (existsSync(configPath)) {
    try {
      // Try to read the file directly to check permissions
      const { readFileSync } = require("fs");
      const rawContent = readFileSync(configPath, "utf8");
      console.log("- Raw file readable:", !!rawContent);
      console.log("- File size:", rawContent.length, "characters");

      const parsed = JSON.parse(rawContent);
      console.log("- JSON parsing successful:", !!parsed);
      console.log("- Parsed config version:", parsed.version);
      console.log("- Parsed UI theme:", parsed.ui?.theme);
    } catch (error) {
      console.error(
        "- Direct file read error:",
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  try {
    const config = configManager.getGlobalConfig();
    console.log("- Config loaded successfully:", !!config);
    if (config) {
      console.log("- Config version:", config.version);
      console.log("- Has UI section:", !!config.ui);
      console.log("- Has editor section:", !!config.editor);
      console.log("- Has build section:", !!config.build);
      console.log("- Has export section:", !!config.export);
      console.log("- UI theme:", config.ui?.theme);

      // Check if this is default config (all values match defaults)
      const { defaultGlobalConfig } = require("../../../project/config");
      const isDefault =
        JSON.stringify(config) === JSON.stringify(defaultGlobalConfig);
      console.log("- Is default config:", isDefault);

      if (isDefault && existsSync(configPath)) {
        console.warn(
          "⚠️ WARNING: Using default config despite config file existing!",
        );
        console.warn(
          "   This suggests the config file could not be loaded (permissions/file error)",
        );
      }
    }
  } catch (error) {
    console.error("- Config loading error:", error);
  }
};

// Force reload config from disk (bypasses config manager cache)
export const forceReloadConfigFromDisk = (): GlobalEngineConfig | null => {
  const configPath = join(homedir(), ".kenji-engine", "config.json");

  try {
    if (existsSync(configPath)) {
      console.log("🔄 Force reloading config from disk...");
      const configText = readFileSync(configPath, "utf8");
      const config = JSON.parse(configText);

      if (validateLoadedConfig(config)) {
        console.log("✅ Config force reloaded successfully");
        return config;
      } else {
        console.warn("⚠️ Force reloaded config is invalid");
        return null;
      }
    } else {
      console.log("ℹ️ No config file found on disk");
      return null;
    }
  } catch (error) {
    console.error(
      "❌ Failed to force reload config:",
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
  console.log("🔄 Starting configuration loading...");

  // Debug config manager first
  debugConfigManager();

  // Add an immediate fallback timeout (1 second) to prevent hanging
  const immediateFallback = setTimeout(() => {
    if (isLoading) {
      console.warn(
        "🚨 Immediate fallback triggered - loading was taking too long",
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
    console.warn("⚠️ Settings loading timeout - using emergency fallback");
    setLoadingStep("Emergency fallback activated...");
    showStatusMessage("⚠️ Loading timeout, using emergency defaults");
    const emergencyConfig = createEmergencyConfig();
    setGlobalConfig(emergencyConfig);
    setIsLoading(false);
  };

  // Set timeout for config loading
  timeoutId = setTimeout(timeout, LOADING_TIMEOUT);

  try {
    setLoadingStep("Loading global configuration...");
    console.log("📂 Attempting to load global configuration...");

    // Try to load config synchronously with timeout protection
    let config: GlobalEngineConfig | null = null;

    try {
      console.log("🔍 Attempting synchronous config load...");
      config = configManager.getGlobalConfig();
      console.log(
        "✅ Config loaded:",
        config ? "valid config object" : "null config",
      );

      if (config) {
        console.log("🔍 Validating config structure...");
        const isValid = validateLoadedConfig(config);
        console.log("✅ Config validation result:", isValid);

        if (isValid) {
          console.log("✅ Config is valid, proceeding...");

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
                  "🚨 Config manager returned defaults but file exists with different content!",
                );
                console.log("🔄 Attempting force reload from disk...");

                const forceLoaded = forceReloadConfigFromDisk();
                if (forceLoaded) {
                  console.log("✅ Force reload successful, using disk config");
                  config = forceLoaded;
                }
              }
            } catch (diskError) {
              console.warn(
                "⚠️ Could not verify config file on disk:",
                diskError instanceof Error
                  ? diskError.message
                  : String(diskError),
              );
            }
          }
        } else {
          console.warn("⚠️ Config validation failed");
        }
      }
    } catch (error) {
      console.error("❌ Synchronous config load failed:", error);
      config = null;
    }

    if (config && validateLoadedConfig(config)) {
      clearTimeout(timeoutId);
      clearTimeout(immediateFallback);
      console.log("✅ Configuration validated successfully");
      console.log("🔄 Setting global config...");
      setGlobalConfig(config);
      console.log("📝 Setting loading step to success...");
      setLoadingStep("Configuration loaded successfully");
      console.log(
        "⏰ Scheduling setIsLoading(false) in",
        SUCCESS_MESSAGE_DELAY,
        "ms...",
      );

      // Small delay to let user see success message before hiding loading screen
      setTimeout(() => {
        console.log("🏁 Setting isLoading to false...");
        setIsLoading(false);
        console.log("✅ Loading completed successfully");
      }, SUCCESS_MESSAGE_DELAY);
      return; // Exit early to avoid the finally block
    } else {
      // If config is invalid or missing, use emergency fallback immediately
      clearTimeout(timeoutId);
      clearTimeout(immediateFallback);
      console.warn(
        "⚠️ Configuration invalid or missing, using emergency fallback",
      );
      console.log("🔄 Setting emergency config...");
      setLoadingStep("Using emergency configuration...");
      showStatusMessage("⚠️ Using emergency configuration", 2000);

      const emergencyConfig = createEmergencyConfig();
      setGlobalConfig(emergencyConfig);
      console.log("🏁 Setting isLoading to false (emergency)...");
      setIsLoading(false); // Set loading to false after emergency config
      return; // Exit early to avoid the finally block
    }
  } catch (error) {
    clearTimeout(timeoutId);
    clearTimeout(immediateFallback);
    console.error("❌ Failed to load settings:", error);
    setLoadingStep("Error loading configuration");
    showStatusMessage("❌ Failed to load settings, using emergency defaults");

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
