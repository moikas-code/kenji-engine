import type { GlobalEngineConfig, ProjectTemplate } from "../../../../../kenji";

// Re-export types for convenience
export type { GlobalEngineConfig, ProjectTemplate };

// Settings view props interface
export interface SettingsViewProps {
  onBack: () => void;
}

// Form field interface
export interface FormField {
  id: string;
  label: string;
  type: "text" | "number" | "select" | "boolean" | "color";
  placeholder?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  required?: boolean;
  description?: string;
}

// Plugin info interface
export interface PluginInfo {
  id: string;
  name: string;
  description: string;
  version: string;
  enabled: boolean;
  author: string;
  category: string;
}

// Tab definition interface
export interface TabDefinition {
  name: string;
  icon: string;
  description: string;
}

// Constants used throughout settings
export const LOADING_TIMEOUT = 3000;
export const SUCCESS_MESSAGE_DELAY = 100;
export const STATUS_MESSAGE_DURATION = 3000;
export const EMERGENCY_CONFIG_DELAY = 2000;

// Theme options
export const THEME_OPTIONS = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "auto", label: "Auto" },
];

// Template options
export const TEMPLATE_OPTIONS = [
  { value: "basic-game", label: "Basic Game" },
  { value: "pong-game", label: "Pong Game" },
];

// Platform options
export const PLATFORM_OPTIONS = [
  { value: "itch.io", label: "itch.io" },
  { value: "standalone", label: "Standalone" },
  { value: "web", label: "Web" },
];

// Optimization options
export const OPTIMIZATION_OPTIONS = [
  { value: "none", label: "None" },
  { value: "basic", label: "Basic" },
  { value: "advanced", label: "Advanced" },
];

// Editor options
export const EDITOR_OPTIONS = [
  { value: "native", label: "Native Editor" },
  { value: "external", label: "External Editor" },
];

// Available editors list
export const AVAILABLE_EDITORS = [
  "nvim",
  "neovim",
  "micro",
  "vim",
  "nano",
  "emacs",
  "code",
];

// Tab definitions
export const TABS: TabDefinition[] = [
  {
    name: "Global Engine",
    icon: "⚙️",
    description: "UI, editor, build & export settings",
  },
  {
    name: "Editor Preferences",
    icon: "📝",
    description: "Choose editor type and configure settings",
  },
  {
    name: "Project Defaults",
    icon: "📁",
    description: "Default templates and project preferences",
  },
  {
    name: "Plugin Management",
    icon: "🔌",
    description: "Manage installed plugins and extensions",
  },
  {
    name: "Keyboard Shortcuts",
    icon: "⌨️",
    description: "Customize keyboard shortcuts",
  },
];
