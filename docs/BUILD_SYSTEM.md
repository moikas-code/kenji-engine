# Kuuzuki Game Engine - Production Build System

This document describes the comprehensive production build pipeline for the Kuuzuki Game Engine project.

## Overview

The build system provides:

- **Unified package building** with TypeScript compilation and minification
- **Web-optimized bundles** for browser deployment
- **Itch.io deployment assets** with automated deployment scripts
- **Build verification and testing** to ensure quality
- **Bundle analysis** for optimization insights
- **Automated CI/CD integration** ready configurations

## Quick Start

```bash
# Full production build
bun run build

# Build and verify
bun run build:verify

# Web-only build
bun run build:web

# Itch.io deployment build
bun run build:itch

# Analyze bundle sizes
bun run size-analysis
```

## Build Scripts

### Core Build Scripts

| Script                        | Description                           | Output                      |
| ----------------------------- | ------------------------------------- | --------------------------- |
| `scripts/build-production.ts` | Main production build pipeline        | `dist/`, `packages/*/dist/` |
| `scripts/build-test.ts`       | Build verification and testing        | Test results                |
| `scripts/analyze-bundle.ts`   | Bundle size and optimization analysis | `dist/bundle-analysis.json` |

### Package.json Scripts

| Command                  | Description               |
| ------------------------ | ------------------------- |
| `bun run build`          | Full production build     |
| `bun run build:packages` | Build all packages only   |
| `bun run build:web`      | Web-optimized build       |
| `bun run build:itch`     | Itch.io deployment build  |
| `bun run build:test`     | Run build tests           |
| `bun run build:verify`   | Build + test pipeline     |
| `bun run clean`          | Clean all build artifacts |
| `bun run typecheck`      | TypeScript type checking  |
| `bun run size-analysis`  | Bundle size analysis      |
| `bun run deploy:itch`    | Deploy to itch.io         |

## Build Pipeline Stages

### 1. Clean Stage

- Removes all existing `dist/` directories
- Creates fresh output directories
- Ensures clean build state

### 2. Package Build Stage

- Builds each package with Bun bundler
- Generates TypeScript declarations
- Applies minification and tree-shaking
- Creates source maps for debugging

### 3. Web Bundle Stage

- Creates optimized browser bundles
- Applies code splitting and tree-shaking
- Generates production HTML
- Optimizes for web deployment

### 4. Itch.io Assets Stage

- Copies web build to itch directory
- Creates itch.io manifest
- Generates deployment scripts
- Prepares game-ready assets

### 5. Verification Stage

- Tests all package imports
- Validates bundle integrity
- Checks TypeScript declarations
- Verifies deployment assets

### 6. Reporting Stage

- Generates build size reports
- Creates optimization recommendations
- Documents build artifacts
- Provides deployment guidance

## Build Configuration

### Main Configuration: `build.config.ts`

Centralized configuration for all build processes:

```typescript
// Package build settings
PACKAGE_CONFIGS: PackageBuildConfig[]

// Web bundle optimization
WEB_BUILD_CONFIG: WebBuildConfig

// Itch.io deployment settings
ITCH_BUILD_CONFIG: ItchBuildConfig

// TypeScript compilation
TYPESCRIPT_CONFIG: TypeScriptConfig

// Optimization settings
OPTIMIZATION_CONFIG: OptimizationConfig
```

### Environment Variables

| Variable        | Description       | Default       |
| --------------- | ----------------- | ------------- |
| `NODE_ENV`      | Build environment | `development` |
| `BUILD_TARGET`  | Target platform   | `universal`   |
| `BUILD_VERSION` | Build version     | `1.0.0`       |

## Output Structure

```
dist/
├── web/                    # Web deployment
│   ├── index.html         # Optimized HTML
│   ├── main.js            # Main game bundle
│   ├── main.js.map        # Source map
│   └── lib/               # Core library bundle
├── itch/                  # Itch.io deployment
│   ├── index.html         # Game HTML
│   ├── main.js            # Game bundle
│   ├── manifest.json      # Itch.io manifest
│   ├── deploy-itch.sh     # Deployment script
│   └── README.md          # Game documentation
├── build-report.json      # Build metrics
├── BUILD_REPORT.md        # Human-readable report
└── bundle-analysis.json   # Bundle analysis

packages/*/dist/           # Individual package builds
├── index.js              # Main bundle
├── index.js.map          # Source map
├── index.d.ts            # TypeScript declarations
├── index.d.ts.map        # Declaration source map
└── package.json          # Distribution package.json
```

## Package Build Details

### @kuuzuki-ge/core

- **Target**: Browser + Node.js
- **Features**: ECS architecture, rendering, input
- **External**: Three.js (kept external for CDN)
- **Size Target**: < 500KB

### @kuuzuki-ge/pixel-art-generator

- **Target**: Universal
- **Features**: Procedural pixel art generation
- **Dependencies**: @kuuzuki-ge/core
- **Size Target**: < 200KB

