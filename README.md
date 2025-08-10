# 🎮 Kenji Engine

**The first AI-native game engine.** Build games with natural language, generate assets with AI, deploy with one command.

Kenji Engine is Kuuzuki's gaming brother - a complete game engine with built-in MCP server that enables AI-assisted game development. Create games using natural language, generate pixel art assets with AI, and deploy to itch.io automatically.

## Features

### 🎮 Core Game Engine

- **Entity Component System (ECS)** - Flexible architecture for game objects
- **Built-in Components** - Transform2D, Velocity2D, Sprite2D, Collider2D
- **Built-in Systems** - Movement, Rendering, Collision Detection
- **Canvas2D Renderer** - Pixel-perfect 2D rendering
- **Input Management** - Keyboard and mouse input handling
- **Audio System** - Web Audio API integration
- **Asset Management** - Image and canvas asset loading

### 🎨 Pixel Art Generation

- **Procedural Sprites** - Generate game assets on-demand
- **Multiple Styles** - Retro, modern, and minimalist styles
- **Game-Specific Generators** - Pong, Breakout, and more
- **Zero Asset Requirement** - No need for external art assets

### 🤖 AI-Native Development

- **Built-in MCP Server** - Direct integration with Kuuzuki AI assistant
- **Natural Language Coding** - "Make the ball faster", "Add particle effects"
- **AI Asset Generation** - Generate sprites, sounds, and animations with AI
- **Intelligent Code Generation** - AI creates game systems, components, and logic
- **Smart Deployment** - AI handles itch.io publishing and optimization

### 🛠️ Development Tools

- **CLI Tool** - Command-line interface for project management
- **Bun Runtime** - 10-100x faster builds and toolchain
- **TypeScript** - Strict typing and modern ES modules
- **Hot Reloading** - Fast development iteration

### 🚀 Deployment

- **Butler Integration** - Automated itch.io deployment
- **Web Export** - HTML5 game packaging
- **Build Pipeline** - Optimized production builds

## 🤖 What Makes Kenji Different?

### **First AI-Native Game Engine**

Unlike traditional engines (Unity, Godot, Phaser), Kenji Engine is built from the ground up for AI-assisted development:

- **Natural Language Programming**: "Make the ball faster", "Add particle effects"
- **Built-in MCP Server**: Direct integration with Kuuzuki AI assistant
- **AI Asset Generation**: Generate sprites, sounds, and animations with AI
- **Intelligent Code Generation**: AI creates game systems and components
- **Smart Deployment**: AI handles optimization and publishing

### **Perfect for Modern Developers**

- **100% TypeScript**: Type-safe game development
- **Bun-Powered**: Lightning-fast builds and runtime
- **ECS Architecture**: Scalable, maintainable game code
- **Zero Configuration**: Works out of the box

### **AI-Assisted Workflow**

