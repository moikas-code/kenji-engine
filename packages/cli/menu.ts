#!/usr/bin/env bun

// Standalone menu runner
import { startTUI } from "../tui/index.tsx";

// Start the TUI
startTUI().catch((error) => {
  console.error("Failed to start TUI:", error);
  process.exit(1);
});