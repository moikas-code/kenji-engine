import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { GameProjectManager } from "./GameProjectManager.js";
import { EngineIntrospection } from "./EngineIntrospection.js";

const server = new Server(
  {
    name: "kenji-game-engine-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool: Create new game project
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "create_game_project",
        description:
          "Create a new game project that uses the Kenji game engine",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Game project name (e.g., 'my-pong-game')",
            },
            path: {
              type: "string",
              description: "Project directory path",
              default: "./",
            },
            template: {
              type: "string",
              enum: ["empty", "pong", "breakout", "platformer"],
              description: "Starting template",
              default: "empty",
            },
            type: {
              type: "string",
              enum: ["2d", "3d"],
              description: "Game rendering mode",
              default: "2d",
            },
          },
          required: ["name"],
        },
      },
      {
        name: "generate_sprites_for_project",
        description: "Generate pixel art sprites for a game project",
        inputSchema: {
          type: "object",
          properties: {
            projectPath: {
              type: "string",
              description: "Path to game project directory",
            },
            sprites: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                    enum: [
                      "paddle",
                      "ball",
                      "brick",
                      "player",
                      "enemy",
                      "projectile",
                      "powerup",
                    ],
                  },
                  width: { type: "number", default: 32 },
                  height: { type: "number", default: 32 },
                  colors: {
                    type: "array",
                    items: { type: "string" },
                    default: ["#FFFFFF"],
                  },
                  style: {
                    type: "string",
                    enum: ["retro", "modern", "minimalist"],
                    default: "retro",
                  },
                  name: {
                    type: "string",
                    description: "Asset filename (without extension)",
                  },
                },
                required: ["type"],
              },
            },
          },
          required: ["projectPath", "sprites"],
        },
      },
      {
        name: "add_entity_to_project",
        description:
          "Generate code to add an entity with components to a game project",
        inputSchema: {
          type: "object",
          properties: {
            projectPath: {
              type: "string",
              description: "Path to game project",
            },
            entityName: {
              type: "string",
              description: "Entity variable name (e.g., 'player', 'enemy1')",
            },
            components: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                    description:
                      "Component type (Transform2D, Velocity2D, etc.)",
                  },
                  properties: {
                    type: "object",
                    description: "Component constructor properties",
                  },
                },
                required: ["type"],
              },
            },
            addToMain: {
              type: "boolean",
              description: "Add entity creation code to main.ts",
              default: true,
            },
          },
          required: ["projectPath", "entityName", "components"],
        },
      },
      {
        name: "build_project",
        description: "Build a game project for deployment",
        inputSchema: {
          type: "object",
          properties: {
            projectPath: {
              type: "string",
              description: "Path to game project",
            },
            target: { type: "string", enum: ["web", "itch"], default: "web" },
            minify: { type: "boolean", default: true },
            outputDir: { type: "string", default: "dist" },
          },
          required: ["projectPath"],
        },
      },
      {
        name: "get_engine_capabilities",
        description:
          "Get comprehensive information about available engine components, systems, and features (LSP-style introspection)",
        inputSchema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              enum: ["all", "components", "systems", "features", "examples"],
              description: "Category of information to retrieve",
              default: "all",
            },
          },
        },
      },
      {
        name: "suggest_architecture",
        description:
          "Get intelligent suggestions for game architecture based on game type and requirements",
        inputSchema: {
          type: "object",
          properties: {
            gameType: {
              type: "string",
              description:
                "Type of game (e.g., 'pong', 'breakout', 'platformer', 'shooter')",
            },
            requirements: {
              type: "array",
              items: { type: "string" },
              description:
                "Specific game requirements (e.g., 'multiplayer', 'AI opponent', 'power-ups')",
            },
          },
          required: ["gameType"],
        },
      },
      {
        name: "validate_entity_design",
        description:
          "Validate an entity design against engine capabilities and suggest improvements",
        inputSchema: {
          type: "object",
          properties: {
            entityName: {
              type: "string",
              description: "Name of the entity to validate",
            },
            components: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  properties: { type: "object" },
                },
              },
              description: "Components to validate",
            },
            gameContext: {
              type: "string",
              description:
                "Game context for validation (e.g., 'pong', 'breakout')",
            },
          },
          required: ["entityName", "components"],
        },
      },
    ],
  };
});

