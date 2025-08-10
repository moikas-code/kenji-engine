#!/bin/bash

# Version validation script
# Ensures all package.json files have the correct version before releasing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

if [ $# -eq 0 ]; then
    echo -e "${RED}❌ Usage: $0 <version>${NC}"
    echo -e "${YELLOW}   Example: $0 1.0.0${NC}"
    exit 1
fi

TARGET_VERSION="$1"
ERRORS=0

echo -e "${YELLOW}🔍 Validating package versions for v$TARGET_VERSION...${NC}"

# Validate root package.json
echo -e "${YELLOW}📦 Checking root package.json...${NC}"
ROOT_VERSION=$(node -p "require('./package.json').version")
if [ "$ROOT_VERSION" != "$TARGET_VERSION" ]; then
    echo -e "${RED}❌ Root package.json version mismatch: $ROOT_VERSION != $TARGET_VERSION${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ Root package.json: $ROOT_VERSION${NC}"
fi

# Validate all package directories
echo -e "${YELLOW}📦 Checking workspace packages...${NC}"
for package_dir in packages/*/; do
    if [ -f "$package_dir/package.json" ]; then
        package_name=$(basename "$package_dir")
        package_version=$(node -p "require('./$package_dir/package.json').version")
        
        if [ "$package_version" != "$TARGET_VERSION" ]; then
            echo -e "${RED}❌ $package_name version mismatch: $package_version != $TARGET_VERSION${NC}"
            ERRORS=$((ERRORS + 1))
        else
            echo -e "${GREEN}✅ $package_name: $package_version${NC}"
        fi
    fi
done

# Check example package if it exists
if [ -f "example/package.json" ]; then
    echo -e "${YELLOW}📦 Checking example package...${NC}"
    example_version=$(node -p "require('./example/package.json').version")
    if [ "$example_version" != "$TARGET_VERSION" ]; then
        echo -e "${RED}❌ Example package version mismatch: $example_version != $TARGET_VERSION${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✅ Example package: $example_version${NC}"
    fi
fi

# Check for version consistency in dependencies
echo -e "${YELLOW}🔗 Checking internal dependency versions...${NC}"
for package_dir in packages/*/; do
    if [ -f "$package_dir/package.json" ]; then
        package_name=$(basename "$package_dir")
        
        # Check if this package depends on other workspace packages
        deps=$(node -p "
            const pkg = require('./$package_dir/package.json');
            const deps = {...(pkg.dependencies || {}), ...(pkg.devDependencies || {})};
            Object.keys(deps).filter(dep => dep.startsWith('@kenji-engine/')).join(' ');
        " 2>/dev/null || echo "")
        
        if [ -n "$deps" ]; then
            for dep in $deps; do
                dep_version=$(node -p "
                    const pkg = require('./$package_dir/package.json');
                    const deps = {...(pkg.dependencies || {}), ...(pkg.devDependencies || {})};
                    deps['$dep'] || '';
                " 2>/dev/null || echo "")
                
                # Check if it's a workspace dependency (starts with workspace:)
                if [[ "$dep_version" == workspace:* ]]; then
                    echo -e "${GREEN}✅ $package_name -> $dep: $dep_version${NC}"
                elif [ "$dep_version" != "^$TARGET_VERSION" ] && [ "$dep_version" != "$TARGET_VERSION" ]; then
                    echo -e "${RED}❌ $package_name -> $dep version mismatch: $dep_version != ^$TARGET_VERSION${NC}"
                    ERRORS=$((ERRORS + 1))
                else
                    echo -e "${GREEN}✅ $package_name -> $dep: $dep_version${NC}"
                fi
            done
        fi
    fi
done

# Summary
echo ""
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 All package versions are correct for v$TARGET_VERSION!${NC}"
    exit 0
else
    echo -e "${RED}❌ Found $ERRORS version mismatches!${NC}"
    echo -e "${YELLOW}💡 To fix version mismatches:${NC}"
    echo -e "${YELLOW}   1. Update package.json versions manually, or${NC}"
    echo -e "${YELLOW}   2. Use: bun run version $TARGET_VERSION${NC}"
    exit 1
fi