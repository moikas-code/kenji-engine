#!/usr/bin/env bun

import { parseArgs } from 'util';
import { GameProjectManager } from '@kenji-engine/mcp-server/src/GameProjectManager';

const args = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    help: { type: 'boolean', short: 'h' },
    version: { type: 'boolean', short: 'v' },
    template: { type: 'string', short: 't', default: 'empty' },
    type: { type: 'string', default: '2d' },
    path: { type: 'string', short: 'p', default: './' }
  },
  allowPositionals: true
});

const command = args.positionals[0];
const projectName = args.positionals[1];

async function main() {
  if (args.values.help || !command) {
    showHelp();
    return;
  }

  if (args.values.version) {
    console.log('kenji-engine-cli v1.0.0');
    return;
  }

  switch (command) {
    case 'create':
      await createProject(projectName, args.values);
      break;
    case 'build':
      await buildProject(projectName);
      break;
    case 'deploy':
      await deployProject(projectName);
      break;
    default:
      console.error(`Unknown command: ${command}`);
      showHelp();
  }
}

async function createProject(name: string, options: any) {
  if (!name) {
    console.error('Project name is required');
    console.log('Usage: kenji-engine create <project-name>');
    return;
  }

  console.log(`🎮 Creating game project: ${name}`);
  
  const projectManager = new GameProjectManager();
  
  try {
    const result = await projectManager.createProject({
      name,
      path: options.path,
      template: options.template,
      type: options.type
    });

    console.log(`✅ Created ${name} at ${result.path}`);
    console.log('\\nNext steps:');
    console.log(`  cd ${name}`);
    console.log('  bun install');
    console.log('  bun run dev');
    console.log('\\nStart AI-assisted development:');
    console.log('  kuuzuki');
    
  } catch (error) {
    console.error('❌ Failed to create project:', error);
  }
}

async function buildProject(name: string) {
  console.log(`🔨 Building project: ${name}`);
  console.log('Build functionality not yet implemented');
}

async function deployProject(name: string) {
  console.log(`🚀 Deploying project: ${name}`);
  console.log('Deploy functionality not yet implemented');
}

function showHelp() {
  console.log(`🎮 Kuuzuki Game Engine CLI

Usage:
  kenji-engine <command> [options]

Commands:
  create <name>     Create a new game project
  build <name>      Build a game project  
  deploy <name>     Deploy a game project to itch.io

Options:
  -t, --template    Project template (empty, pong, breakout, platformer)
  --type           Game type (2d, 3d)
  -p, --path       Project directory path
  -h, --help       Show this help
  -v, --version    Show version

Examples:
  kenji-engine create my-pong-game -t pong
  kenji-engine create my-3d-game --type 3d
  kenji-engine build my-pong-game
  kenji-engine deploy my-pong-game
  `);
}

main().catch(console.error);