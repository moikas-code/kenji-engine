import { KeybindManager } from "./src/keybinds/KeybindManager";

// Initialize the manager
const manager = KeybindManager.getInstance();

// Wait for config to load
await new Promise(resolve => setTimeout(resolve, 100));

// Get the config to debug
const keybinds = manager.getKeybindsForContext("load");
console.log("Load context keybinds:", keybinds);

// Activate the load context
manager.activateContext("load", 50);

// Register test handlers
manager.register("list:moveUp", (event) => {
  console.log("✓ Move up action triggered!");
  return true;
}, "load");

manager.register("list:moveDown", (event) => {
  console.log("✓ Move down action triggered!");
  return true;
}, "load");

// Test with different key event formats
const testEvents = [
  { name: "up", ctrl: false, alt: false, shift: false, meta: false },
  { name: "down", ctrl: false, alt: false, shift: false, meta: false },
  { name: "upArrow", ctrl: false, alt: false, shift: false, meta: false },
  { name: "downArrow", ctrl: false, alt: false, shift: false, meta: false },
  { name: "up arrow", ctrl: false, alt: false, shift: false, meta: false },
  { name: "down arrow", ctrl: false, alt: false, shift: false, meta: false },
];

console.log("Testing key events...\n");

testEvents.forEach(event => {
  console.log(`Testing key: "${event.name}"`);
  const handled = manager.handleKeyEvent(event as any);
  if (!handled) {
    console.log(`  ✗ Not handled`);
  }
});

console.log("\n✅ Test complete!");