### @kuuzuki-ge/mcp-server

- **Target**: Node.js
- **Features**: MCP server for AI integration
- **External**: @modelcontextprotocol/sdk, zod
- **Size Target**: < 300KB

### @kuuzuki-ge/cli

- **Target**: Node.js
- **Features**: Command-line interface
- **Binary**: `kuuzuki-ge`
- **Size Target**: < 100KB

### @kuuzuki-ge/butler-deploy

- **Target**: Node.js
- **Features**: Itch.io deployment automation
- **Size Target**: < 150KB

## Web Deployment

### Optimization Features

- **Minification**: JavaScript and CSS minification
- **Tree-shaking**: Dead code elimination
- **Code splitting**: Separate chunks for optimal loading
- **Source maps**: External source maps for debugging
- **Compression**: Gzip-ready assets

### Browser Support

- **ES2022**: Modern JavaScript features
- **ESM**: Native ES modules
- **Canvas2D**: 2D rendering support
- **WebGL**: 3D rendering via Three.js

## Itch.io Deployment

### Automated Deployment

```bash
# Build and deploy in one command
bun run build:itch && bun run deploy:itch
```

### Manual Deployment

1. Build: `bun run build:itch`
2. Configure: Edit `dist/itch/deploy-itch.sh`
3. Deploy: `cd dist/itch && ./deploy-itch.sh`

### Deployment Configuration

- **User**: Set `ITCH_USER` in deploy script
- **Game**: Set `GAME_NAME` in deploy script
- **Channel**: HTML5 games use `html` channel
- **Version**: Auto-generated timestamp

## Bundle Analysis

### Size Analysis

```bash
bun run size-analysis
```

Provides:

- Individual package sizes
- Web bundle size with gzip estimates
- Total build size
- Size recommendations

### Advanced Analysis

```bash
bun run scripts/analyze-bundle.ts
```

Provides:

- Dependency analysis
- Tree-shaking effectiveness
- Duplicate code detection
- Security vulnerability scanning
- Performance estimates

## Build Testing

### Automated Testing

```bash
bun run build:test
```

Tests:

- Unit test execution
- Package import validation
- Web bundle functionality
- TypeScript declaration integrity
- Build artifact verification

### Manual Testing

1. **Package Testing**: Import each package in Node.js
2. **Web Testing**: Open `dist/web/index.html` in browser
3. **Game Testing**: Play the game to verify functionality
4. **Deployment Testing**: Test itch.io deployment

## Performance Optimization

### Bundle Size Targets

- **Core Engine**: < 500KB minified
- **Web Bundle**: < 2MB total
- **Individual Packages**: < 300KB each

### Optimization Techniques

- **Tree-shaking**: Remove unused code
- **Minification**: Compress JavaScript
- **External Dependencies**: Keep large libraries external
- **Code Splitting**: Load code on demand
- **Asset Optimization**: Compress images and assets

## Troubleshooting

### Common Issues

#### Build Fails

```bash
# Clean and rebuild
bun run clean
bun run build
```

#### TypeScript Errors

```bash
# Check types
bun run typecheck
```

#### Large Bundle Size

```bash
# Analyze bundle
bun run size-analysis
```

#### Import Errors

```bash
# Test imports
bun run build:test
```

### Debug Mode

Set `NODE_ENV=development` for:

- Unminified builds
- Inline source maps
- Debug logging
- Hot reloading

## CI/CD Integration

### GitHub Actions

The build system is ready for GitHub Actions:

```yaml
- name: Build Production
  run: bun run build:verify

- name: Deploy to Itch.io
  run: bun run deploy:itch
  if: github.ref == 'refs/heads/main'
```

### Build Artifacts

- Upload `dist/` directory as build artifacts
- Store build reports for analysis
- Cache `node_modules` and `packages/*/dist`

## Development Workflow

### Local Development

```bash
# Development build with watching
bun run dev

# Web development with hot reload
bun run dev:web
```

### Production Testing

```bash
# Full production pipeline
bun run build:verify

# Test production build locally
cd dist/web && python -m http.server 8000
```

### Release Process

1. Update version in `package.json`
2. Run `bun run build:verify`
3. Review build reports
4. Deploy with `bun run deploy:itch`
5. Create GitHub release with artifacts

## Advanced Configuration

### Custom Build Targets

Modify `build.config.ts` to add new build targets or modify existing ones.

### External Dependencies

Configure external dependencies in `build.config.ts` to keep them out of bundles.

### Optimization Settings

Adjust minification, tree-shaking, and compression settings in the configuration.

### Deployment Targets

Add new deployment targets (Steam, mobile, etc.) by extending the build pipeline.

---

This build system provides a robust, automated pipeline for developing, building, and deploying the Kuuzuki Game Engine. It ensures consistent, optimized builds while providing comprehensive testing and analysis capabilities.
