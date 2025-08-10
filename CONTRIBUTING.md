# Contributing to Kuuzuki Game Engine

Thank you for your interest in contributing to the Kuuzuki Game Engine! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Release Process](#release-process)

## Code of Conduct

This project adheres to a code of conduct that promotes a welcoming and inclusive environment. Please be respectful and professional in all interactions.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (latest version)
- Node.js 18+ (for compatibility)
- Git

### Development Setup

1. Fork and clone the repository:

   ```bash
   git clone https://github.com/your-username/kuuzuki-ge.git
   cd kuuzuki-ge
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Build all packages:

   ```bash
   bun run build
   ```

4. Run tests:

   ```bash
   bun test
   ```

5. Start development:
   ```bash
   bun run dev
   ```

## Project Structure

This is a monorepo with the following structure:

```
kuuzuki-ge/
├── packages/
│   ├── core/              # Core game engine
│   ├── cli/               # Command line interface
│   ├── tui-editor/        # Terminal UI editor
│   ├── mcp-server/        # MCP server integration
│   ├── pixel-art-generator/ # Pixel art generation
│   └── butler-deploy/     # itch.io deployment
├── example/               # Example games
├── docs/                  # Documentation
├── scripts/               # Build and deployment scripts
└── tools/                 # Development tools
```

## Development Workflow

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test improvements

### Commit Messages

Follow conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Maintenance tasks

Examples:

- `feat(core): add collision detection system`
- `fix(audio): resolve memory leak in AudioManager`
- `docs(readme): update installation instructions`

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Prefer interfaces over types for object shapes
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Code Style

- Use 2 spaces for indentation
- Use double quotes for strings
- Include trailing commas in multiline structures
- Use semicolons
- Maximum line length: 100 characters

### File Naming

- Use PascalCase for classes and components
- Use camelCase for functions and variables
- Use kebab-case for file names (except components)
- Use `.test.ts` suffix for test files

### ECS Architecture

- Components should be data-only (no methods)
- Systems should contain all logic
- Use composition over inheritance
- Keep systems focused on single responsibilities

## Testing

### Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test --filter "filename"

# Run tests in watch mode
bun test --watch
```

### Writing Tests

- Write unit tests for all public APIs
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Test edge cases and error conditions

### Test Structure

```typescript
describe("ComponentName", () => {
  describe("methodName", () => {
    it("should do something when condition", () => {
      // Arrange
      const input = createTestInput();

      // Act
      const result = methodName(input);

      // Assert
      expect(result).toBe(expectedValue);
    });
  });
});
```

## Submitting Changes

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes following the coding standards
3. Add or update tests as needed
4. Update documentation if required
5. Ensure all tests pass
6. Run type checking: `bun run typecheck`
7. Create a pull request with:
   - Clear title and description
   - Reference to related issues
   - Screenshots/demos for UI changes
   - Breaking change notes if applicable

### Pull Request Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

## Release Process

### Versioning

We use [Semantic Versioning](https://semver.org/):

- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes (backward compatible)

### Changesets

We use [Changesets](https://github.com/changesets/changesets) for version management:

1. Add changeset for your changes:

   ```bash
   bun changeset
   ```

2. Follow the prompts to describe your changes

3. Commit the generated changeset file

### Release Steps

1. Create release PR:

   ```bash
   bun changeset version
   ```

2. Review and merge the release PR

3. Publish packages:
   ```bash
   bun run publish
   ```

## Getting Help

- Check existing [issues](https://github.com/kuuzuki-ge/kuuzuki-ge/issues)
- Create a new issue for bugs or feature requests
- Join our community discussions
- Review the documentation in `/docs`

## Recognition

Contributors will be recognized in:

- CHANGELOG.md
- README.md contributors section
- Release notes

Thank you for contributing to Kuuzuki Game Engine!
