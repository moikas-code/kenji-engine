# TUI Components

This directory will contain reusable TUI components.

## Future Components

- `Button.ts` - Interactive button component
- `Input.ts` - Text input field component  
- `List.ts` - Scrollable list component
- `Modal.ts` - Modal dialog component
- `ProgressBar.ts` - Progress indicator component
- `Table.ts` - Data table component

## Usage Pattern

```typescript
import { Button, Input } from '../tui/components';

const button = new Button({
  text: 'Click Me',
  onPress: () => console.log('Pressed!')
});
```