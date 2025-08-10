# Kuuzuki Game Engine - Itch.io Deployment System

A complete automated deployment system for publishing games built with the Kuuzuki Game Engine to itch.io using butler (itch.io's command-line tool).

## Features

- 🚀 **One-command deployment** to itch.io
- 📦 **Automated build packaging** with proper manifests
- 🔄 **Version management** with automatic versioning
- 🎯 **Multi-target support** (web, desktop)
- 📋 **Rich metadata generation** for itch.io
- 🔒 **Secure authentication** with API keys
- 🧪 **Dry-run testing** before actual deployment
- 📊 **Deployment analytics** and reporting

## Quick Start

### 1. Setup Butler

First, install and configure butler:

```bash
# Run the setup script
bun run deploy:setup

# Or manually install butler
curl -L -o butler.zip https://broth.itch.ovh/butler/linux-amd64/LATEST/archive/default
unzip butler.zip && chmod +x butler && mv butler ~/.local/bin/
```

### 2. Configure Your Game

Edit `deploy.config.json` in your project root:

```json
{
  "itch": {
    "user": "your-username",
    "game": "your-game-name",
    "channel": "web"
  },
  "metadata": {
    "title": "Your Game Title",
    "author": "Your Name",
    "version": "1.0.0",
    "description": "Game description"
  }
}
```

### 3. Set Your API Key

Get your API key from [itch.io API settings](https://itch.io/user/settings/api-keys):

```bash
export BUTLER_API_KEY="your-api-key-here"
```

### 4. Deploy

```bash
# Full deployment (build + deploy)
bun run deploy:itch

# Test deployment without publishing
bun run deploy:dry-run

# Deploy existing build
bun run deploy:itch --skip-build
```

## Deployment Methods

### Method 1: Shell Script (Recommended)

```bash
# Full deployment
./scripts/deploy-itch.sh

# Options
./scripts/deploy-itch.sh --skip-build    # Use existing build
./scripts/deploy-itch.sh --dry-run       # Test without deploying
./scripts/deploy-itch.sh --help          # Show help
```

### Method 2: TypeScript CLI

```bash
# Using the TypeScript CLI
bun run deploy:cli

# With options
bun run deploy:cli --dry-run --version "1.2.0"
bun run deploy:cli --skip-build --changelog "Bug fixes"
```

### Method 3: Package Scripts

```bash
bun run deploy:itch      # Full deployment
bun run deploy:dry-run   # Test deployment
bun run deploy:setup     # Setup butler
```

## Configuration

### Deploy Config (`deploy.config.json`)

```json
{
  "projectRoot": ".",
  "buildDir": "./dist",
  "outputDir": "./dist/deploy",
  "itch": {
    "user": "your-username",
    "game": "your-game-name",
    "channel": "web"
  },
  "metadata": {
    "title": "Your Game",
    "author": "Your Name",
    "version": "1.0.0",
    "description": "Game description",
    "tags": ["html5", "arcade"],
    "genre": "Arcade",
    "platforms": ["web"],
    "controls": ["Arrow keys to move"],
    "features": ["Classic gameplay"]
  },
  "targets": [
    {
      "name": "web",
      "platform": "web",
      "channel": "web"
    }
  ]
}
```

### Environment Variables

```bash
# Required for deployment
BUTLER_API_KEY="your-itch-api-key"

# Optional overrides
ITCH_USER="your-username"
ITCH_GAME="your-game-name"
```

## Generated Files

The deployment system automatically generates:

### `.itch.toml` - Itch.io Manifest

```toml
[[actions]]
name = "play"
path = "index.html"

[prereqs]
name = "html5"
```

### `package.json` - NPM Package Info

```json
{
  "name": "your-game",
  "version": "1.0.0",
  "description": "Game description",
  "main": "index.html"
}
```

### `README.md` - Game Documentation

Automatically generated with:

- Game information
- Controls
- Features
- Technical details

### `build-info.json` - Build Metadata

```json
{
  "game": "Your Game",
  "engine": "Kuuzuki Game Engine",
  "version": "1.0.0",
  "buildTime": "2024-01-01T12:00:00Z",
  "platform": "web"
}
```

## CLI Options

### Shell Script Options

```bash
./scripts/deploy-itch.sh [options]

Options:
  --skip-build    Skip build step, use existing build
  --dry-run       Prepare deployment but don't publish
  --help          Show help message
```

### TypeScript CLI Options

```bash
bun run deploy:cli [options]

Options:
  --config <path>     Custom config file path
  --dry-run          Test deployment without publishing
  --skip-build       Skip build step
  --skip-deploy      Build only, don't deploy
  --version <ver>    Override version number
  --changelog <msg>  Add changelog message
  --help             Show help message
```

## Versioning

### Automatic Versioning

By default, versions are generated as: `YYYY.MM.DD-HHMM`

Example: `2024.01.15-1430`

### Custom Versioning

```bash
# Set specific version
bun run deploy:cli --version "1.2.0"

# With changelog
bun run deploy:cli --version "1.2.0" --changelog "Added new features"
```

## Multi-Target Deployment

Configure multiple deployment targets:

```json
{
  "targets": [
    {
      "name": "web",
      "platform": "web",
      "channel": "web"
    },
    {
      "name": "desktop",
      "platform": "desktop",
      "channel": "windows"
    }
  ]
}
```

## Troubleshooting

### Butler Not Found

```bash
# Install butler
./scripts/setup-butler.sh

# Or manually add to PATH
export PATH="$HOME/.local/bin:$PATH"
```

### Authentication Failed

```bash
# Check API key
echo $BUTLER_API_KEY

# Test login
butler login
```

### Build Failed

```bash
# Check build directory
ls -la dist/

# Run build manually
bun run build
```

### Deployment Failed

```bash
# Test with dry run
bun run deploy:dry-run

# Check butler status
butler status your-user/your-game:web
```

## Advanced Usage

### Custom Build Pipeline

```typescript
import { DeploymentPipeline } from "@kuuzuki-ge/butler-deploy";

const pipeline = new DeploymentPipeline({
  // ... config
});

const result = await pipeline.run({
  dryRun: false,
  version: "1.0.0",
  changelog: "Initial release",
});
```

### Programmatic Deployment

```typescript
import { ButlerDeployer } from "@kuuzuki-ge/butler-deploy";

const deployer = new ButlerDeployer({
  user: "your-user",
  game: "your-game",
  channel: "web",
});

await deployer.push({
  buildDir: "./dist",
  version: "1.0.0",
});
```

## Integration with CI/CD

### GitHub Actions

```yaml
name: Deploy to Itch.io
on:
  push:
    tags: ["v*"]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
      - run: ./scripts/deploy-itch.sh
        env:
          BUTLER_API_KEY: ${{ secrets.BUTLER_API_KEY }}
```

## Security

- API keys are never logged or stored in files
- Sensitive data is sanitized from output
- Dry-run mode for safe testing
- Build artifacts are cleaned after deployment

## Support

For issues and questions:

1. Check the [troubleshooting section](#troubleshooting)
2. Review butler documentation: https://itch.io/docs/butler/
3. Open an issue in the Kuuzuki Game Engine repository

## License

MIT License - see LICENSE file for details.
