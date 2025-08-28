export type KeyModifier = 'ctrl' | 'alt' | 'shift' | 'meta';
export type KeyContext = 'global' | 'modal' | string; // string for view-specific contexts

export interface Keybind {
  id: string;
  key: string;
  modifiers?: KeyModifier[];
  contexts: KeyContext[];
  action: string;
  description: string;
  category?: string;
  enabled?: boolean;
  preventDefault?: boolean;
}

export interface KeybindConfig {
  version: string;
  preset?: 'default' | 'vim' | 'emacs';
  keybinds: {
    global: Keybind[];
    navigation?: Keybind[];
    views: Record<string, Keybind[]>;
    modals: Keybind[];
  };
  userOverrides?: Keybind[];
}

export interface KeyEvent {
  name: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  sequence?: string;
  full?: string;
}

export type KeybindHandler = (event: KeyEvent) => void | boolean;

export interface KeybindRegistration {
  keybind: Keybind;
  handler: KeybindHandler;
  priority?: number;
}

export interface KeybindContext {
  id: string;
  priority: number;
  active: boolean;
}