# TUI Views

This directory will contain different TUI screens/views.

## Future Views

- `CreateProject.ts` - Project creation wizard
- `LoadProject.ts` - Project browser and loader
- `Settings.ts` - Engine and project settings
- `Export.ts` - Export/build configuration
- `GameBrowser.ts` - Browse and run games
- `About.ts` - About/help screen

## Usage Pattern

```typescript
import { CreateProject } from '../tui/views';

const createView = new CreateProject();
await createView.show();
```