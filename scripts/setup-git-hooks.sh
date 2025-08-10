#!/bin/bash

# Setup git hooks for the project
# This script installs the pre-push hook to validate versions before pushing tags

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔧 Setting up git hooks...${NC}"

# Create .git/hooks directory if it doesn't exist
mkdir -p .git/hooks

# Copy pre-push hook
if [ -f ".githooks/pre-push" ]; then
    cp .githooks/pre-push .git/hooks/pre-push
    chmod +x .git/hooks/pre-push
    echo -e "${GREEN}✅ Pre-push hook installed${NC}"
else
    echo -e "${RED}❌ Pre-push hook not found in .githooks/pre-push${NC}"
    exit 1
fi

# Make validation script executable
if [ -f "scripts/validate-versions.sh" ]; then
    chmod +x scripts/validate-versions.sh
    echo -e "${GREEN}✅ Version validation script made executable${NC}"
else
    echo -e "${RED}❌ Version validation script not found${NC}"
    exit 1
fi

# Test the validation script
echo -e "${YELLOW}🧪 Testing version validation script...${NC}"
if ./scripts/validate-versions.sh 0.0.1 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Version validation script works${NC}"
else
    echo -e "${YELLOW}⚠️  Version validation script test failed (expected for initial setup)${NC}"
fi

echo -e "${GREEN}🎉 Git hooks setup complete!${NC}"
echo -e "${YELLOW}📝 The pre-push hook will now:${NC}"
echo -e "${YELLOW}   • Validate package versions when pushing version tags${NC}"
echo -e "${YELLOW}   • Run build, tests, and type checking${NC}"
echo -e "${YELLOW}   • Prevent pushing if any validation fails${NC}"
echo ""
echo -e "${YELLOW}💡 To create a release:${NC}"
echo -e "${YELLOW}   1. Update all package.json versions to the same version${NC}"
echo -e "${YELLOW}   2. git tag v1.0.0${NC}"
echo -e "${YELLOW}   3. git push origin v1.0.0${NC}"
echo -e "${YELLOW}   The hook will validate everything before pushing!${NC}"