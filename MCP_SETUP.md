# 🔗 Kenji MCP Server Setup Guide

This guide shows you how to set up Kenji as a global MCP server that can be used by Kuuzuki from any repository or project.

## 🚀 Quick Setup (Recommended)

### Step 1: Build and Link Kenji

```bash
# In your kenji-ge directory
cd /path/to/kenji-ge

# Build all packages
bun run build:packages

# Link the MCP server globally
cd packages/mcp-server
bun link

# Go back to root and link main CLI (optional)
cd ../..
bun link
```

### Step 2: Verify Installation

```bash
# Check if kenji-mcp is available globally
which kenji-mcp

# Test the MCP server
kenji-mcp --help
```

## 🎮 Using Kenji MCP Server from Another Repository

### Method 1: Direct Command Usage

```bash
# In any project directory
cd /path/to/your-other-project

# Start Kenji MCP server in background
kenji-mcp &

# Start Kuuzuki (in another terminal)
kuuzuki
```

### Method 2: MCP Configuration File

Create a `.mcp.json` file in your project:

```json
{
  "mcpServers": {
    "kenji-game-engine": {
      "command": "kenji-mcp",
      "args": [],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

Then start Kuuzuki:

```bash
kuuzuki --mcp-config .mcp.json
```

### Method 3: Global MCP Configuration

Add to your global Kuuzuki config (`~/.kuuzuki/config.json`):

```json
{
  "mcp": {
    "servers": {
      "kenji": {
        "type": "local",
        "command": ["kenji-mcp"],
        "environment": {},
        "enabled": true,
        "timeout": 30000,
        "retries": 3
      }
    }
  }
}
```

## 🛠️ Advanced Setup Options

### Option 1: Symlink Method

```bash
# Create a symlink in your PATH
sudo ln -s /path/to/kenji-ge/packages/mcp-server/bin/kenji-mcp /usr/local/bin/kenji-mcp

# Now available globally
kenji-mcp
```

### Option 2: NPM Global Install (Future)

```bash
# When published to npm
npm install -g @kenji-ge/mcp-server

# Use globally
kenji-mcp
```

### Option 3: Development Mode

```bash
# For development, run directly from source
cd /path/to/kenji-ge
bun run mcp
```

## 🎯 Usage Examples

### Basic Game Development

```bash
# In your game project
cd my-game-project

# Start Kenji MCP server
kenji-mcp &

# Start Kuuzuki
kuuzuki

# Now you can use natural language commands:
# "Create a new Pong game"
# "Add particle effects to the ball"
# "Generate pixel art sprites for enemies"
# "Deploy to itch.io"
```

### Project-Specific Configuration

Create a `kenji.config.js` in your project:

```javascript
export default {
  mcp: {
    server: "kenji-mcp",
    autoStart: true,
    features: {
      pixelArt: true,
      deployment: true,
      codeGeneration: true,
    },
  },
  game: {
    type: "2d",
    template: "platformer",
    assets: {
      generateSprites: true,
      generateSounds: true,
    },
  },
};
```

## 🔧 Troubleshooting

### MCP Server Not Found

```bash
# Check if linked properly
bun pm ls --global

# Re-link if needed
cd /path/to/kenji-ge/packages/mcp-server
bun link --force
```

### Permission Issues

```bash
# Make sure binary is executable
chmod +x /path/to/kenji-ge/packages/mcp-server/bin/kenji-mcp

# Check PATH
echo $PATH
```

### Port Conflicts

```bash
# Start MCP server on different port
kenji-mcp --port 3001

# Or set environment variable
MCP_PORT=3001 kenji-mcp
```

## 📋 Available MCP Tools

When connected, Kuuzuki will have access to these Kenji tools:

- **Game Project Management**: Create, build, deploy games
- **Code Generation**: Generate game systems, components, entities
- **Asset Generation**: Create pixel art sprites, sounds, animations
- **Deployment**: Automated itch.io publishing
- **Engine Introspection**: Analyze game performance and structure

## 🌟 Integration with Other Projects

### React/Next.js Project

```bash
# In your React project
cd my-react-app

# Start Kenji MCP for game components
kenji-mcp &

# Use Kuuzuki to add game features
kuuzuki
# "Add a mini-game component to my React app"
# "Create a game leaderboard with local storage"
```

### Node.js Backend

```bash
# In your backend project
cd my-api-server

# Start Kenji MCP for game server features
kenji-mcp &

# Use Kuuzuki for game-related APIs
kuuzuki
# "Add multiplayer game session management"
# "Create game statistics tracking endpoints"
```

## 🎮 Next Steps

1. **Test the setup** with a simple game creation
2. **Explore MCP tools** available through Kuuzuki
3. **Create your first AI-assisted game**
4. **Share your experience** with the community

---

**Need help?** Join our [Discord](https://discord.gg/kuuzuki) or check the [documentation](https://kuuzuki.com/docs/kenji).
