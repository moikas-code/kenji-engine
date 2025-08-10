#!/usr/bin/env bun

import { ModernKuuzukiEditor } from "./ModernKuuzukiEditor";

console.log("🎮 Starting Modern Kuuzuki Game Engine Editor...");
console.log("📝 OpenTUI-inspired architecture");
console.log(
  "⌨️  Controls: Tab (switch panels), Space (pause/resume), Q (quit)"
);
console.log("");

const editor = new ModernKuuzukiEditor({
  width: process.stdout.columns,
  height: process.stdout.rows - 4, // Leave space for status
});

editor.start();
