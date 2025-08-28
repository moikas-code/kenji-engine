# TUI Shared Utilities

This directory will contain shared TUI utilities and helpers.

## Future Utilities

- `colors.ts` - ANSI color constants and utilities
- `keyboard.ts` - Keyboard input handling utilities
- `layout.ts` - Layout and positioning helpers
- `themes.ts` - Color themes and styling
- `animations.ts` - Simple terminal animations
- `validation.ts` - Input validation helpers

## Usage Pattern

```typescript
import { colors, keyboard } from '../tui/shared';

console.log(colors.green('Success!'));
const key = await keyboard.waitForKey();
```