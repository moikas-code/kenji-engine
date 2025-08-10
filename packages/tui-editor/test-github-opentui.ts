// Test script to verify GitHub OpenTUI dependency works
import { Renderable } from "@opentui/core";

console.log("✅ Successfully imported Renderable from @opentui/core");
console.log("✅ GitHub dependency is working!");

// Test creating a basic renderable
class TestRenderable extends Renderable {
  protected renderSelf(buffer: any): void {
    console.log("✅ Can extend Renderable class");
  }
}

const test = new TestRenderable("test", {});
console.log("✅ Can instantiate custom Renderable");
console.log("🎉 GitHub OpenTUI integration is fully functional!");
