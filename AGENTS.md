# Kenji Engine - Agent Guidelines

## Build/Test Commands
- `bun test` - Run all tests
- `bun run test-engine.ts` - Run engine tests specifically
- `bun run build` - Build the project
- `bun run dev` - Start development mode
- `bun run game:pong` - Test pong example

## Code Style
- Use Bun APIs: `Bun.file()`, `Bun.serve()`, `bun:sqlite` (not Node.js equivalents)
- TypeScript strict mode enabled - all code must be properly typed
- Use interface definitions over type aliases for component shapes
- Prefer `as const` for readonly objects and enums
- Use optional chaining (`?.`) and nullish coalescing (`??`) operators
- Arrow functions for class methods and callbacks
- Import ordering: external libs first, then relative imports
- No unused imports/variables - tsconfig enforces this
- Use camelCase for variables/functions, PascalCase for classes/interfaces
- Prefer explicit return types on public methods
- Use EventEmitter pattern for game engine events
- ECS pattern: entities are numbers, components are interfaces
- Error handling: return error objects or throw typed errors
- Use readonly for immutable properties where appropriate
- ReactJS for TUI: functional components with signals, not React patterns
- Use DRY principles to avoid code duplication
- Use a Functional Programming approach for game logic with ECS pattern and OOP

## Resources
- [Bun Documentation](https://bun.sh/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [ReatJS Documentation](https://react.dev/reference/react)
- [OpenTUI Repository](https://github.com/sst/opentui)
- [OpenTUI React Documentation](https://github.com/sst/opentui/blob/main/packages/react/README.md)

## MCP Servers
- kb_mcp
- context7
