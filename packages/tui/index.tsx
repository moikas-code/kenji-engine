import { render } from "@opentui/react";
import App from "./src/App";

async function startTUI() {
  await render(<App />, {
    targetFps: 120,
    consoleOptions: {
      position: "bottom" as any,
      maxStoredLogs: 1000,
      sizePercent: 40,
    },
  });
}

// Export new SolidJS TUI
export { startTUI };
