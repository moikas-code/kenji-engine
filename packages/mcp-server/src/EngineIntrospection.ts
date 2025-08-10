import * as fs from "fs";
import * as path from "path";

export interface ComponentInfo {
  name: string;
  filePath: string;
  constructor: {
    parameters: Array<{
      name: string;
      type: string;
      defaultValue?: any;
      optional?: boolean;
    }>;
  };
  methods: Array<{
    name: string;
    parameters: Array<{ name: string; type: string }>;
    returnType: string;
  }>;
  description?: string;
}

export interface SystemInfo {
  name: string;
  filePath: string;
  requiredComponents: string[];
  description?: string;
}

export interface EngineCapabilities {
  components: ComponentInfo[];
  systems: SystemInfo[];
  gameEngineFeatures: {
    rendering: string[];
    input: string[];
    audio: string[];
    utilities: string[];
  };
  templates: string[];
  examples: Array<{
    name: string;
    description: string;
    components: string[];
    systems: string[];
  }>;
}

export class EngineIntrospection {
  private corePackagePath: string;
  private capabilities: EngineCapabilities | null = null;

  constructor(corePackagePath: string = "../core/src") {
    this.corePackagePath = path.resolve(__dirname, corePackagePath);
  }

  async getEngineCapabilities(): Promise<EngineCapabilities> {
    if (this.capabilities) {
      return this.capabilities;
    }

    this.capabilities = {
      components: await this.introspectComponents(),
      systems: await this.introspectSystems(),
      gameEngineFeatures: await this.introspectGameEngineFeatures(),
      templates: ["empty", "pong", "breakout", "platformer"],
      examples: await this.getGameExamples(),
    };

    return this.capabilities;
  }

  private async introspectComponents(): Promise<ComponentInfo[]> {
    const componentsPath = path.join(this.corePackagePath, "components");
    const components: ComponentInfo[] = [];

    try {
      const files = fs.readdirSync(componentsPath);

      for (const file of files) {
        if (file.endsWith(".ts") && file !== "index.ts") {
          const componentInfo = await this.parseComponentFile(
            path.join(componentsPath, file)
          );
          if (componentInfo) {
            components.push(componentInfo);
          }
        }
      }
    } catch (error) {
      console.error("Error introspecting components:", error);
    }

    return components;
  }

  private async introspectSystems(): Promise<SystemInfo[]> {
    const systemsPath = path.join(this.corePackagePath, "systems");
    const systems: SystemInfo[] = [];

    try {
      const files = fs.readdirSync(systemsPath);

      for (const file of files) {
        if (
          file.endsWith(".ts") &&
          file !== "index.ts" &&
          !file.includes("test")
        ) {
          const systemInfo = await this.parseSystemFile(
            path.join(systemsPath, file)
          );
          if (systemInfo) {
            systems.push(systemInfo);
          }
        }
      }
    } catch (error) {
      console.error("Error introspecting systems:", error);
    }

    return systems;
  }

