import { useState, useEffect, useCallback, memo } from "react";
import { useKeyboard } from "@opentui/react";
import { themeColors } from "../../shared/colors";

// Import all settings modules
import type {
  SettingsViewProps,
  FormField,
  GlobalEngineConfig
} from "./util";
import { 
  TABS,
  getCurrentFields,
  validateAllFields,
  validateSingleField,
  getFieldValue,
  updateField,
  getSafeConfig,
  createStatusMessageHandler,
  loadConfiguration,
  forceReloadConfigFromDisk,
  detectAvailableEditors,
  openConfigInEditor,
  reloadConfiguration,
  plugins
} from "./util";
import { configManager } from "../../../../kenji";

const SettingsView = (props: SettingsViewProps) => {
  // State management - Convert from SolidJS createSignal to React useState
  const [globalConfig, setGlobalConfig] = useState<GlobalEngineConfig | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("");
  const [currentTab, setCurrentTab] = useState(0);
  const [focusedFieldIndex, setFocusedFieldIndex] = useState(0);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [showEditorDialog, setShowEditorDialog] = useState(false);
  const [availableEditors, setAvailableEditors] = useState<string[]>([]);
  
  // Scrolling state
  const [scrollOffset, setScrollOffset] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [visibleHeight] = useState(15); // Fixed visible area height

  // Create status message handler
  const showStatusMessage = createStatusMessageHandler(setSaveStatus);

  // Load configuration on mount - Convert from SolidJS onMount to React useEffect
  useEffect(() => {
    const loadConfig = async () => {
      await loadConfiguration(
        setLoadingStep,
        setGlobalConfig,
        setIsLoading,
        showStatusMessage,
        false,
      );
    };
    loadConfig();
  }, [showStatusMessage]);

  // Calculate content height when tab changes
  useEffect(() => {
    const fields = getCurrentFields(currentTab);
    let height = 2; // Title and margin
    
    // Calculate height based on tab content
    switch (currentTab) {
      case 0: // Global Engine
      case 1: // Editor Preferences  
      case 2: // Project Defaults
      case 4: // Keyboard Shortcuts
        height += fields.length * 4; // Each field ~4 lines (label, description, input, margin)
        break;
      case 3: // Plugin Management
        height += plugins.length * 4; // Each plugin ~4 lines
        break;
    }
    
    setContentHeight(height);
  }, [currentTab]);

  // Field value getter with config dependency
  const getFieldValueWithConfig = useCallback(
    (fieldId: string): string => {
      return getFieldValue(fieldId, globalConfig);
    },
    [globalConfig],
  );

  // Validation functions
  const validateField = useCallback(
    (fieldId: string) => {
      const fields = getCurrentFields(currentTab);
      const errors = validateSingleField(
        fields,
        getFieldValueWithConfig,
        fieldId,
      );
      setFormErrors({ ...formErrors, ...errors });
    },
    [currentTab, getFieldValueWithConfig, formErrors],
  );

  // Field update handler
  const updateFieldWithConfig = useCallback(
    (fieldId: string, value: string | boolean) => {
      updateField(fieldId, value, globalConfig, setGlobalConfig);
      setHasUnsavedChanges(true);
      validateField(fieldId);
    },
    [globalConfig, validateField],
  );

  const validateAllFieldsWithConfig = () => {
    const fields = getCurrentFields(currentTab);
    const isValid = validateAllFields(fields, getFieldValueWithConfig);
    if (!isValid) {
      const errors = validateSingleField(fields, getFieldValueWithConfig, "");
      setFormErrors(errors);
    }
    return isValid;
  };

  // Save settings
  const saveSettings = useCallback(async () => {
    if (!validateAllFieldsWithConfig()) {
      showStatusMessage("❌ Please fix validation errors");
      return;
    }

    try {
      showStatusMessage("💾 Saving...", 0); // Don't auto-clear
      await configManager.saveGlobalConfig();
      showStatusMessage("✅ Settings saved successfully!");
      setHasUnsavedChanges(false);
    } catch (error) {
      showStatusMessage("❌ Failed to save settings");
      console.error("Failed to save settings:", error);
    }
  }, [validateAllFieldsWithConfig, showStatusMessage]);

  const resetToDefaults = useCallback(() => {
    // This would reset to default config - for now just show a message
    showStatusMessage("🔄 Reset functionality not implemented yet");
  }, [showStatusMessage]);

  // Keyboard handler - Convert from SolidJS useKeyHandler to React useKeyboard
  useKeyboard((key) => {
    // Recovery mechanism during loading
    if (isLoading) {
      if (key.name === "r" && key.ctrl) {
        // Force load with defaults
        setLoadingStep("Resetting to defaults...");
        setGlobalConfig(getSafeConfig());
        setIsLoading(false);
        showStatusMessage("🔄 Reset to defaults");
      } else if (key.name === "escape") {
        props.onBack();
      }
      return;
    }

    const fields = getCurrentFields(currentTab);

    if (key.name === "tab") {
      if (key.shift) {
        setFocusedFieldIndex((prev) =>
          prev > 0 ? prev - 1 : fields.length - 1,
        );
      } else {
        setFocusedFieldIndex((prev) => (prev + 1) % fields.length);
      }
      // Don't scroll when navigating form fields
      return;
    } else if (key.name === "left" && key.ctrl) {
      setCurrentTab((prev) => (prev > 0 ? prev - 1 : TABS.length - 1));
      setFocusedFieldIndex(0);
      setScrollOffset(0); // Reset scroll when changing tabs
    } else if (key.name === "right" && key.ctrl) {
      setCurrentTab((prev) => (prev + 1) % TABS.length);
      setFocusedFieldIndex(0);
      setScrollOffset(0); // Reset scroll when changing tabs
    } else if (key.name === "escape") {
      if (hasUnsavedChanges) {
        showStatusMessage(
          "⚠️ You have unsaved changes. Press ESC again to discard.",
        );
      } else {
        props.onBack();
      }
    } else if (key.name === "s" && key.ctrl) {
      saveSettings();
    } else if (key.name === "r" && key.ctrl) {
      resetToDefaults();
    } else if (key.name === "up" || key.name === "k") {
      // Scroll up
      setScrollOffset((prev) => Math.max(0, prev - 1));
    } else if (key.name === "down" || key.name === "j") {
      // Scroll down  
      const maxScroll = Math.max(0, contentHeight - visibleHeight);
      setScrollOffset((prev) => Math.min(maxScroll, prev + 1));
    } else if (key.name === "pageup") {
      // Page up (scroll up by visible height)
      setScrollOffset((prev) => Math.max(0, prev - visibleHeight));
    } else if (key.name === "pagedown") {
      // Page down (scroll down by visible height)
      const maxScroll = Math.max(0, contentHeight - visibleHeight);
      setScrollOffset((prev) => Math.min(maxScroll, prev + visibleHeight));
    } else if (key.name === "home") {
      // Go to top
      setScrollOffset(0);
    } else if (key.name === "end") {
      // Go to bottom
      const maxScroll = Math.max(0, contentHeight - visibleHeight);
      setScrollOffset(maxScroll);
    } else if (key.name === "e" && key.ctrl && key.shift) {
      // Ctrl+Shift+E to open editor dialog
      const editors = detectAvailableEditors();
      if (editors.length > 0) {
        setAvailableEditors(editors);
        setShowEditorDialog(true);
      } else {
        showStatusMessage("❌ No text editors found");
      }
    } else if (key.name === "r" && key.ctrl && key.shift) {
      // Ctrl+Shift+R to reload configuration
      reloadConfiguration(showStatusMessage);
    } else if (key.name === "f" && key.ctrl && key.shift) {
      // Ctrl+Shift+F to force reload from disk (debug)
      const forceConfig = forceReloadConfigFromDisk();
      if (forceConfig) {
        setGlobalConfig(forceConfig);
        showStatusMessage("✅ Config force reloaded from disk");
      } else {
        showStatusMessage("❌ Failed to force reload config");
      }
    }

    // Handle editor dialog input
    if (showEditorDialog) {
      if (key.name === "escape") {
        setShowEditorDialog(false);
      } else {
        const editorIndex = parseInt(key.name) - 1;
        if (editorIndex >= 0 && editorIndex < availableEditors.length) {
          const selectedEditor = availableEditors[editorIndex];
          if (selectedEditor) {
            openConfigInEditor(
              selectedEditor,
              showStatusMessage,
              setShowEditorDialog,
            );
          }
        }
      }
      return;
    }
  });

  // Render functions
  const renderField = (field: FormField, index: number) => {
    const value = getFieldValueWithConfig(field.id);
    const error = formErrors[field.id];
    const isFocused = focusedFieldIndex === index;

    return (
      <group
        key={field.id}
        style={{ flexDirection: "column", marginBottom: 1 }}
      >
        <text
          style={{
            fg: error ? "#FF453A" : themeColors.hex.accent,
          }}
        >
          {field.label}
          {field.required ? " *" : ""}
        </text>

        {field.description && (
          <text style={{ fg: themeColors.hex.muted, marginBottom: 0 }}>
            {field.description}
          </text>
        )}

        <box
          style={{
            width: 60,
            height: 1,
            borderColor: error
              ? "#FF453A"
              : isFocused
                ? themeColors.hex.accent
                : "#666666",
            marginTop: 0,
          }}
        >
          {field.type === "select" ? (
            <select
              options={
                field.options?.map((opt) => ({
                  name: opt.label,
                  description: "",
                  value: opt.value,
                })) || []
              }
              focused={isFocused}
              onSelect={(_, option: any) =>
                updateFieldWithConfig(field.id, option.value || option)
              }
            />
          ) : field.type === "boolean" ? (
            <select
              options={[
                { name: "Enabled", description: "", value: "true" },
                { name: "Disabled", description: "", value: "false" },
              ]}
              focused={isFocused}
              onSelect={(_, option: any) =>
                updateFieldWithConfig(field.id, option.value === "true")
              }
            />
          ) : (
            <input
              placeholder={field.placeholder || ""}
              value={value}
              focused={isFocused}
              onInput={(newValue: string) =>
                updateFieldWithConfig(field.id, newValue)
              }
              onSubmit={() => {
                if (index < getCurrentFields(currentTab).length - 1) {
                  setFocusedFieldIndex(index + 1);
                }
              }}
            />
          )}
        </box>

        {error && <text style={{ fg: "#FF453A", marginTop: 0 }}>{error}</text>}
      </group>
    );
  };

  const renderEditorPreferences = () => {
    const fields = getCurrentFields(1);

    return (
      <group style={{ flexDirection: "column", height: "100%" }}>
        <text style={{ fg: themeColors.hex.accent, marginBottom: 1 }}>
          📝 Editor Preferences
        </text>

        <group style={{ flexDirection: "column" }}>
          {fields.map((field, index) => renderField(field, index))}
        </group>

        <group style={{ flexDirection: "column", marginTop: 2 }}>
          <text style={{ fg: themeColors.hex.accentBright }}>
            🎯 Editor Launch Options
          </text>
          <text style={{ fg: themeColors.hex.muted, marginTop: 0 }}>
            • Ctrl+Shift+E: Open editor selection dialog
          </text>
          <text style={{ fg: themeColors.hex.muted }}>
            • Ctrl+Shift+R: Reload configuration after external editing
          </text>
          <text style={{ fg: themeColors.hex.muted }}>
            • Native editor supports: undo/redo, line numbers, syntax
            highlighting
          </text>
        </group>
      </group>
    );
  };

  const renderProjectDefaultsSettings = () => {
    const fields = getCurrentFields(2);

    return (
      <group style={{ flexDirection: "column", height: "100%" }}>
        <text style={{ fg: themeColors.hex.accent, marginBottom: 1 }}>
          📁 Project Defaults
        </text>

        <group style={{ flexDirection: "column" }}>
          {fields.map((field, index) => renderField(field, index))}
        </group>

        <group style={{ flexDirection: "column", marginTop: 2 }}>
          <text style={{ fg: themeColors.hex.accentBright }}>
            📋 Available Templates
          </text>
          {Object.values(configManager.getAvailableTemplates()).map(
            (template) => (
              <group
                key={template.name}
                style={{ flexDirection: "column", marginBottom: 1 }}
              >
                <text style={{ fg: themeColors.hex.foreground }}>
                  {template.name}
                </text>
                <text style={{ fg: themeColors.hex.muted }}>
                  {template.description}
                </text>
                <text style={{ fg: "#888888" }}>
                  Category: {template.category}
                </text>
              </group>
            ),
          )}
        </group>
      </group>
    );
  };

  const renderPluginManagement = () => {
    return (
      <group style={{ flexDirection: "column", height: "100%" }}>
        <text style={{ fg: themeColors.hex.accent, marginBottom: 1 }}>
          🔌 Plugin Management
        </text>

        <group style={{ flexDirection: "column" }}>
          {plugins.map((plugin) => (
            <group
              key={plugin.name}
              style={{
                flexDirection: "column",
                marginBottom: 1,
                padding: 1,
              }}
            >
              <group style={{ justifyContent: "space-between" }}>
                <text
                  style={{
                    fg: plugin.enabled
                      ? themeColors.hex.success
                      : themeColors.hex.muted,
                  }}
                >
                  {plugin.enabled ? "●" : "○"} {plugin.name}
                </text>
                <text style={{ fg: themeColors.hex.muted }}>
                  v{plugin.version}
                </text>
              </group>

              <text style={{ fg: themeColors.hex.foreground }}>
                {plugin.description}
              </text>

              <group style={{ justifyContent: "space-between", marginTop: 0 }}>
                <text style={{ fg: "#888888" }}>
                  by {plugin.author} • {plugin.category}
                </text>
                <text
                  style={{
                    fg: plugin.enabled ? "#FF453A" : themeColors.hex.success,
                  }}
                >
                  [{plugin.enabled ? "Disable" : "Enable"}]
                </text>
              </group>
            </group>
          ))}
        </group>
      </group>
    );
  };

  const renderKeyboardShortcuts = () => {
    const fields = getCurrentFields(4);

    return (
      <group style={{ flexDirection: "column", height: "100%" }}>
        <text style={{ fg: themeColors.hex.accent, marginBottom: 1 }}>
          ⌨️ Keyboard Shortcuts
        </text>

        <group style={{ flexDirection: "column" }}>
          {fields.map((field, index) => renderField(field, index))}
        </group>
      </group>
    );
  };

  /**
   * Create properly clipped scrollable content
   * This implementation solves the text overlap issue by:
   * 1. Only rendering visible fields based on scroll position
   * 2. Calculating which fields should be visible in the viewport
   * 3. Clipping content to prevent overflow outside the container
   */
  const renderScrollableContent = useCallback(() => {
    // Get the fields for current tab
    const fields = getCurrentFields(currentTab);
    
    // Calculate which fields to show based on scroll position
    // Each field takes approximately 4-5 lines (label, description, input, spacing)
    const linesPerField = 4;
    const fieldStartIndex = Math.floor(scrollOffset / linesPerField);
    const maxVisibleFields = Math.ceil(visibleHeight / linesPerField);
    const fieldEndIndex = Math.min(fields.length, fieldStartIndex + maxVisibleFields);
    const visibleFields = fields.slice(fieldStartIndex, fieldEndIndex);
    
    // Render based on current tab with visible fields only
    const renderVisibleContent = () => {
      switch (currentTab) {
        case 0: // Global Engine
          return (
            <group style={{ flexDirection: "column", height: "100%" }}>
              <text style={{ fg: themeColors.hex.accent, marginBottom: 1 }}>
                ⚙️ Global Engine Settings
              </text>
              <group style={{ flexDirection: "column" }}>
                {visibleFields.map((field, index) => renderField(field, fieldStartIndex + index))}
              </group>
            </group>
          );
        case 1: // Editor Preferences
          return (
            <group style={{ flexDirection: "column", height: "100%" }}>
              <text style={{ fg: themeColors.hex.accent, marginBottom: 1 }}>
                📝 Editor Preferences
              </text>
              <group style={{ flexDirection: "column" }}>
                {visibleFields.map((field, index) => renderField(field, fieldStartIndex + index))}
              </group>
            </group>
          );
        case 2: // Project Defaults
          return (
            <group style={{ flexDirection: "column", height: "100%" }}>
              <text style={{ fg: themeColors.hex.accent, marginBottom: 1 }}>
                📁 Project Defaults
              </text>
              <group style={{ flexDirection: "column" }}>
                {visibleFields.map((field, index) => renderField(field, fieldStartIndex + index))}
              </group>
            </group>
          );
        case 4: // Keyboard Shortcuts
          return (
            <group style={{ flexDirection: "column", height: "100%" }}>
              <text style={{ fg: themeColors.hex.accent, marginBottom: 1 }}>
                ⌨️ Keyboard Shortcuts
              </text>
              <group style={{ flexDirection: "column" }}>
                {visibleFields.map((field, index) => renderField(field, fieldStartIndex + index))}
              </group>
            </group>
          );
        case 3: // Plugin Management
          const pluginStartIndex = Math.floor(scrollOffset / 4);
          const pluginEndIndex = Math.min(plugins.length, pluginStartIndex + Math.ceil(visibleHeight / 4));
          const visiblePlugins = plugins.slice(pluginStartIndex, pluginEndIndex);
          
          return (
            <group style={{ flexDirection: "column", height: "100%" }}>
              <text style={{ fg: themeColors.hex.accent, marginBottom: 1 }}>
                🔌 Plugin Management
              </text>
              <group style={{ flexDirection: "column" }}>
                {visiblePlugins.map((plugin, index) => (
                  <group key={plugin.id} style={{ flexDirection: "column", marginBottom: 1 }}>
                    <group style={{ justifyContent: "space-between" }}>
                      <text
                        style={{
                          fg: plugin.enabled
                            ? themeColors.hex.success
                            : themeColors.hex.muted,
                        }}
                      >
                        {plugin.enabled ? "✓" : "○"} {plugin.name} ({plugin.version})
                      </text>
                      <text
                        style={{
                          fg: plugin.enabled
                            ? themeColors.hex.success
                            : themeColors.hex.muted,
                        }}
                      >
                        {plugin.enabled ? "ENABLED" : "DISABLED"}
                      </text>
                    </group>
                    <text style={{ fg: themeColors.hex.muted, marginTop: 0 }}>
                      {plugin.description}
                    </text>
                    <group style={{ justifyContent: "space-between", marginTop: 0 }}>
                      <text style={{ fg: "#888888" }}>
                        by {plugin.author} • {plugin.category}
                      </text>
                      <text
                        style={{
                          fg: plugin.enabled ? "#FF453A" : themeColors.hex.success,
                        }}
                      >
                        [{plugin.enabled ? "Disable" : "Enable"}]
                      </text>
                    </group>
                  </group>
                ))}
              </group>
            </group>
          );
        default:
          return null;
      }
    };

    return renderVisibleContent();
  }, [currentTab, scrollOffset, visibleHeight, contentHeight]);

  const renderCurrentTab = renderScrollableContent;

  // Loading state
  if (isLoading) {
    return (
      <group
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <text style={{ fg: themeColors.hex.accent }}>
          🔄 Loading settings... {isLoading ? "Loading" : ""}
        </text>
        <text style={{ fg: themeColors.hex.muted, marginTop: 1 }}>
          {loadingStep || "Initializing..."}
        </text>
        <group style={{ flexDirection: "column", marginTop: 2 }}>
          <text style={{ fg: "#FF9F0A" }}>
            💡 Press ` (backtick) to show debug console
          </text>
          <text style={{ fg: themeColors.hex.muted }}>
            Press Ctrl+R to reset to defaults
          </text>
        </group>
      </group>
    );
  }

  // Main UI
  return (
    <group style={{ flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <group style={{ flexDirection: "column", padding: 1 }}>
        <group style={{ justifyContent: "space-between" }}>
          <text style={{ fg: themeColors.hex.accent }}>
            ┌─ ⚙️ Kenji Engine Settings ──────────────────────────────────────┐
          </text>
          <group>
            <text
              style={{
                fg: hasUnsavedChanges ? "#FF9F0A" : themeColors.hex.muted,
              }}
            >
              {hasUnsavedChanges ? "●" : "○"}{" "}
              {hasUnsavedChanges ? "Unsaved" : "Saved"}
            </text>
          </group>
        </group>

        <text style={{ fg: themeColors.hex.muted, marginTop: 0 }}>
          │ Configure engine preferences, project defaults, and plugins │
        </text>

        <text style={{ fg: "#666666" }}>
          └─────────────────────────────────────────────────────────────────┘
        </text>
      </group>

      {/* Status Message */}
      {saveStatus && (
        <group
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 1,
            marginBottom: 1,
          }}
        >
          <text
            style={{
              fg: saveStatus.includes("✅")
                ? themeColors.hex.success
                : saveStatus.includes("❌")
                  ? "#FF453A"
                  : saveStatus.includes("⚠️")
                    ? "#FF9F0A"
                    : themeColors.hex.accent,
            }}
          >
            {saveStatus.substring(0, 2)}
          </text>
          <text style={{ fg: "#FFFFFF", marginLeft: 1 }}>
            {saveStatus.substring(2)}
          </text>
        </group>
      )}

      {/* Tab Navigation */}
      <group style={{ flexDirection: "row", marginBottom: 1 }}>
        {TABS.map((tab, index) => (
          <text
            key={tab.name}
            style={{
              fg:
                currentTab === index
                  ? themeColors.hex.accentBright
                  : themeColors.hex.muted,
              marginRight: 3,
            }}
          >
            {currentTab === index ? "▶" : " "} {tab.icon} {tab.name}
          </text>
        ))}
      </group>

      {/* Tab Description */}
      <text style={{ fg: themeColors.hex.muted, marginBottom: 1 }}>
        {TABS[currentTab]?.description || ""}
      </text>

      {/* Main Content with Scroll Indicators */}
      <group style={{ flexDirection: "row", marginBottom: 1 }}>
        <box
          style={{
            height: visibleHeight,
            flexGrow: 1,
          }}
        >
          {renderCurrentTab()}
        </box>
        
        {/* Scroll Indicator */}
        {contentHeight > visibleHeight && (
          <group style={{ flexDirection: "column", marginLeft: 1 }}>
            <text style={{ fg: themeColors.hex.muted }}>
              {scrollOffset > 0 ? "▲" : " "}
            </text>
            <text style={{ fg: themeColors.hex.accent, marginTop: 1 }}>
              {Math.floor((scrollOffset / Math.max(1, contentHeight - visibleHeight)) * 10) || 0}/10
            </text>
            <text style={{ fg: themeColors.hex.muted, marginTop: 1 }}>
              {scrollOffset < contentHeight - visibleHeight ? "▼" : " "}
            </text>
          </group>
        )}
      </group>

      {/* Editor Selection Dialog */}
      {showEditorDialog && (
        <group
          style={{
            flexDirection: "column",
            padding: 2,
          }}
        >
          <text style={{ fg: themeColors.hex.accent, marginBottom: 1 }}>
            ┌─ Select Text Editor ──────────────────────────────────────┐
          </text>
          <text style={{ fg: themeColors.hex.muted, marginBottom: 1 }}>
            │ Choose an editor to open the configuration file: │
          </text>
          <text style={{ fg: "#666666", marginBottom: 2 }}>
            └───────────────────────────────────────────────────┘
          </text>

          {availableEditors.map((editor, index) => (
            <text
              key={editor}
              style={{
                fg: themeColors.hex.foreground,
                marginBottom: 0,
                marginLeft: 2,
              }}
            >
              {index + 1}. {editor}
            </text>
          ))}

          <text style={{ fg: themeColors.hex.muted, marginTop: 2 }}>
            Press 1-{availableEditors.length} to select • ESC to cancel
          </text>
        </group>
      )}

      {/* Footer - Always visible */}
      <group
        style={{
          flexDirection: "column",
          padding: 1,
        }}
      >
        <text style={{ fg: themeColors.hex.muted }}>
          Tab/Shift+Tab Navigate • Ctrl+Tab Switch Tabs • Ctrl+S Save • Ctrl+R
          Reset • ESC Cancel
        </text>
        <text style={{ fg: themeColors.hex.muted }}>
          ↑/↓ or J/K Scroll • PgUp/PgDn Page Scroll • Home/End Top/Bottom • 
          Ctrl+Shift+E Edit Config •{" "}
          {hasUnsavedChanges ? "⚠️ Unsaved changes" : "All changes saved"}
        </text>
      </group>
    </group>
  );
};

export default memo(SettingsView);
