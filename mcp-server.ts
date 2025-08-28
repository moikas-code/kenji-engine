#!/usr/bin/env bun

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { World } from './src/ecs/world';
import { ComponentTypes } from './src/components';

const world = new World();

const server = new Server({
  name: 'kenji-engine-mcp',
  version: '1.0.0',
});

// List available tools
server.setRequestHandler('ListToolsRequest', async () => ({
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
      name: 'query_game_state',
      description: 'Query current game state information',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'What to query (entities, count, etc.)'
          }
        },
        required: ['query']
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
      name: 'control_game',
      description: 'Control game state (start, pause, reset, stop)',
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['start', 'pause', 'reset', 'stop'],
            description: 'Action to perform'
          }
        },
        required: ['action']
      }
    }
  ]
}));

// Handle tool calls
server.setRequestHandler('CallToolRequest', async (request: any) => {
  const { name, arguments: args } = request.params;
  
  try {
    switch (name) {
      case 'create_entity': {
        const entity = world.createEntity();
        
        if (args.position) {
          world.addComponent(entity, ComponentTypes.Position, args.position);
        }
        
        // Add default components based on type
        switch (args.type) {
          case 'paddle':
            world.addComponent(entity, ComponentTypes.Velocity, { vx: 0, vy: 0 });
            world.addComponent(entity, ComponentTypes.Dimensions, { width: 1, height: 5 });
            world.addComponent(entity, ComponentTypes.Sprite, { chars: '█', color: 'white' });
            world.addComponent(entity, ComponentTypes.Collider, { type: 'AABB', active: true });
            break;
          
          case 'ball':
            world.addComponent(entity, ComponentTypes.Velocity, { vx: 10, vy: 5 });
            world.addComponent(entity, ComponentTypes.Dimensions, { width: 1, height: 1 });
            world.addComponent(entity, ComponentTypes.Sprite, { chars: '●', color: 'white' });
            world.addComponent(entity, ComponentTypes.Collider, { type: 'AABB', active: true });
            break;
        }
        
        // Apply custom components
        if (args.components) {
          for (const [componentType, componentData] of Object.entries(args.components)) {
            world.addComponent(entity, componentType, componentData);
          }
        }
        
        return {
          content: [
            {
              type: 'text',
              text: `Created entity ${entity} of type ${args.type}`
            }
          ]
        };
      }
      
      case 'query_game_state': {
        let result: any = {};
        
        switch (args.query.toLowerCase()) {
          case 'entities':
            result.entityCount = world.getEntityCount();
            result.entities = world.query();
            break;
          
          case 'count':
            result.entityCount = world.getEntityCount();
            break;
          
          case 'positions':
            const positionEntities = world.query(ComponentTypes.Position);
            result.positions = positionEntities.map(entity => ({
              entity,
              position: world.getComponent(entity, ComponentTypes.Position)
            }));
            break;
          
          default:
            result.error = `Unknown query: ${args.query}`;
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
      
      case 'modify_entity': {
        const { entityId, changes } = args;
        
        for (const [componentType, componentData] of Object.entries(changes)) {
          if (componentData === null) {
            world.removeComponent(entityId, componentType);
          } else {
            const existing = world.getComponent(entityId, componentType);
            if (existing) {
              Object.assign(existing, componentData);
            } else {
              world.addComponent(entityId, componentType, componentData as any);
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
      
      case 'control_game': {
        const { action } = args;
        
        switch (action) {
          case 'reset':
            world.clear();
            break;
        }
        
        return {
          content: [
            {
              type: 'text',
              text: `Game ${action} executed`
            }
          ]
        };
      }
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }
      ],
      isError: true
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Kenji Engine MCP Server running on stdio');
}

main().catch(console.error);