  private async parseComponentFile(
    filePath: string
  ): Promise<ComponentInfo | null> {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const fileName = path.basename(filePath, ".ts");

      // Basic parsing - in a real implementation, you'd use TypeScript compiler API
      const constructorMatch = content.match(/constructor\s*\(([\s\S]*?)\)/);
      const parameters: ComponentInfo["constructor"]["parameters"] = [];

      if (constructorMatch) {
        const paramString = constructorMatch[1];
        const paramMatches = paramString.match(
          /(\w+):\s*(\w+)(?:\s*=\s*([^,\)]+))?/g
        );

        if (paramMatches) {
          for (const param of paramMatches) {
            const match = param.match(/(\w+):\s*(\w+)(?:\s*=\s*([^,\)]+))?/);
            if (match) {
              parameters.push({
                name: match[1],
                type: match[2],
                defaultValue: match[3]?.trim(),
                optional: !!match[3],
              });
            }
          }
        }
      }

      // Extract methods
      const methodMatches = content.match(
        /(\w+)\s*\([^)]*\):\s*(\w+|\w+\[\]|this|void)/g
      );
      const methods: ComponentInfo["methods"] = [];

      if (methodMatches) {
        for (const methodMatch of methodMatches) {
          const match = methodMatch.match(
            /(\w+)\s*\(([^)]*)\):\s*(\w+|\w+\[\]|this|void)/
          );
          if (match && match[1] !== "constructor") {
            const methodParams = match[2]
              ? match[2].split(",").map((p) => {
                  const paramMatch = p.trim().match(/(\w+):\s*(\w+)/);
                  return paramMatch
                    ? { name: paramMatch[1], type: paramMatch[2] }
                    : { name: p.trim(), type: "any" };
                })
              : [];

            methods.push({
              name: match[1],
              parameters: methodParams,
              returnType: match[3],
            });
          }
        }
      }

      return {
        name: fileName,
        filePath: filePath,
        constructor: { parameters },
        methods,
        description: this.extractDescription(content),
      };
    } catch (error) {
      console.error(`Error parsing component file ${filePath}:`, error);
      return null;
    }
  }

  private async parseSystemFile(filePath: string): Promise<SystemInfo | null> {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const fileName = path.basename(filePath, ".ts");

      // Extract required components from getEntitiesWith calls
      const componentMatches = content.match(
        /getEntitiesWith\s*\(\s*([^)]+)\s*\)/g
      );
      const requiredComponents: string[] = [];

      if (componentMatches) {
        for (const match of componentMatches) {
          const componentsMatch = match.match(
            /getEntitiesWith\s*\(\s*([^)]+)\s*\)/
          );
          if (componentsMatch) {
            const components = componentsMatch[1]
              .split(",")
              .map((c) => c.trim());
            requiredComponents.push(...components);
          }
        }
      }

      return {
        name: fileName,
        filePath: filePath,
        requiredComponents: [...new Set(requiredComponents)], // Remove duplicates
        description: this.extractDescription(content),
      };
    } catch (error) {
      console.error(`Error parsing system file ${filePath}:`, error);
      return null;
    }
  }

  private async introspectGameEngineFeatures(): Promise<
    EngineCapabilities["gameEngineFeatures"]
  > {
    return {
      rendering: ["Canvas2DRenderer", "IRenderer", "RenderSystem"],
      input: ["InputManager", "UIInputSystem"],
      audio: ["AudioManager"],
      utilities: ["AssetManager", "World", "Entity", "Component", "System"],
    };
  }

  private async getGameExamples(): Promise<EngineCapabilities["examples"]> {
    return [
      {
        name: "Pong",
        description: "Classic Pong game with two paddles and a ball",
        components: ["Transform2D", "Velocity2D", "Sprite2D", "Collider2D"],
        systems: [
          "MovementSystem",
          "CollisionSystem",
          "RenderSystem",
          "BoundarySystem",
        ],
      },
      {
        name: "Breakout",
        description:
          "Brick-breaking game with paddle, ball, and destructible bricks",
        components: [
          "Transform2D",
          "Velocity2D",
          "Sprite2D",
          "Collider2D",
          "GameState",
        ],
        systems: [
          "MovementSystem",
          "BrickCollisionSystem",
          "PaddleCollisionSystem",
          "GameStateSystem",
        ],
      },
      {
        name: "Platformer",
        description:
          "Side-scrolling platformer with player character and obstacles",
        components: ["Transform2D", "Velocity2D", "Sprite2D", "Collider2D"],
        systems: ["MovementSystem", "CollisionSystem", "RenderSystem"],
      },
    ];
  }

  private extractDescription(content: string): string | undefined {
    // Extract JSDoc comments or first comment block
    const commentMatch = content.match(/\/\*\*([\s\S]*?)\*\//);
    if (commentMatch) {
      return commentMatch[1]
        .split("\n")
        .map((line) => line.replace(/^\s*\*\s?/, "").trim())
        .filter((line) => line.length > 0)
        .join(" ");
    }
    return undefined;
  }

  // Helper method to suggest components for a given game type
  suggestComponentsForGameType(gameType: string): string[] {
    const suggestions: Record<string, string[]> = {
      pong: ["Transform2D", "Velocity2D", "Sprite2D", "Collider2D"],
      breakout: [
        "Transform2D",
        "Velocity2D",
        "Sprite2D",
        "Collider2D",
        "GameState",
      ],
      platformer: ["Transform2D", "Velocity2D", "Sprite2D", "Collider2D"],
      shooter: ["Transform2D", "Velocity2D", "Sprite2D", "Collider2D"],
      puzzle: ["Transform2D", "Sprite2D", "UIText", "UIButton"],
      rpg: ["Transform2D", "Sprite2D", "GameState", "UIText", "UIPanel"],
    };

    return suggestions[gameType.toLowerCase()] || ["Transform2D", "Sprite2D"];
  }

  // Helper method to suggest systems for a given game type
  suggestSystemsForGameType(gameType: string): string[] {
    const suggestions: Record<string, string[]> = {
      pong: [
        "MovementSystem",
        "CollisionSystem",
        "RenderSystem",
        "BoundarySystem",
      ],
      breakout: [
        "MovementSystem",
        "BrickCollisionSystem",
        "PaddleCollisionSystem",
        "GameStateSystem",
        "RenderSystem",
      ],
      platformer: ["MovementSystem", "CollisionSystem", "RenderSystem"],
      shooter: ["MovementSystem", "CollisionSystem", "RenderSystem"],
      puzzle: ["UIInputSystem", "UIRenderSystem", "GameStateSystem"],
      rpg: [
        "MovementSystem",
        "RenderSystem",
        "UIRenderSystem",
        "GameStateSystem",
      ],
    };

    return suggestions[gameType.toLowerCase()] || ["RenderSystem"];
  }
}
