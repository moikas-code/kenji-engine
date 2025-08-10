#!/bin/bash

# Kuuzuki Game Engine Global Setup Script
# This script sets up global CLI commands using bun link

set -e

echo "🎮 Setting up Kuuzuki Game Engine global commands..."
echo ""

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install Bun first:"
    echo "   curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

echo "✅ Bun found: $(bun --version)"
echo ""

# Build packages first
echo "🔨 Building packages..."
bun run build:packages
echo ""

# Link main kuuzuki command
echo "🔗 Linking main kuuzuki command..."
bun link
echo "✅ kuuzuki command linked"
echo ""

# Link TUI editor
echo "🔗 Linking TUI editor..."
cd packages/tui-editor
bun link
echo "✅ kuuzuki-editor command linked"
cd ../..
echo ""

# Link basic CLI
echo "🔗 Linking basic CLI..."
cd packages/cli
bun link
echo "✅ kuuzuki-ge command linked"
cd ../..
echo ""

echo "🎉 Setup complete! You now have these global commands:"
echo ""
echo "📋 Available Commands:"
echo "  kuuzuki-ge           - Interactive menu (recommended)"
echo "  kuuzuki-editor       - TUI editor with interactive menu"
echo ""
echo "🚀 Quick Start:"
echo "  1. Create a projects folder: mkdir ~/projects && cd ~/projects"
echo "  2. Run the interactive menu: kuuzuki-ge"
echo "  3. Choose option 1 to create your first game!"
echo ""
echo "📖 For more help, run: kuuzuki-ge --help"