// Tool implementations
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "create_game_project":
        return await handleCreateGameProject(args);
      case "generate_sprites_for_project":
        return await handleGenerateSpritesForProject(args);
      case "add_entity_to_project":
        return await handleAddEntityToProject(args);
      case "build_project":
        return await handleBuildProject(args);
      case "get_engine_capabilities":
        return await handleGetEngineCapabilities(args);
      case "suggest_architecture":
        return await handleSuggestArchitecture(args);
      case "validate_entity_design":
        return await handleValidateEntityDesign(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    };
  }
});

// Tool handler implementations
async function handleCreateGameProject(args: any) {
  const projectManager = new GameProjectManager();
  const result = await projectManager.createProject({
    name: args.name,
    path: args.path || "./game-projects/",
    template: args.template || "empty",
    type: args.type || "2d",
  });

  return {
    content: [
      {
        type: "text",
        text: `Created game project "${args.name}" at ${
          result.path
        }\n\nNext steps:\n1. cd ${
          result.path
        }\n2. bun install\n3. bun run dev\n\nProject structure:\n${JSON.stringify(
          result.structure,
          null,
          2
        )}`,
      },
    ],
  };
}

async function handleGenerateSpritesForProject(args: any) {
  return {
    content: [
      {
        type: "text",
        text: `Sprite generation not yet implemented. Would generate ${args.sprites.length} sprites for project at ${args.projectPath}`,
      },
    ],
  };
}

async function handleAddEntityToProject(args: any) {
  const entityCode = generateEntityCode(args.entityName, args.components);

  return {
    content: [
      {
        type: "text",
        text: `Generated entity code for "${args.entityName}":\n\n\`\`\`typescript\n${entityCode}\n\`\`\``,
      },
    ],
  };
}

async function handleBuildProject(args: any) {
  return {
    content: [
      {
        type: "text",
        text: `Build functionality not yet implemented. Would build project at ${args.projectPath} for ${args.target}`,
      },
    ],
  };
}

function generateEntityCode(entityName: string, components: any[]): string {
  const componentImports = components.map((c) => c.type).join(", ");
  const componentCreation = components
    .map((c) => {
      const props = c.properties
        ? Object.entries(c.properties)
            .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
            .join(", ")
        : "";
      return `.addComponent(new ${c.type}(${props}))`;
    })
    .join("\n    ");

  return `// Import required components
import { Entity, ${componentImports} } from '@kenji-ge/core';

// Create ${entityName} entity
const ${entityName} = new Entity()${
    componentCreation ? "\n    " + componentCreation : ""
  };

// Add entity to world
engine.world.addEntity(${entityName});`;
}

// Initialize engine introspection
const engineIntrospection = new EngineIntrospection();

