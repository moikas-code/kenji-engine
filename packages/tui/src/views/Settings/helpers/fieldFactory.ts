import type { FormField } from "../types";
import {
  THEME_OPTIONS,
  TEMPLATE_OPTIONS,
  PLATFORM_OPTIONS,
  OPTIMIZATION_OPTIONS,
  EDITOR_OPTIONS
} from "../types";

// Field factory functions (DRY - eliminates repetitive field definitions)
export const createTextField = (
  id: string,
  label: string,
  placeholder?: string,
  description?: string,
  required?: boolean
): FormField => ({
  id, label, type: "text", placeholder, description, required
});

export const createNumberField = (
  id: string,
  label: string,
  min?: number,
  max?: number,
  description?: string
): FormField => ({
  id, label, type: "number", min, max, description
});

export const createBooleanField = (
  id: string,
  label: string,
  description?: string
): FormField => ({
  id, label, type: "boolean", description
});

export const createSelectField = (
  id: string,
  label: string,
  options: { value: string; label: string }[],
  description?: string
): FormField => ({
  id, label, type: "select", options, description
});

// Form fields for each section (DRY - using factory functions and constants)
export const getGlobalEngineFields = (): FormField[] => [
  // UI Settings
  createSelectField("ui.theme", "Theme", THEME_OPTIONS, "Color theme for the interface"),
  createBooleanField("ui.showDebugOverlay", "Debug Overlay", "Show debug information overlay"),
  createBooleanField("ui.enableConsole", "Enable Console", "Enable developer console"),

  // Editor Settings
  createSelectField("editor.defaultTemplate", "Default Template", TEMPLATE_OPTIONS, "Default project template"),
  createBooleanField("editor.autoSave", "Auto Save", "Automatically save changes"),
  createNumberField("editor.autoSaveInterval", "Auto Save Interval (s)", 5, 300, "Seconds between auto-saves"),
  createBooleanField("editor.showLineNumbers", "Show Line Numbers", "Display line numbers in editor"),
  createNumberField("editor.tabSize", "Tab Size", 2, 8, "Number of spaces per tab"),
  createBooleanField("editor.insertSpaces", "Insert Spaces", "Use spaces instead of tabs"),

  // Build Settings
  createSelectField("build.defaultPlatform", "Default Platform", PLATFORM_OPTIONS, "Default export platform"),
  createTextField("build.defaultOutputDir", "Output Directory", "dist", "Default build output directory"),
  createSelectField("build.optimizationLevel", "Optimization Level", OPTIMIZATION_OPTIONS, "Code optimization level"),
  createBooleanField("build.sourceMap", "Generate Source Maps", "Generate source maps for debugging"),
  createBooleanField("build.minify", "Minify Code", "Minify and compress output"),

  // Export Settings
  createBooleanField("export.defaultBundled", "Bundle by Default", "Bundle dependencies by default"),
  createNumberField("export.compressionLevel", "Compression Level", 0, 9, "Asset compression level (0-9)"),
  createBooleanField("export.includeSourceMaps", "Include Source Maps", "Include source maps in export"),
  createBooleanField("export.generateManifest", "Generate Manifest", "Generate app manifest file")
];

export const getProjectDefaultsFields = (): FormField[] => [
  createTextField("project.defaultName", "Default Project Name", "My Game", "Default name for new projects"),
  createTextField("project.defaultAuthor", "Default Author", "Your Name", "Default author for new projects"),
  createNumberField("project.defaultWidth", "Default Width", 10, 200, "Default game width"),
  createNumberField("project.defaultHeight", "Default Height", 5, 100, "Default game height"),
  createNumberField("project.defaultFps", "Default FPS", 1, 120, "Default game frame rate"),
  createBooleanField("project.includeReadme", "Include README", "Generate README file for new projects"),
  createBooleanField("project.includeGitignore", "Include .gitignore", "Generate .gitignore file for new projects")
];

export const getEditorPreferenceFields = (): FormField[] => [
  createSelectField("editor.preferredEditor", "Preferred Editor", EDITOR_OPTIONS, "Choose your preferred text editor"),
  createTextField("editor.externalEditorCommand", "External Editor Command", "code", "Command to launch external editor"),
  createBooleanField("editor.nativeEditor.showLineNumbers", "Show Line Numbers", "Display line numbers in native editor"),
  createBooleanField("editor.nativeEditor.wordWrap", "Word Wrap", "Wrap long lines in native editor"),
  createBooleanField("editor.nativeEditor.highlightCurrentLine", "Highlight Current Line", "Highlight the current line"),
  createBooleanField("editor.nativeEditor.bracketMatching", "Bracket Matching", "Highlight matching brackets")
];

export const getShortcutFields = (): FormField[] => [
  createTextField("shortcuts.new-project", "New Project", "ctrl+n", "Shortcut for creating new project"),
  createTextField("shortcuts.open-project", "Open Project", "ctrl+o", "Shortcut for opening project"),
  createTextField("shortcuts.save-project", "Save Project", "ctrl+s", "Shortcut for saving project"),
  createTextField("shortcuts.build-project", "Build Project", "ctrl+b", "Shortcut for building project"),
  createTextField("shortcuts.export-project", "Export Project", "ctrl+e", "Shortcut for exporting project"),
  createTextField("shortcuts.toggle-console", "Toggle Console", "`", "Shortcut for toggling console"),
  createTextField("shortcuts.toggle-debug", "Toggle Debug", "t", "Shortcut for toggling debug overlay")
];

// Get current fields based on tab index
export const getCurrentFields = (tabIndex: number): FormField[] => {
  switch (tabIndex) {
    case 0: return getGlobalEngineFields();
    case 1: return getEditorPreferenceFields();
    case 2: return getProjectDefaultsFields();
    case 3: return []; // Plugin management doesn't use form fields
    case 4: return getShortcutFields();
    default: return [];
  }
};