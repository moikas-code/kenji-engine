# 🎮 Kuuzuki Game Engine - TUI Editor

**Revolutionary terminal-based visual game editor powered by OpenTUI**

Transform your terminal into a powerful game development environment with real-time visual editing, entity management, and live game preview - all in your terminal!

## ✨ Features

### 🎯 **Visual Game Editor in Terminal**

- **Multi-panel layout** with scene hierarchy, game preview, property editor, and asset browser
- **Real-time game preview** using ASCII/Unicode graphics
- **Interactive entity selection** and property editing
- **Live game simulation** with play/pause controls

### 🏗️ **Entity-Component-System Editor**

- **Visual entity hierarchy** with drag-and-drop organization
- **Component property editor** with sliders, inputs, and color pickers
- **Real-time component addition/removal**
- **Visual component relationships**

### 🎨 **Asset Management**

- **Built-in asset browser** with preview capabilities
- **Drag-and-drop asset assignment** to entities
- **Pixel art generation** integration
- **Audio asset management**

### ⚡ **Live Development**

- **Hot reload** - see changes instantly
- **Play mode** - test your game directly in the editor
- **Debug visualization** - see collision boxes, velocities, etc.
- **Performance monitoring** - FPS, entity count, memory usage

## 🚀 Quick Start

### Installation

```bash
# Install the TUI editor
npm install -g @kuuzuki-ge/tui-editor

# Or add to existing project
npm install @kuuzuki-ge/tui-editor
```

### Create New Project with Editor

```bash
# Create a new game project with TUI editor support
kuuzuki-editor create my-awesome-game -t breakout

cd my-awesome-game
kuuzuki-editor edit
```

### Open Existing Project

```bash
# Open editor in current directory
kuuzuki-editor edit

# Or specify project path
kuuzuki-editor edit -p ./my-game-project
```

## 🎮 Editor Interface

```
┌─────────────────────────────────────────────────────────────────┐
│ 🎮 Kuuzuki Game Engine Editor                    ▶️ Playing     │
├─────────────────┬─────────────────────┬─────────────────────────┤
│ Scene Hierarchy │     Game Preview    │    Property Panel      │
│                 │                     │                         │
│ 📁 Game         │  ┌─────────────────┐│ 🎯 Selected: Ball      │
│ ├─ 🏀 Ball      │  │ ████████████████││ ┌─ Transform2D ────────┐│
│ ├─ 🏓 Paddle    │  │ █████░░░████████││ │ X: [100    ] ←→     ││
│ ├─ 🧱 Bricks    │  │ ████████████████││ │ Y: [200    ] ↕      ││
│ │  ├─ Brick_01  │  │ ████████████████││ └─────────────────────┘│
│ │  ├─ Brick_02  │  │ ████████████████││ ┌─ Velocity2D ─────────┐│
│ │  └─ ...       │  │ ████████████████││ │ X: [150    ] ←→     ││
│ └─ 🎵 Audio     │  └─────────────────┘│ │ Y: [-200   ] ↕      ││
│                 │                     │ └─────────────────────┘│
├─────────────────┼─────────────────────┼─────────────────────────┤
│   Asset Browser │      Console        │     Component Library   │
│ 🖼️ ball.png     │ > Game started      │ + Transform2D           │
│ 🖼️ paddle.png   │ > Ball collision    │ + Velocity2D            │
│ 🖼️ brick.png    │ > Score: 100        │ + Sprite2D              │
│ 🎵 bounce.wav   │                     │ + Collider2D            │
└─────────────────┴─────────────────────┴─────────────────────────┘
```

## ⌨️ Keyboard Shortcuts

### Global Controls

- `F5` - Play/Stop game
- `Ctrl+S` - Save project
- `Ctrl+O` - Open project
- `q` - Quit editor
- `h` - Show help

### Scene Hierarchy

- `Click` - Select entity
- `Delete` - Remove selected entity
- `Scroll` - Navigate entity list
- `+` - Add new entity

### Game Preview

- `WASD/Arrow Keys` - Control paddle (when playing)
- `Mouse Click` - Interact with game
- `Space` - Pause/Resume

### Property Panel

- `Tab` - Navigate between fields
- `Enter` - Confirm changes
- `Esc` - Cancel changes
- `↑↓` - Adjust numeric values