async function handleGetEngineCapabilities(args: any) {
  const capabilities = await engineIntrospection.getEngineCapabilities();

  let result = "";

  switch (args.category || "all") {
    case "components":
      result = `# Available Components\n\n${capabilities.components
        .map(
          (comp) =>
            `## ${comp.name}\n` +
            `**Constructor Parameters:**\n${comp.constructor.parameters
              .map(
                (p) =>
                  `- ${p.name}: ${p.type}${p.optional ? " (optional)" : ""}${
                    p.defaultValue ? ` = ${p.defaultValue}` : ""
                  }`
              )
              .join("\n")}\n` +
            `**Methods:**\n${comp.methods
              .map(
                (m) =>
                  `- ${m.name}(${m.parameters
                    .map((p) => `${p.name}: ${p.type}`)
                    .join(", ")}): ${m.returnType}`
              )
              .join("\n")}\n` +
            (comp.description ? `**Description:** ${comp.description}\n` : "")
        )
        .join("\n")}`;
      break;

    case "systems":
      result = `# Available Systems\n\n${capabilities.systems
        .map(
          (sys) =>
            `## ${sys.name}\n` +
            `**Required Components:** ${sys.requiredComponents.join(", ")}\n` +
            (sys.description ? `**Description:** ${sys.description}\n` : "")
        )
        .join("\n")}`;
      break;

    case "features":
      result =
        `# Engine Features\n\n` +
        `**Rendering:** ${capabilities.gameEngineFeatures.rendering.join(
          ", "
        )}\n` +
        `**Input:** ${capabilities.gameEngineFeatures.input.join(", ")}\n` +
        `**Audio:** ${capabilities.gameEngineFeatures.audio.join(", ")}\n` +
        `**Utilities:** ${capabilities.gameEngineFeatures.utilities.join(
          ", "
        )}\n`;
      break;

    case "examples":
      result = `# Game Examples\n\n${capabilities.examples
        .map(
          (ex) =>
            `## ${ex.name}\n` +
            `**Description:** ${ex.description}\n` +
            `**Components:** ${ex.components.join(", ")}\n` +
            `**Systems:** ${ex.systems.join(", ")}\n`
        )
        .join("\n")}`;
      break;

    default:
      result =
        `# Kenji Game Engine Capabilities\n\n` +
        `## Components (${
          capabilities.components.length
        })\n${capabilities.components
          .map((c) => `- ${c.name}`)
          .join("\n")}\n\n` +
        `## Systems (${capabilities.systems.length})\n${capabilities.systems
          .map((s) => `- ${s.name}`)
          .join("\n")}\n\n` +
        `## Templates\n${capabilities.templates
          .map((t) => `- ${t}`)
          .join("\n")}\n\n` +
        `## Example Games\n${capabilities.examples
          .map((e) => `- ${e.name}: ${e.description}`)
          .join("\n")}`;
  }

  return {
    content: [
      {
        type: "text",
        text: result,
      },
    ],
  };
}

async function handleSuggestArchitecture(args: any) {
  const capabilities = await engineIntrospection.getEngineCapabilities();
  const suggestedComponents = engineIntrospection.suggestComponentsForGameType(
    args.gameType
  );
  const suggestedSystems = engineIntrospection.suggestSystemsForGameType(
    args.gameType
  );

  let result = `# Architecture Suggestions for ${args.gameType.toUpperCase()}\n\n`;

  result += `## Recommended Components\n${suggestedComponents
    .map((comp) => {
      const componentInfo = capabilities.components.find(
        (c) => c.name === comp
      );
      return `- **${comp}**${
        componentInfo
          ? `: ${componentInfo.description || "Core component"}`
          : ""
      }`;
    })
    .join("\n")}\n\n`;

  result += `## Recommended Systems\n${suggestedSystems
    .map((sys) => {
      const systemInfo = capabilities.systems.find((s) => s.name === sys);
      return `- **${sys}**${
        systemInfo ? `: ${systemInfo.description || "Core system"}` : ""
      }`;
    })
    .join("\n")}\n\n`;

  if (args.requirements && args.requirements.length > 0) {
    result += `## Additional Considerations for Requirements\n`;
    for (const req of args.requirements) {
      switch (req.toLowerCase()) {
        case "ai opponent":
          result += `- **AI Opponent**: Consider adding custom AI system that extends MovementSystem\n`;
          break;
        case "multiplayer":
          result += `- **Multiplayer**: Add network components and synchronization systems\n`;
          break;
        case "power-ups":
          result += `- **Power-ups**: Add PowerUp component and PowerUpSystem for collection logic\n`;
          break;
        case "sound":
          result += `- **Sound**: Use AudioManager for sound effects and background music\n`;
          break;
        case "ui":
          result += `- **UI**: Use UIText, UIButton, UIPanel components with UIRenderSystem and UIInputSystem\n`;
          break;
        default:
          result += `- **${req}**: Custom implementation may be required\n`;
      }
    }
  }

  result += `\n## Sample Entity Creation\n\`\`\`typescript\n`;
  result += `// Example entity for ${args.gameType}\n`;
  result += `const entity = new Entity()\n`;
  for (const comp of suggestedComponents) {
    const componentInfo = capabilities.components.find((c) => c.name === comp);
    if (componentInfo) {
      const params = componentInfo.constructor.parameters
        .map((p) =>
          p.defaultValue !== undefined ? "" : `/* ${p.name}: ${p.type} */`
        )
        .filter((p) => p)
        .join(", ");
      result += `  .addComponent(new ${comp}(${params}))\n`;
    }
  }
  result += `;\n\`\`\``;

  return {
    content: [
      {
        type: "text",
        text: result,
      },
    ],
  };
}

