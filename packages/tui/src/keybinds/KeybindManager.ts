import {
  Keybind,
  KeybindConfig,
  KeyEvent,
  KeybindHandler,
  KeybindContext,
} from "./types";
import { existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

export class KeybindManager {
  private static instance: KeybindManager;
  private config: KeybindConfig | null = null;
  private contexts: Map<string, KeybindContext> = new Map();
  private activeContexts: Set<string> = new Set(["global"]);
  private handlers: Map<string, KeybindHandler> = new Map();
  private configPath: string;
  private userOverridesPath: string;

  private constructor() {
    this.configPath = join(__dirname, "config", "default.json");
    this.userOverridesPath = join(homedir(), ".kenji-engine", "keybinds.json");
    this.initializeContexts();
    // Load config asynchronously
    this.loadConfig().catch(error => {
      console.error("Failed to load keybind config:", error);
    });
  }

  static getInstance(): KeybindManager {
    if (!KeybindManager.instance) {
      KeybindManager.instance = new KeybindManager();
    }
    return KeybindManager.instance;
  }

  private initializeContexts(): void {
    // Set up default contexts with priorities
    this.contexts.set("global", { id: "global", priority: 0, active: true });
    this.contexts.set("navigation", { id: "navigation", priority: 10, active: true });
    this.contexts.set("modal", { id: "modal", priority: 100, active: false });
    // View contexts will be added dynamically with priority 50
  }

  private async loadConfig(): Promise<void> {
    try {
      // Check for user preset preference
      let presetName = "default";
      if (existsSync(this.userOverridesPath)) {
        const userConfigFile = Bun.file(this.userOverridesPath);
        const userConfig = (await userConfigFile.json()) as Partial<KeybindConfig>;
        if (userConfig.preset) {
          presetName = userConfig.preset;
        }
      }

      // Load preset config
      const presetPath = join(__dirname, presetName === "default" ? "config" : "presets", `${presetName}.json`);
      const presetFile = Bun.file(presetPath);
      
      if (await presetFile.exists()) {
        const presetConfig = (await presetFile.json()) as KeybindConfig;
        this.config = presetConfig;
      } else {
        // Fallback to default config
        const defaultConfigFile = Bun.file(this.configPath);
        if (await defaultConfigFile.exists()) {
          const defaultConfig = (await defaultConfigFile.json()) as KeybindConfig;
          this.config = defaultConfig;
        }
      }

      // Load and merge user overrides
      if (existsSync(this.userOverridesPath)) {
        const userConfigFile = Bun.file(this.userOverridesPath);
        const userOverrides = (await userConfigFile.json()) as Partial<KeybindConfig>;
        if (userOverrides.userOverrides) {
          this.applyUserOverrides(userOverrides.userOverrides);
        }
      }
    } catch (error) {
      console.error("Failed to load keybind config:", error);
      this.config = this.getDefaultConfig();
    }
  }

  private getDefaultConfig(): KeybindConfig {
    return {
      version: "0.0.1",
      preset: "default",
      keybinds: {
        global: [
          {
            id: "quit",
            key: "q",
            modifiers: ["ctrl"],
            contexts: ["global"],
            action: "quit",
            description: "Quit application",
          },
          {
            id: "help",
            key: "?",
            contexts: ["global"],
            action: "showHelp",
            description: "Show help",
          },
          {
            id: "debug",
            key: "`",
            contexts: ["global"],
            action: "toggleDebug",
            description: "Toggle debug console",
          },
        ],
        views: {
          home: [
            {
              id: "create",
              key: "c",
              contexts: ["home"],
              action: "navigate:create",
              description: "Create new project",
            },
            {
              id: "load",
              key: "l",
              contexts: ["home"],
              action: "navigate:load",
              description: "Load existing project",
            },
          ],
          load: [
            {
              id: "up",
              key: "up",
              contexts: ["load"],
              action: "list:moveUp",
              description: "Move up",
            },
            {
              id: "down",
              key: "down",
              contexts: ["load"],
              action: "list:moveDown",
              description: "Move down",
            },
             {
               id: "left",
               key: "left",
               contexts: ["load"],
               action: "navigate:parent",
               description: "Go to parent directory",
             },
             {
               id: "right",
               key: "right",
               contexts: ["load"],
               action: "navigate:enter",
               description: "Enter directory",
             },
            {
              id: "select",
              key: "return",
              contexts: ["load"],
              action: "select",
              description: "Select item",
            },
            {
              id: "refresh",
              key: "r",
              contexts: ["load"],
              action: "refresh",
              description: "Refresh directory",
            },
            {
              id: "back",
              key: "escape",
              contexts: ["load"],
              action: "navigate:back",
              description: "Go back",
            },
          ],
          editor: [
            {
              id: "save",
              key: "s",
              modifiers: ["ctrl"],
              contexts: ["editor"],
              action: "save",
              description: "Save file",
            },
            {
              id: "undo",
              key: "z",
              modifiers: ["ctrl"],
              contexts: ["editor"],
              action: "undo",
              description: "Undo",
            },
            {
              id: "redo",
              key: "z",
              modifiers: ["ctrl", "shift"],
              contexts: ["editor"],
              action: "redo",
              description: "Redo",
            },
          ],
        },
        modals: [],
      },
      userOverrides: [],
    };
  }

  private applyUserOverrides(overrides: Keybind[]): void {
    if (!this.config) return;

    overrides.forEach((override) => {
      // Find and replace existing keybind
      const contexts = override.contexts;
      contexts.forEach((context) => {
        if (context === "global") {
          const index = this.config!.keybinds.global.findIndex(
            (kb) => kb.id === override.id,
          );
          if (index !== -1) {
            this.config!.keybinds.global[index] = override;
          } else {
            this.config!.keybinds.global.push(override);
          }
        } else if (this.config!.keybinds.views[context]) {
          const index = this.config!.keybinds.views[context].findIndex(
            (kb) => kb.id === override.id,
          );
          if (index !== -1) {
            this.config!.keybinds.views[context][index] = override;
          } else {
            this.config!.keybinds.views[context].push(override);
          }
        }
      });
    });
  }

  public activateContext(contextId: string, priority: number = 50): void {
    if (!this.contexts.has(contextId)) {
      this.contexts.set(contextId, { id: contextId, priority, active: true });
    }
    const context = this.contexts.get(contextId)!;
    context.active = true;
    this.activeContexts.add(contextId);
  }

  public deactivateContext(contextId: string): void {
    const context = this.contexts.get(contextId);
    if (context) {
      context.active = false;
      this.activeContexts.delete(contextId);
    }
  }

  public register(
    action: string,
    handler: KeybindHandler,
    context: string = "global",
  ): void {
    const key = `${context}:${action}`;
    this.handlers.set(key, handler);
  }

  public unregister(action: string, context: string = "global"): void {
    const key = `${context}:${action}`;
    this.handlers.delete(key);
  }

  private matchesKeybind(event: KeyEvent, keybind: Keybind): boolean {
    // Check key match
    if (event.name !== keybind.key) return false;

    // Check modifiers
    const modifiers = keybind.modifiers || [];
    const hasCtrl = modifiers.includes("ctrl");
    const hasAlt = modifiers.includes("alt");
    const hasShift = modifiers.includes("shift");
    const hasMeta = modifiers.includes("meta");

    return (
      hasCtrl === !!event.ctrl &&
      hasAlt === !!event.alt &&
      hasShift === !!event.shift &&
      hasMeta === !!event.meta
    );
  }

  public handleKeyEvent(event: KeyEvent): boolean {
    if (!this.config) return false;

    // Debug logging for arrow keys
    if (event.name && (event.name.includes('up') || event.name.includes('down') || event.name.includes('arrow'))) {
      console.log('KeybindManager: Received arrow key event:', {
        name: event.name,
        ctrl: event.ctrl,
        alt: event.alt,
        shift: event.shift,
        activeContexts: Array.from(this.activeContexts)
      });
    }

    // Sort active contexts by priority (highest first)
    const sortedContexts = Array.from(this.activeContexts).sort((a, b) => {
      const priorityA = this.contexts.get(a)?.priority || 0;
      const priorityB = this.contexts.get(b)?.priority || 0;
      return priorityB - priorityA;
    });

    // Try to find a matching keybind in active contexts
    for (const contextId of sortedContexts) {
      const keybinds = this.getKeybindsForContext(contextId);

      for (const keybind of keybinds) {
        if (!keybind.enabled && keybind.enabled !== undefined) continue;

        if (this.matchesKeybind(event, keybind)) {
          const handlerKey = `${contextId}:${keybind.action}`;
          const handler = this.handlers.get(handlerKey);

          if (handler) {
            const result = handler(event);
            // If handler returns true or undefined, stop propagation
            if (result !== false) {
              return true;
            }
          }

          // If preventDefault is true, stop propagation even if no handler
          if (keybind.preventDefault) {
            return true;
          }
        }
      }
    }

    return false;
  }

  public getKeybindsForContext(contextId: string): Keybind[] {
    if (!this.config) return [];

    if (contextId === "global") {
      return this.config.keybinds.global;
    } else if (contextId === "navigation") {
      return this.config.keybinds.navigation || [];
    } else if (contextId === "modal") {
      return this.config.keybinds.modals;
    } else if (this.config.keybinds.views[contextId]) {
      return this.config.keybinds.views[contextId];
    }

    return [];
  }

  public getKeybindsForCurrentContext(): Keybind[] {
    const allKeybinds: Keybind[] = [];

    this.activeContexts.forEach((contextId) => {
      allKeybinds.push(...this.getKeybindsForContext(contextId));
    });

    return allKeybinds;
  }

  public async saveUserOverrides(overrides: Keybind[]): Promise<void> {
    try {
      const userConfig: Partial<KeybindConfig> = {
        userOverrides: overrides,
      };

      const configDir = join(homedir(), ".kenji-engine");
      if (!existsSync(configDir)) {
        await Bun.write(join(configDir, ".gitkeep"), "");
      }

      await Bun.write(
        this.userOverridesPath,
        JSON.stringify(userConfig, null, 2),
      );

      // Reload config to apply changes
      await this.loadConfig();
    } catch (error) {
      console.error("Failed to save user keybind overrides:", error);
    }
  }

  public detectConflicts(): Map<string, Keybind[]> {
    const conflicts = new Map<string, Keybind[]>();

    this.activeContexts.forEach((contextId) => {
      const keybinds = this.getKeybindsForContext(contextId);

      keybinds.forEach((keybind) => {
        const key = this.getKeybindSignature(keybind);
        if (!conflicts.has(key)) {
          conflicts.set(key, []);
        }
        conflicts.get(key)!.push(keybind);
      });
    });

    // Filter out non-conflicts
    const actualConflicts = new Map<string, Keybind[]>();
    conflicts.forEach((bindings, key) => {
      if (bindings.length > 1) {
        actualConflicts.set(key, bindings);
      }
    });

    return actualConflicts;
  }

  private getKeybindSignature(keybind: Keybind): string {
    const modifiers = (keybind.modifiers || []).sort().join("+");
    return modifiers ? `${modifiers}+${keybind.key}` : keybind.key;
  }

  public getHelp(): Map<string, Keybind[]> {
    const help = new Map<string, Keybind[]>();

    this.activeContexts.forEach((contextId) => {
      const keybinds = this.getKeybindsForContext(contextId);
      keybinds.forEach((keybind) => {
        const category = keybind.category || "General";
        if (!help.has(category)) {
          help.set(category, []);
        }
        help.get(category)!.push(keybind);
      });
    });

    return help;
  }

  public async switchPreset(presetName: "default" | "vim" | "emacs"): Promise<void> {
    try {
      const presetPath = join(__dirname, presetName === "default" ? "config" : "presets", `${presetName}.json`);
      const presetFile = Bun.file(presetPath);
      
      if (await presetFile.exists()) {
        const presetConfig = (await presetFile.json()) as KeybindConfig;
        this.config = presetConfig;
        
        // Save preset preference
        const userConfig: Partial<KeybindConfig> = {
          preset: presetName,
          userOverrides: []
        };
        
        const configDir = join(homedir(), ".kenji-engine");
        if (!existsSync(configDir)) {
          await Bun.write(join(configDir, ".gitkeep"), "");
        }
        
        await Bun.write(
          this.userOverridesPath,
          JSON.stringify(userConfig, null, 2)
        );
        
        // Reload to apply changes
        await this.loadConfig();
      } else {
        console.error(`Preset "${presetName}" not found`);
      }
    } catch (error) {
      console.error(`Failed to switch to preset "${presetName}":`, error);
    }
  }

  public getCurrentPreset(): string {
    return this.config?.preset || "default";
  }

  public getAvailablePresets(): string[] {
    return ["default", "vim", "emacs"];
  }
}
