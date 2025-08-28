# TUI System

This directory contains the Terminal User Interface (TUI) system for Kenji Engine.

## Structure

```
src/tui/
├── index.ts          # Main TUI entry point (exports TUIMainMenu)
├── components/       # Reusable TUI components (future)
├── views/           # Different TUI screens/views (future)
└── shared/          # Shared TUI utilities (future)
```

## Current Implementation

- **`index.ts`** - Main TUI menu implementation
  - Enhanced terminal interface with ANSI colors
  - Professional ASCII logo and layout  
  - Keyboard navigation (arrows + shortcuts)
  - Clean, responsive design

## Usage

```typescript
// Import the main TUI menu
import { TUIMainMenu } from '../tui';

// Start the TUI
const menu = new TUIMainMenu();
await menu.start();
```

## Future Expansion

This structure allows for easy addition of:

- **Components**: Reusable TUI widgets (`Button`, `Input`, `List`, etc.)
- **Views**: Different screens (`CreateProject`, `Settings`, `GameBrowser`)
- **Shared**: Common utilities (`colors`, `layouts`, `keyboard`)

## Previous Cleanup

Consolidated from 7 files in `src/menu/` to this single, clean implementation.