```bash
# Traditional game development
1. Write code manually
2. Create assets in external tools
3. Debug and test manually
4. Deploy manually

# Kenji Engine + Kuuzuki workflow
1. "Create a Pong game"           # AI generates complete game
2. "Make the paddles glow"        # AI adds visual effects
3. "Add sound effects"           # AI generates and integrates audio
4. "Deploy to itch.io"           # AI handles publishing
```

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) - JavaScript runtime and package manager
- [Kuuzuki](https://kuuzuki.com) - AI assistant for enhanced development experience

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url> kenji-ge
   cd kenji-ge
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Build all packages:**

   ```bash
   bun run build
   ```

4. **Install CLI tools globally with bun link:**

   **Option A: Automated setup (recommended):**

   ```bash
   # Run the setup script
   ./scripts/setup-global.sh
   ```

   This builds all packages and links all commands automatically.

   **Option B: Manual setup - main command only:**

   ```bash
   # From the root directory
   bun run build:packages
   bun link
   ```

   This gives you the `kenji-engine` command with the interactive menu.

   **Option C: Manual setup - individual tools:**

   ```bash
   # Build packages first
   bun run build:packages

   # Install the TUI editor (includes interactive menu)
   cd packages/tui-editor && bun link && cd ../..

   # Install the basic CLI
   cd packages/cli && bun link && cd ../..
   ```

   This gives you the `kuuzuki-ge` command with the interactive menu.

   **Option B: Install individual CLI tools:**

   ```bash
   # Install the TUI editor (includes interactive menu)
   cd packages/tui-editor
   bun link

   # Install the basic CLI
   cd ../cli
   bun link
   ```

   This gives you `kuuzuki-editor` and `kuuzuki-ge` commands.

   **Option C: Install all tools:**

   ```bash
   # Install main command
   bun link

   # Install TUI editor
   cd packages/tui-editor && bun link && cd ../..

   # Install basic CLI
   cd packages/cli && bun link && cd ../..
   ```

   This gives you the `kuuzuki` command with the interactive menu.

   **Option B: Install individual CLI tools:**

   ```bash
   # Install the TUI editor (includes interactive menu)
   cd packages/tui-editor
   bun link

   # Install the basic CLI
   cd ../cli
   bun link
   ```

   This gives you `kuuzuki-editor` and `kuuzuki-ge` commands.

   **Option C: Install all tools:**

   ```bash
   # Install main command
   bun link

   # Install TUI editor
   cd packages/tui-editor && bun link && cd ../..

   # Install basic CLI
   cd packages/cli && bun link && cd ../..
   ```

### Interactive Menu

After linking, you can use the interactive menu from anywhere:

```bash
kenji-ge
```

This will show you a beautiful menu with options to:

- 🆕 **Create New Project** - Interactive project creation with templates
- 🎯 **Open TUI Editor** - Launch the terminal-based visual editor
- 🔨 **Build Project** - Compile your game for production
- 🚀 **Deploy Project** - Deploy to itch.io
- ❓ **Show Help** - View all available commands

The menu automatically detects existing game projects in your current directory and provides contextual options.

### Available Commands After Linking

Once you've run `bun link`, you'll have these commands available globally:

**Main Command:**

- `kenji-ge` - Interactive menu (recommended)

**TUI Editor Commands:**

- `kenji-editor` - TUI editor with interactive menu
- `kenji-editor create <name>` - Create new project
- `kenji-editor start` - Launch TUI editor
- `kenji-editor build` - Build project
- `kenji-editor deploy` - Deploy to itch.io

**Note:** The basic CLI also provides `kuuzuki-ge` commands, but the main interactive version is recommended for the best experience.

### Create Your First Game

1. **Create a new Pong game:**

   ```bash
   kenji-ge create my-pong-game --template pong
   cd my-pong-game
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Start development:**

   ```bash
   bun run dev
   ```

4. **Open in browser:**
   Open `index.html` in your browser to see your game!

### AI-Assisted Development with Kuuzuki

1. **Start Kenji's MCP server and connect Kuuzuki:**

   ```bash
   cd my-pong-game
   kenji mcp  # Start MCP server
   kuuzuki    # Connect AI assistant to Kenji
   ```

2. **Use natural language commands:**
   - "Generate pixel art sprites for paddles and ball"
   - "Make the ball move faster when it hits a paddle"
   - "Add particle effects when the ball hits something"
   - "Create a power-up system"
   - "Deploy the game to itch.io"

## Project Structure

```
kenji-ge/
├── packages/
│   ├── core/                    # ECS engine core
│   │   ├── src/
│   │   │   ├── ecs/             # Entity, Component, System, World
│   │   │   ├── rendering/       # Canvas2D renderer
│   │   │   ├── input/           # Input management
│   │   │   ├── audio/           # Audio system
│   │   │   ├── components/      # Built-in components
│   │   │   ├── systems/         # Built-in systems
│   │   │   └── utils/           # Utilities
│   │   └── package.json
│   ├── pixel-art-generator/     # Asset generation
│   │   ├── src/
│   │   │   ├── generators/      # Game-specific generators
│   │   │   └── PixelArtGenerator.ts
│   │   └── package.json
│   ├── mcp-server/             # AI integration
│   │   ├── src/
│   │   │   ├── server.ts        # MCP server
│   │   │   └── GameProjectManager.ts
│   │   └── package.json
│   ├── butler-deploy/          # Deployment tools
│   │   └── src/
│   └── cli/                    # Command line tool
│       └── src/
├── package.json                # Workspace configuration
├── bunfig.toml                 # Bun configuration
└── .mcp.json                   # MCP server config
```

## Game Templates

### Empty Template

Basic game setup with engine initialization.

### Pong Template

Classic Pong game with:

- Two paddles
- Ball with physics
- Generated pixel art assets

### Breakout Template (Coming Soon)

Breakout game with:

- Paddle and ball
- Destructible bricks
- Power-ups

## API Reference

### Core Classes

#### GameEngine

```typescript
const engine = new GameEngine({
  canvas: HTMLCanvasElement,
  mode: "2d" | "3d",
  targetFPS: number,
  debug: boolean,
});

await engine.initialize();
engine.start();
```

#### Entity

```typescript
const entity = new Entity()
  .addComponent(new Transform2D(x, y))
  .addComponent(new Velocity2D(vx, vy))
  .addComponent(new Sprite2D(texture));

engine.world.addEntity(entity);
```

#### PixelArtGenerator

```typescript
const generator = new PixelArtGenerator();
const sprite = await generator.generateSprite({
  type: "paddle",
  width: 32,
  height: 8,
  colors: ["#FFFFFF"],
  style: "retro",
});
```

## Development

### Building

```bash
bun run build          # Build all packages
bun run dev            # Watch mode for development
bun run clean          # Clean build artifacts
```

### Testing

```bash
bun test               # Run tests
```

### MCP Server

```bash
bun run mcp            # Start MCP server for AI integration
```

## Deployment

### Build for Web

```bash
kenji-ge build my-game --target web
```

### Deploy to Itch.io

```bash
kenji-ge deploy my-game --itch-user username --itch-game game-slug
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Roadmap

### Phase 1 (Current)

- ✅ Core ECS engine
- ✅ 2D rendering with Canvas2D
- ✅ Pixel art generation
- ✅ MCP server integration
- ✅ CLI tool
- ✅ Pong template

### Phase 2 - Enhanced AI Features

- [ ] Advanced AI code generation (complete game systems)
- [ ] AI-powered debugging and optimization
- [ ] Natural language asset modification
- [ ] AI-generated sound effects and music
- [ ] Breakout and Platformer templates
- [ ] Community AI model integration

### Phase 3 - Advanced Engine Features

- [ ] 3D rendering with Three.js + AI assistance
- [ ] Multiplayer networking with AI matchmaking
- [ ] Visual editor with AI suggestions
- [ ] Performance optimization with AI analysis
- [ ] Cross-platform deployment (mobile, desktop)
- [ ] AI-powered game balancing and testing

## 🌟 The Kenji Ecosystem

**Kenji** is part of the larger Kuuzuki AI development ecosystem:

- **[Kuuzuki](https://kuuzuki.com)** - AI assistant for development
- **[Kenji](https://github.com/moikas-code/kenji-ge)** - AI-native game engine
- **MCP Integration** - Seamless AI-assisted development
- **Community Templates** - AI-generated game templates and assets

### **Why Choose Kenji?**

| Traditional Engines  | Kenji Game Engine          |
| -------------------- | -------------------------- |
| Manual coding        | AI-assisted development    |
| External asset tools | Built-in AI generation     |
| Complex setup        | Zero configuration         |
| Steep learning curve | Natural language interface |
| Manual deployment    | One-command publishing     |

## Support & Community

- 📖 [Documentation](https://kuuzuki.com/docs/kenji)
- 💬 [Discord Community](https://discord.gg/kuuzuki)
- 🐛 [Issue Tracker](https://github.com/moikas-code/kenji-ge/issues)
- 📧 [Email Support](mailto:support@kuuzuki.com)
- 🎮 [Live Demo](https://kenji-demo.kuuzuki.com) - Play Pong built with Kenji!

---

**🎮 Built with ❤️ by the Kuuzuki team**  
_Kenji: Where AI meets game development_