async function handleValidateEntityDesign(args: any) {
  const capabilities = await engineIntrospection.getEngineCapabilities();
  let result = `# Entity Design Validation: ${args.entityName}\n\n`;

  const issues: string[] = [];
  const suggestions: string[] = [];

  // Validate each component
  for (const component of args.components) {
    const componentInfo = capabilities.components.find(
      (c) => c.name === component.type
    );

    if (!componentInfo) {
      issues.push(`❌ Component "${component.type}" not found in engine`);
      continue;
    }

    // Validate component properties
    if (component.properties) {
      const requiredParams = componentInfo.constructor.parameters.filter(
        (p) => !p.optional
      );
      const providedProps = Object.keys(component.properties);

      for (const param of requiredParams) {
        if (!providedProps.includes(param.name)) {
          issues.push(
            `⚠️ Missing required parameter "${param.name}" for ${component.type}`
          );
        }
      }
    }
  }

  // Suggest missing common components based on game context
  if (args.gameContext) {
    const recommendedComponents =
      engineIntrospection.suggestComponentsForGameType(args.gameContext);
    const currentComponents = args.components.map((c: any) => c.type);

    for (const recommended of recommendedComponents) {
      if (!currentComponents.includes(recommended)) {
        suggestions.push(
          `💡 Consider adding ${recommended} component for ${args.gameContext} games`
        );
      }
    }
  }

  // Check for common component combinations
  const componentTypes = args.components.map((c: any) => c.type);
  if (
    componentTypes.includes("Velocity2D") &&
    !componentTypes.includes("Transform2D")
  ) {
    issues.push(`❌ Velocity2D requires Transform2D component`);
  }
  if (
    componentTypes.includes("Collider2D") &&
    !componentTypes.includes("Transform2D")
  ) {
    issues.push(`❌ Collider2D requires Transform2D component`);
  }
  if (
    componentTypes.includes("Sprite2D") &&
    !componentTypes.includes("Transform2D")
  ) {
    issues.push(`❌ Sprite2D requires Transform2D component`);
  }

  result += `## Validation Results\n`;
  if (issues.length === 0) {
    result += `✅ Entity design looks good!\n\n`;
  } else {
    result += `### Issues Found\n${issues.join("\n")}\n\n`;
  }

  if (suggestions.length > 0) {
    result += `### Suggestions\n${suggestions.join("\n")}\n\n`;
  }

  result += `## Component Details\n`;
  for (const component of args.components) {
    const componentInfo = capabilities.components.find(
      (c) => c.name === component.type
    );
    if (componentInfo) {
      result += `### ${component.type}\n`;
      result += `**Parameters:** ${componentInfo.constructor.parameters
        .map((p) => `${p.name}: ${p.type}${p.optional ? " (optional)" : ""}`)
        .join(", ")}\n`;
      if (componentInfo.description) {
        result += `**Description:** ${componentInfo.description}\n`;
      }
      result += "\n";
    }
  }

  return {
    content: [
      {
        type: "text",
        text: result,
      },
    ],
  };
}

// Start the MCP server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Kenji Game Engine MCP Server running");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
