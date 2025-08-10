#!/bin/bash

# Kuuzuki Game Engine - Itch.io Deployment Script
# This script automates the complete deployment process to itch.io

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="$PROJECT_ROOT/dist"
DEPLOY_DIR="$PROJECT_ROOT/dist/deploy"
CONFIG_FILE="$PROJECT_ROOT/deploy.config.json"

# Functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}❌${NC} $1"
}

check_requirements() {
    log_info "Checking requirements..."
    
    # Check if bun is installed
    if ! command -v bun &> /dev/null; then
        log_error "Bun is not installed. Please install Bun first."
        exit 1
    fi
    
    # Check if butler is installed
    if ! command -v butler &> /dev/null && ! command -v ~/.local/bin/butler &> /dev/null; then
        log_error "Butler is not installed. Please install butler from https://itch.io/docs/butler/"
        exit 1
    fi
    
    # Set butler path
    if command -v butler &> /dev/null; then
        BUTLER_CMD="butler"
    else
        BUTLER_CMD="$HOME/.local/bin/butler"
    fi
    
    # Check if API key is set
    if [ -z "$BUTLER_API_KEY" ]; then
        log_error "BUTLER_API_KEY environment variable is not set."
        log_info "Get your API key from: https://itch.io/user/settings/api-keys"
        exit 1
    fi
    
    log_success "All requirements met"
}

build_game() {
    log_info "Building game..."
    
    cd "$PROJECT_ROOT"
    
    # Clean previous builds
    if [ -d "$BUILD_DIR" ]; then
        rm -rf "$BUILD_DIR"
    fi
    
    # Build the game
    bun run build
    
    if [ ! -d "$BUILD_DIR" ]; then
        log_error "Build failed - no build directory found"
        exit 1
    fi
    
    log_success "Game built successfully"
}

prepare_deployment() {
    log_info "Preparing deployment files..."
    
    # Clean and create deployment directory
    rm -rf "$DEPLOY_DIR"
    mkdir -p "$DEPLOY_DIR/web"
    
    # Copy build files (excluding deploy directory to prevent recursion)
    find "$BUILD_DIR" -maxdepth 1 -type f -exec cp {} "$DEPLOY_DIR/web/" \;
    find "$BUILD_DIR" -maxdepth 1 -type d ! -name "deploy" ! -path "$BUILD_DIR" -exec cp -r {} "$DEPLOY_DIR/web/" \;
    
    # Generate itch.io manifest
    cat > "$DEPLOY_DIR/web/.itch.toml" << EOF
[[actions]]
name = "play"
path = "index.html"

[prereqs]
name = "html5"
EOF
    
    # Generate build info
    cat > "$DEPLOY_DIR/web/build-info.json" << EOF
{
  "game": "Kuuzuki Breakout",
  "engine": "Kuuzuki Game Engine",
  "version": "$(date +%Y.%m.%d-%H%M)",
  "buildTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "platform": "web",
  "channel": "web"
}
EOF
    
    log_success "Deployment files prepared"
}

deploy_to_itch() {
    log_info "Deploying to itch.io..."
    
    # Read config
    if [ ! -f "$CONFIG_FILE" ]; then
        log_error "Config file not found: $CONFIG_FILE"
        log_info "Please create a deploy.config.json file or run: bun run packages/butler-deploy/src/cli.ts"
        exit 1
    fi
    
    # Extract itch info from config (basic parsing)
    ITCH_USER=$(grep -o '"user": *"[^"]*"' "$CONFIG_FILE" | cut -d'"' -f4)
    ITCH_GAME=$(grep -o '"game": *"[^"]*"' "$CONFIG_FILE" | cut -d'"' -f4)
    
    if [ -z "$ITCH_USER" ] || [ -z "$ITCH_GAME" ]; then
        log_error "Could not read itch user/game from config file"
        exit 1
    fi
    
    # Generate version
    VERSION=$(date +%Y.%m.%d-%H%M)
    TARGET="$ITCH_USER/$ITCH_GAME:web"
    
    log_info "Deploying to: $TARGET"
    log_info "Version: $VERSION"
    
    # Deploy with butler
    "$BUTLER_CMD" push "$DEPLOY_DIR/web" "$TARGET" --userversion "$VERSION"
    
    if [ $? -eq 0 ]; then
        log_success "Deployment successful!"
        log_info "Game URL: https://$ITCH_USER.itch.io/$ITCH_GAME"
    else
        log_error "Deployment failed"
        exit 1
    fi
}

show_help() {
    echo "Kuuzuki Game Engine - Itch.io Deployment Script"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --skip-build    Skip the build step and use existing build"
    echo "  --dry-run       Prepare deployment but don't actually deploy"
    echo "  --help          Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  BUTLER_API_KEY  Your itch.io API key (required)"
    echo ""
    echo "Examples:"
    echo "  $0                    # Full build and deploy"
    echo "  $0 --skip-build       # Deploy existing build"
    echo "  $0 --dry-run          # Test deployment preparation"
}

# Main execution
main() {
    local skip_build=false
    local dry_run=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-build)
                skip_build=true
                shift
                ;;
            --dry-run)
                dry_run=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    echo "🚀 Kuuzuki Game Engine - Itch.io Deployment"
    echo "============================================"
    
    check_requirements
    
    if [ "$skip_build" = false ]; then
        build_game
    else
        log_info "Skipping build step"
        if [ ! -d "$BUILD_DIR" ]; then
            log_error "No existing build found. Run without --skip-build first."
            exit 1
        fi
    fi
    
    prepare_deployment
    
    if [ "$dry_run" = true ]; then
        log_warning "Dry run mode - not actually deploying"
        log_info "Deployment files prepared at: $DEPLOY_DIR/web"
        log_info "Files ready for deployment:"
        ls -la "$DEPLOY_DIR/web"
    else
        deploy_to_itch
    fi
    
    echo ""
    log_success "Deployment process completed!"
}

# Run main function with all arguments
main "$@"