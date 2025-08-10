#!/bin/bash

# Kuuzuki Game Engine - Butler Setup Script
# This script installs and configures butler for itch.io deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

install_butler() {
    log_info "Installing butler..."
    
    # Detect OS
    OS="$(uname -s)"
    ARCH="$(uname -m)"
    
    case "$OS" in
        Linux*)
            case "$ARCH" in
                x86_64)
                    BUTLER_URL="https://broth.itch.ovh/butler/linux-amd64/LATEST/archive/default"
                    ;;
                i386|i686)
                    BUTLER_URL="https://broth.itch.ovh/butler/linux-386/LATEST/archive/default"
                    ;;
                *)
                    log_error "Unsupported architecture: $ARCH"
                    exit 1
                    ;;
            esac
            ;;
        Darwin*)
            BUTLER_URL="https://broth.itch.ovh/butler/darwin-amd64/LATEST/archive/default"
            ;;
        CYGWIN*|MINGW*|MSYS*)
            case "$ARCH" in
                x86_64)
                    BUTLER_URL="https://broth.itch.ovh/butler/windows-amd64/LATEST/archive/default"
                    ;;
                i386|i686)
                    BUTLER_URL="https://broth.itch.ovh/butler/windows-386/LATEST/archive/default"
                    ;;
                *)
                    log_error "Unsupported architecture: $ARCH"
                    exit 1
                    ;;
            esac
            ;;
        *)
            log_error "Unsupported operating system: $OS"
            exit 1
            ;;
    esac
    
    # Create local bin directory
    mkdir -p ~/.local/bin
    
    # Download and extract butler
    log_info "Downloading butler from $BUTLER_URL"
    curl -L -o butler.zip "$BUTLER_URL"
    
    unzip -o butler.zip
    chmod +x butler
    mv butler ~/.local/bin/
    
    # Clean up
    rm -f butler.zip *.so *.dll 2>/dev/null || true
    
    log_success "Butler installed to ~/.local/bin/butler"
}

setup_path() {
    log_info "Setting up PATH..."
    
    # Add ~/.local/bin to PATH if not already there
    if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
        # Add to various shell configs
        for shell_config in ~/.bashrc ~/.zshrc ~/.profile; do
            if [ -f "$shell_config" ]; then
                if ! grep -q "export PATH=.*\.local/bin" "$shell_config"; then
                    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$shell_config"
                    log_info "Added ~/.local/bin to PATH in $shell_config"
                fi
            fi
        done
        
        # Export for current session
        export PATH="$HOME/.local/bin:$PATH"
        log_success "PATH updated for current session"
        log_warning "Restart your terminal or run 'source ~/.bashrc' to update PATH permanently"
    else
        log_success "PATH already includes ~/.local/bin"
    fi
}

verify_installation() {
    log_info "Verifying butler installation..."
    
    # Check if butler is accessible
    if command -v butler &> /dev/null; then
        BUTLER_CMD="butler"
    elif [ -x "$HOME/.local/bin/butler" ]; then
        BUTLER_CMD="$HOME/.local/bin/butler"
    else
        log_error "Butler not found in PATH or ~/.local/bin"
        return 1
    fi
    
    # Get version
    VERSION=$("$BUTLER_CMD" --version 2>&1 | head -n1)
    log_success "Butler installed successfully: $VERSION"
    
    return 0
}

setup_api_key() {
    log_info "Setting up API key..."
    
    if [ -n "$BUTLER_API_KEY" ]; then
        log_success "BUTLER_API_KEY environment variable is already set"
        return 0
    fi
    
    echo ""
    log_warning "You need to set up your itch.io API key for deployment"
    log_info "1. Go to: https://itch.io/user/settings/api-keys"
    log_info "2. Generate a new API key"
    log_info "3. Set the BUTLER_API_KEY environment variable:"
    echo ""
    echo "   export BUTLER_API_KEY=\"your-api-key-here\""
    echo ""
    log_info "4. Add this to your shell config file (~/.bashrc, ~/.zshrc, etc.) to make it permanent"
    echo ""
    
    read -p "Do you want to set the API key now? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your itch.io API key: " -s API_KEY
        echo
        
        if [ -n "$API_KEY" ]; then
            export BUTLER_API_KEY="$API_KEY"
            
            # Add to shell configs
            for shell_config in ~/.bashrc ~/.zshrc ~/.profile; do
                if [ -f "$shell_config" ]; then
                    if ! grep -q "BUTLER_API_KEY" "$shell_config"; then
                        echo "export BUTLER_API_KEY=\"$API_KEY\"" >> "$shell_config"
                        log_info "Added BUTLER_API_KEY to $shell_config"
                    fi
                fi
            done
            
            log_success "API key set for current session"
            log_warning "Restart your terminal to make the API key permanent"
        else
            log_warning "No API key entered, you'll need to set it manually later"
        fi
    else
        log_info "Skipping API key setup"
    fi
}

test_butler() {
    log_info "Testing butler connection..."
    
    if [ -z "$BUTLER_API_KEY" ]; then
        log_warning "No API key set, skipping connection test"
        return 0
    fi
    
    # Find butler command
    if command -v butler &> /dev/null; then
        BUTLER_CMD="butler"
    elif [ -x "$HOME/.local/bin/butler" ]; then
        BUTLER_CMD="$HOME/.local/bin/butler"
    else
        log_error "Butler not found"
        return 1
    fi
    
    # Test login (this will use the API key)
    if echo "$BUTLER_API_KEY" | "$BUTLER_CMD" login 2>/dev/null; then
        log_success "Butler authentication successful"
    else
        log_warning "Butler authentication failed - please check your API key"
    fi
}

show_help() {
    echo "Kuuzuki Game Engine - Butler Setup Script"
    echo ""
    echo "This script installs and configures butler for itch.io deployment."
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --skip-install    Skip butler installation (if already installed)"
    echo "  --skip-api-key    Skip API key setup"
    echo "  --help            Show this help message"
    echo ""
    echo "What this script does:"
    echo "  1. Downloads and installs butler to ~/.local/bin"
    echo "  2. Updates your PATH to include ~/.local/bin"
    echo "  3. Helps you set up your itch.io API key"
    echo "  4. Tests the butler connection"
}

main() {
    local skip_install=false
    local skip_api_key=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-install)
                skip_install=true
                shift
                ;;
            --skip-api-key)
                skip_api_key=true
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
    
    echo "🔧 Kuuzuki Game Engine - Butler Setup"
    echo "===================================="
    
    # Check if butler is already installed
    if command -v butler &> /dev/null || [ -x "$HOME/.local/bin/butler" ]; then
        if [ "$skip_install" = false ]; then
            log_info "Butler is already installed"
            read -p "Do you want to reinstall butler? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                skip_install=true
            fi
        else
            log_info "Butler already installed, skipping installation"
        fi
    fi
    
    if [ "$skip_install" = false ]; then
        install_butler
        setup_path
    fi
    
    if verify_installation; then
        if [ "$skip_api_key" = false ]; then
            setup_api_key
            test_butler
        fi
        
        echo ""
        log_success "Butler setup completed!"
        log_info "You can now deploy games to itch.io using:"
        log_info "  ./scripts/deploy-itch.sh"
        log_info "  bun run deploy:itch"
        log_info "  bun run packages/butler-deploy/src/cli.ts"
    else
        log_error "Butler setup failed"
        exit 1
    fi
}

main "$@"