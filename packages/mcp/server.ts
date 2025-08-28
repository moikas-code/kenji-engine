import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { World } from '../ecs/world';
import { ComponentTypes } from '../components';
import type { Position, Velocity, Dimensions, Sprite, Collider } from '../components';
import { z } from 'zod';

// Schema definitions for MCP tools
const CreateEntitySchema = z.object({
  type: z.string(),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
  components: z.record(z.any()).optional()
});

const ModifyEntitySchema = z.object({
  entityId: z.number(),
  changes: z.record(z.any())
});

const QueryGameStateSchema = z.object({
  query: z.string()
});

const ControlGameSchema = z.object({
  action: z.enum(['start', 'pause', 'reset', 'stop'])
});

export class MCPGameServer {
  private server: Server;
  private world: World;
  private gameState: 'stopped' | 'running' | 'paused' = 'stopped';

  constructor(world: World) {
    this.world = world;
    this.server = new Server(
      {
        name: 'kenji-engine-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupTools();
  }

  private setupTools(): void {
    // Create Entity Tool
    this.server.setRequestHandler('tools/list', async () => ({
      tools: [
        {
          name: 'create_entity',
          description: 'Create a new game entity with specified components',
          inputSchema: {
            type: 'object',
            properties: {
              type: { type: 'string', description: 'Entity type (e.g., paddle, ball, enemy)' },
              position: {
                type: 'object',
                properties: {
                  x: { type: 'number' },
                  y: { type: 'number' }
                }
              },
              components: {
                type: 'object',
                description: 'Additional components to add to the entity'
              }
            },
            required: ['type']
          }
        },
        {
          name: 'modify_entity',
          description: 'Modify components of an existing entity',
          inputSchema: {
            type: 'object',
            properties: {
              entityId: { type: 'number', description: 'ID of the entity to modify' },
              changes: {
                type: 'object',
                description: 'Component changes to apply'
              }
            },
            required: ['entityId', 'changes']
          }
        },
        {
          name: 'query_game_state',
          description: 'Query current game state information',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'What to query (entities, score, positions, etc.)'
              }
            },
            required: ['query']
          }
        },
        {
          name: 'control_game',
          description: 'Control game state (start, pause, reset, stop)',
          inputSchema: {
            type: 'object',
            properties: {
              action: {
                type: 'string',
                enum: ['start', 'pause', 'reset', 'stop']
              }
            },
            required: ['action']
          }
        }
      ]
    }));

    // Handle tool calls
    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'create_entity':
          return this.createEntity(CreateEntitySchema.parse(args));
        
        case 'modify_entity':
          return this.modifyEntity(ModifyEntitySchema.parse(args));
        
        case 'query_game_state':
          return this.queryGameState(QueryGameStateSchema.parse(args));
        
        case 'control_game':
          return this.controlGame(ControlGameSchema.parse(args));
        
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  private async createEntity(params: z.infer<typeof CreateEntitySchema>) {
    const entity = this.world.createEntity();
    
    // Add position if provided
    if (params.position) {
      this.world.addComponent(entity, ComponentTypes.Position, params.position as Position);
    }
    
    // Add default components based on type
    switch (params.type) {
      case 'paddle':
        this.world.addComponent(entity, ComponentTypes.Velocity, { vx: 0, vy: 0 } as Velocity);
        this.world.addComponent(entity, ComponentTypes.Dimensions, { width: 1, height: 5 } as Dimensions);
        this.world.addComponent(entity, ComponentTypes.Sprite, { chars: '█', color: 'white' } as Sprite);
        this.world.addComponent(entity, ComponentTypes.Collider, { type: 'AABB', active: true } as Collider);
        break;
      
      case 'ball':
        this.world.addComponent(entity, ComponentTypes.Velocity, { vx: 10, vy: 5 } as Velocity);
        this.world.addComponent(entity, ComponentTypes.Dimensions, { width: 1, height: 1 } as Dimensions);
        this.world.addComponent(entity, ComponentTypes.Sprite, { chars: '●', color: 'white' } as Sprite);
        this.world.addComponent(entity, ComponentTypes.Collider, { type: 'AABB', active: true } as Collider);
        break;
      
      case 'wall':
        this.world.addComponent(entity, ComponentTypes.Dimensions, { width: 1, height: 20 } as Dimensions);
        this.world.addComponent(entity, ComponentTypes.Sprite, { chars: '█', color: 'gray' } as Sprite);
        this.world.addComponent(entity, ComponentTypes.Collider, { type: 'AABB', active: true } as Collider);
        break;
    }
    
    // Apply any custom components
    if (params.components) {
      for (const [componentType, componentData] of Object.entries(params.components)) {
        this.world.addComponent(entity, componentType, componentData);
      }
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `Created entity ${entity} of type ${params.type}`
        }
      ]
    };
  }

  private async modifyEntity(params: z.infer<typeof ModifyEntitySchema>) {
    const { entityId, changes } = params;
    
    for (const [componentType, componentData] of Object.entries(changes)) {
      if (componentData === null) {
        this.world.removeComponent(entityId, componentType);
      } else {
        const existing = this.world.getComponent(entityId, componentType);
        if (existing) {
          Object.assign(existing, componentData);
        } else {
          this.world.addComponent(entityId, componentType, componentData);
        }
      }
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `Modified entity ${entityId} with ${Object.keys(changes).length} changes`
        }
      ]
    };
  }

  private async queryGameState(params: z.infer<typeof QueryGameStateSchema>) {
    const { query } = params;
    
    let result: any = {};
    
    switch (query.toLowerCase()) {
      case 'entities':
        result.entityCount = this.world.getEntityCount();
        result.entities = this.world.query();
        break;
      
      case 'positions':
        const positionEntities = this.world.query(ComponentTypes.Position);
        result.positions = positionEntities.map(entity => ({
          entity,
          position: this.world.getComponent(entity, ComponentTypes.Position)
        }));
        break;
      
      case 'state':
        result.gameState = this.gameState;
        result.entityCount = this.world.getEntityCount();
        break;
      
      default:
        result.error = `Unknown query: ${query}`;
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }

  private async controlGame(params: z.infer<typeof ControlGameSchema>) {
    const { action } = params;
    
    switch (action) {
      case 'start':
        this.gameState = 'running';
        break;
      case 'pause':
        this.gameState = 'paused';
        break;
      case 'stop':
        this.gameState = 'stopped';
        break;
      case 'reset':
        this.world.clear();
        this.gameState = 'stopped';
        break;
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `Game ${action} executed. Current state: ${this.gameState}`
        }
      ]
    };
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MCP Server started');
  }
}