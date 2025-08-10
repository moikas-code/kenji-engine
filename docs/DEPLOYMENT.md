# Kuuzuki Game Engine - Itch.io Deployment System

## 🚀 Complete Automated Deployment System

This document describes the complete automated itch.io deployment system for the Kuuzuki Game Engine Breakout game. The system provides multiple deployment methods with proper versioning, metadata generation, and build automation.

## ✅ System Components

### 1. Butler CLI Tool

- ✅ **Installed**: Butler v15.24.0 in `~/.local/bin/butler`
- ✅ **Configured**: Ready for itch.io deployment
- ✅ **Verified**: Working with dry-run tests

### 2. Deployment Package (`@kuuzuki-ge/butler-deploy`)

- ✅ **ButlerDeployer**: Core deployment functionality
- ✅ **DeploymentPipeline**: Multi-target build and deploy pipeline
- ✅ **GameManifest**: Automatic manifest and metadata generation
- ✅ **CLI Tool**: TypeScript-based command-line interface

### 3. Shell Scripts

- ✅ **deploy-itch.sh**: Production-ready deployment script
- ✅ **setup-butler.sh**: Butler installation and configuration
- ✅ **Error handling**: Comprehensive error checking and logging

### 4. Configuration Files

- ✅ **deploy.config.json**: Game metadata and deployment settings
- ✅ **Generated manifests**: Automatic .itch.toml generation
- ✅ **Build metadata**: Version tracking and build information

## 🎯 Deployment Methods

### Method 1: Shell Script (Recommended for Production)

```bash
# Full deployment (build + deploy)
./scripts/deploy-itch.sh

# Test deployment without publishing
./scripts/deploy-itch.sh --dry-run

# Deploy existing build
./scripts/deploy-itch.sh --skip-build
```

### Method 2: NPM Scripts (Quick Access)

```bash
# Full deployment
bun run deploy:itch

# Test deployment
bun run deploy:dry-run

# Setup butler
bun run deploy:setup

# CLI interface
bun run deploy:cli
```

### Method 3: TypeScript CLI (Advanced Options)

```bash
# Basic deployment
bun run packages/butler-deploy/src/cli.ts

# With custom options
bun run packages/butler-deploy/src/cli.ts --version "1.2.0" --changelog "Bug fixes"

# Dry run with custom config
bun run packages/butler-deploy/src/cli.ts --dry-run --config custom.json
```

## 📋 Setup Instructions

### 1. Initial Setup

```bash
# Install and configure butler
bun run deploy:setup

# Set your API key (get from https://itch.io/user/settings/api-keys)
export BUTLER_API_KEY="your-api-key-here"

# Edit deployment configuration
nano deploy.config.json
```

### 2. Configure Your Game

Edit `deploy.config.json`:

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

### 3. First Deployment

```bash
# Test deployment first
bun run deploy:dry-run

# Deploy to itch.io
bun run deploy:itch
```

## 🔧 Generated Files

The deployment system automatically generates:

### `.itch.toml` - Itch.io Manifest

```toml
[[actions]]
name = "play"
path = "index.html"

[prereqs]
name = "html5"
```

### `build-info.json` - Build Metadata

```json
{
  "game": "Kuuzuki Breakout",
  "engine": "Kuuzuki Game Engine",
  "version": "2025.08.03-1942",
  "buildTime": "2025-08-03T23:42:47Z",
  "platform": "web",
  "channel": "web"
}
```

### `package.json` - NPM Package Info

Automatically generated with proper metadata for web distribution.

### `README.md` - Game Documentation

Complete game documentation with controls, features, and technical details.

## 📊 Features

### ✅ Automated Build Pipeline

- Clean build process with dependency management
- Web-optimized bundle generation
- Asset copying and optimization
- Build verification and integrity checks

### ✅ Version Management

- Automatic version generation (`YYYY.MM.DD-HHMM`)
- Custom version override support
- Changelog integration
- Build tracking and history

### ✅ Multi-Target Support

- Web deployment (HTML5)
- Desktop deployment (future)
- Multiple channel support
- Platform-specific optimizations

### ✅ Security & Safety