## 🛠️ Advanced Features

### Custom Components

Create custom components that automatically appear in the editor:

```typescript
import { Component } from "@kuuzuki-ge/core";

export class HealthComponent extends Component {
  constructor(
    public maxHealth: number = 100,
    public currentHealth: number = 100
  ) {
    super();
  }
}

// Automatically appears in Component Library
// Properties are editable in Property Panel
```

### Visual Scripting

Add visual scripting nodes directly in the terminal:

```
┌─ Collision Event ─────┐    ┌─ Play Sound ──────┐
│ When: Ball hits Brick │───▶│ Sound: bounce.wav │
│ Target: Any Brick     │    │ Volume: 0.8       │
└───────────────────────┘    └───────────────────┘
```

### Debug Visualization

Toggle debug overlays in the game preview:

- **Collision boxes** - See hitboxes and collision areas
- **Velocity vectors** - Visualize movement directions
- **Component data** - Real-time component values
- **Performance metrics** - FPS, memory, entity count

## 🎨 Customization

### Editor Themes

```bash
# Dark theme (default)
kuuzuki-editor edit --theme dark

# Light theme
kuuzuki-editor edit --theme light

# Custom theme
kuuzuki-editor edit --theme ./my-theme.json
```

### Layout Configuration

```json
{
  "layout": {
    "sceneHierarchy": { "width": 0.25 },
    "gamePreview": { "width": 0.5 },
    "propertyPanel": { "width": 0.25 },
    "assetBrowser": { "height": 0.3 }
  }
}
```

## 🔧 Integration with Existing Tools

### VS Code Extension

```bash
# Install VS Code extension for seamless integration
code --install-extension kuuzuki-ge.tui-editor
```

### CI/CD Pipeline

```yaml
# .github/workflows/game-build.yml
- name: Build Game with TUI Editor
  run: |
    kuuzuki-editor build --headless
    kuuzuki-editor test --automated
```

## 🎯 Use Cases

### 🎮 **Game Development**

- **Rapid prototyping** - Build games quickly with visual tools
- **Level design** - Create and edit game levels visually
- **Asset management** - Organize sprites, sounds, and data
- **Team collaboration** - Share projects with consistent tooling

### 🎓 **Education**

- **Game development courses** - Teach ECS architecture visually
- **Programming workshops** - Show real-time code effects
- **Interactive tutorials** - Learn by doing with immediate feedback

### 🚀 **Professional Development**

- **Indie game development** - Full-featured editor without GUI overhead
- **Remote development** - Work over SSH with full visual capabilities
- **Server-side game logic** - Edit and test server games directly

## 🌟 Why TUI Game Editor?

### ⚡ **Performance**

- **Lightweight** - Runs in any terminal, minimal resource usage
- **Fast startup** - No GUI framework overhead
- **Responsive** - 60 FPS rendering in terminal

### 🔧 **Accessibility**

- **SSH-friendly** - Edit games on remote servers
- **Screen reader compatible** - Full accessibility support
- **Keyboard-driven** - No mouse required

### 🎨 **Unique Features**

- **ASCII art preview** - See your game in beautiful terminal graphics
- **Live coding** - Edit code and see changes instantly
- **Terminal integration** - Use with tmux, screen, and other terminal tools

## 🤝 Contributing

We welcome contributions! The TUI editor is built with:

- **OpenTUI** - Terminal UI framework
- **TypeScript** - Type-safe development
- **Kuuzuki Game Engine** - ECS game engine
- **Bun** - Fast JavaScript runtime

## 📚 Documentation

- [Getting Started Guide](./docs/getting-started.md)
- [Editor API Reference](./docs/api.md)
- [Custom Component Guide](./docs/components.md)
- [Theming Guide](./docs/theming.md)
- [Plugin Development](./docs/plugins.md)

## 🎉 Examples

Check out example projects:

- [Breakout TUI](./examples/breakout-tui/)
- [Pong Editor](./examples/pong-editor/)
- [Platformer Designer](./examples/platformer-designer/)

---

**Transform your terminal into a game development powerhouse!** 🚀

The future of game development is in the terminal - fast, accessible, and incredibly powerful.
