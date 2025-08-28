# Kenji - The TUI Engine

A Terminal User Interface (TUI) engine built with TypeScript/Bun, designed for creating games and terminal applications with AI-driven development through MCP (Model Context Protocol) integration.

## Features

- **120 FPS**: Fixed timestep with interpolation for smooth games and interactive applications
- **Entity Component System (ECS)**: Flexible architecture for game objects and UI components
- **Terminal Rendering**: Double-buffered rendering with damage tracking for optimal performance
- **Input System**: Non-blocking keyboard input with configurable mappings
- **TUI Components**: Rich terminal interface components for forms, menus, and interactive elements
- **MCP Integration**: AI agents can create and modify games and applications through natural language

## Quick Start

### Prerequisites

- Bun (latest version)
- Terminal emulator with UTF-8 support

### Installation

```bash
bun install
```

### Using Kenji Engine

```bash
# Show the main menu
bun run kenji

# Create a new game or application project
bun run kenji create "My Amazing Game" --type=game
bun run kenji create "My Terminal App" --type=app

# Get help
bun run kenji --help

# Show version
bun run kenji --version
```

### Testing the Engine

```bash
bun run test-engine.ts
```

### Playing Pong

```bash
cd examples/pong
bun run index.ts
```

**Controls:**
- Player 1: W (up) / S (down)
- Player 2: I (up) / K (down)
- Q: Quit

## Architecture

### Core Systems

1. **Core Engine** (`src/engine/core.ts`)
   - Manages the main loop with fixed timestep for games and smooth UI interactions
   - Emits events for update, fixed update, and render cycles
   - Maintains stable 60 FPS for responsive games and applications

2. **Renderer** (`src/engine/renderer.ts`)
   - Double-buffered terminal rendering
   - Character-based sprites and UI elements with Unicode support
   - Damage tracking for optimal performance

3. **ECS** (`src/ecs/world.ts`)
   - Entities as numeric IDs for game objects and UI components
   - Components as plain data objects
   - Efficient entity queries and management

4. **Input Manager** (`src/engine/input/inputManager.ts`)
   - Non-blocking keyboard input
   - Key mapping system
   - Event-based input handling for games and TUI interactions

### Game & Application Systems

- **MovementSystem**: Handles game object movement and animated UI transitions
- **CollisionSystem**: AABB collision detection for games and UI boundary management
- **RenderSystem**: Draws game entities and UI components to the terminal

## Project Structure

```
kenji-engine/
├── packages/
│   ├── kenji/         # Core TUI engine
│   ├── tui/           # Rich TUI components and views
│   ├── cli/           # Command-line interface
│   └── mcp/           # MCP server integration
├── examples/
│   └── pong/          # Example game implementation
└── test/              # Test suites
```

## Development Roadmap

### Phase 1: Foundation ✅
- [x] Core application loop implementation
- [x] Terminal rendering system
- [x] ECS architecture for UI components
- [x] Basic input system

### Phase 2: Game Example ✅
- [x] Pong game as proof of concept
- [x] Game entity management and physics
- [x] Real-time rendering and player controls
- [x] Performance optimization for smooth gameplay

### Phase 3: CLI & Menu System ✅
- [x] CLI command interface (`kenji`)
- [x] Project creation and management
- [x] Interactive menu system
- [x] Configuration management
- [x] ASCII branding and UI elements

### Phase 4: Rich TUI Components (In Progress)
- [x] OpenTUI integration foundation
- [x] React-based TUI components
- [ ] Advanced form components
- [ ] Navigation and routing systems
- [ ] Data visualization components

### Phase 5: MCP Integration (In Progress)
- [x] MCP server setup
- [x] Tool definitions for AI assistance
- [ ] Full AI-driven game and application development

### Phase 6: More Examples
- [ ] **Games**: Breakout, Snake, Tetris, RPG systems
- [ ] **Applications**: File manager, code editor, database browser
- [ ] **Tools**: System monitoring dashboard, log viewer, task manager

## TUI Architecture Notes

Kenji leverages **OpenTUI** and **React** for building rich terminal applications. The architecture supports:

- `@opentui/core` - Terminal rendering and component system
- `@opentui/react` - React integration for reactive TUI components
- Component-based architecture with JSX
- Event-driven interactions and state management
- Responsive terminal layouts and theming

### What You Can Build

**Games:**
- Action games with physics and collision detection
- Puzzle games with interactive mechanics  
- RPGs with turn-based or real-time combat
- Classic arcade games (Pong, Breakout, Snake, Tetris)

**Applications:**
- Interactive forms with validation and complex inputs
- Data dashboards with real-time visualization
- File managers and system navigation tools
- Development tools (code editors, database browsers)
- Monitoring dashboards and log viewers

---

*"Kenji bridges the gap between game engines and application frameworks, offering the performance of native terminal interfaces with the creative freedom to build both entertaining games and powerful productivity tools."*