- API key protection and validation
- Dry-run testing before deployment
- Build verification and validation
- Error handling and recovery

### ✅ Developer Experience

- Multiple deployment interfaces
- Comprehensive logging and feedback
- Progress tracking and reporting
- Help documentation and examples

## 🎮 Game-Specific Configuration

### Kuuzuki Breakout Configuration

```json
{
  "metadata": {
    "title": "Kuuzuki Breakout",
    "author": "Kuuzuki Game Engine",
    "description": "A classic Breakout game built with the Kuuzuki Game Engine",
    "tags": ["html5", "arcade", "breakout", "kuuzuki-ge", "pixel-art", "retro"],
    "controls": [
      "Left/Right Arrow Keys or A/D - Move paddle",
      "Spacebar - Launch ball / Pause game",
      "R - Restart game",
      "Mouse - Navigate menus"
    ],
    "features": [
      "Classic Breakout gameplay with modern polish",
      "Progressive difficulty with increasing ball speed",
      "Lives system with game over conditions",
      "Pixel-perfect collision detection",
      "Retro-style pixel art graphics"
    ]
  }
}
```

## 🔍 Testing & Verification

### Dry Run Testing

```bash
# Test complete pipeline without deployment
./scripts/deploy-itch.sh --dry-run

# Test with existing build
./scripts/deploy-itch.sh --dry-run --skip-build

# Test CLI interface
bun run packages/butler-deploy/src/cli.ts --dry-run
```

### Build Verification

The system automatically verifies:

- ✅ Build integrity and completeness
- ✅ Required files and manifests
- ✅ File sizes and optimization
- ✅ Deployment readiness

## 📈 Deployment Results

### Successful Deployment Output

```
🚀 Starting deployment pipeline...
   Game: Kuuzuki Breakout
   Target: your-username/kuuzuki-breakout
   Version: 2025.08.03-1942

📊 Deployment Results:

🔨 Builds:
   ✓ web: 5 files, 71KB

🚀 Deployments:
   ✓ 2025.08.03-1942: https://your-username.itch.io/kuuzuki-breakout

🎉 Deployment completed successfully!
🎮 Play your game at: https://your-username.itch.io/kuuzuki-breakout
```

## 🛠️ Troubleshooting

### Common Issues

1. **Butler Not Found**

   ```bash
   ./scripts/setup-butler.sh
   export PATH="$HOME/.local/bin:$PATH"
   ```

2. **API Key Missing**

   ```bash
   export BUTLER_API_KEY="your-api-key"
   # Get key from: https://itch.io/user/settings/api-keys
   ```

3. **Build Failed**

   ```bash
   bun run build
   bun run deploy:itch --skip-build
   ```

4. **Deployment Failed**
   ```bash
   ./scripts/deploy-itch.sh --dry-run
   butler status your-user/your-game:web
   ```

## 🚀 Next Steps

### Immediate Actions

1. ✅ Set up your itch.io API key
2. ✅ Configure `deploy.config.json` with your game details
3. ✅ Test with dry-run deployment
4. ✅ Deploy your first build

### Future Enhancements

- [ ] Desktop deployment support (Windows, Mac, Linux)
- [ ] Steam deployment integration
- [ ] Automated screenshot and trailer generation
- [ ] Multi-language support
- [ ] Analytics and deployment tracking

## 📚 Documentation

- **Main README**: [packages/butler-deploy/README.md](packages/butler-deploy/README.md)
- **Butler Documentation**: https://itch.io/docs/butler/
- **Itch.io API**: https://itch.io/docs/api/overview

## 🎯 Summary

The Kuuzuki Game Engine now has a complete, production-ready deployment system for itch.io with:

- ✅ **Butler CLI** installed and configured
- ✅ **Multiple deployment methods** (shell script, NPM scripts, TypeScript CLI)
- ✅ **Automated build pipeline** with verification
- ✅ **Version management** and metadata generation
- ✅ **Security features** and error handling
- ✅ **Comprehensive documentation** and examples
- ✅ **Testing capabilities** with dry-run support

The system is ready for production use and can deploy the Kuuzuki Breakout game to itch.io with a single command!
