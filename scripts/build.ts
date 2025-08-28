#!/usr/bin/env bun

import { existsSync, rmSync } from "fs";
import { join } from "path";

const ROOT_DIR = join(import.meta.dir, "..");
const DIST_DIR = join(ROOT_DIR, "dist");
const PACKAGES_DIR = join(ROOT_DIR, "packages");

async function build() {
  console.log("🔨 Building Kenji Engine CLI...");

  // Clean dist directory
  if (existsSync(DIST_DIR)) {
    rmSync(DIST_DIR, { recursive: true, force: true });
  }

  // Build the CLI bundle
  const cliResult = await Bun.build({
    entrypoints: [join(PACKAGES_DIR, "cli", "kenji.ts")],
    outdir: join(DIST_DIR, "cli"),
    target: "bun",
    format: "esm",
    sourcemap: "none",
    minify: false,
    naming: {
      entry: "kenji.js",
    },
    // Bundle everything including dependencies for global installation
    external: [],
  });

  if (!cliResult.success) {
    console.error("❌ CLI build failed:", cliResult.logs);
    process.exit(1);
  }

  // Build TUI components (Bun handles JSX transformation automatically)
  const tuiResult = await Bun.build({
    entrypoints: [
      join(PACKAGES_DIR, "tui", "index.tsx"),
      join(PACKAGES_DIR, "tui", "src", "App.tsx"),
    ],
    outdir: join(DIST_DIR, "tui"),
    target: "bun",
    format: "esm",
    sourcemap: "none",
    minify: false,
    // Keep these as external since they're runtime dependencies
    external: ["@opentui/react", "@opentui/core", "react", "react-dom"],
  });

  if (!tuiResult.success) {
    console.error("❌ TUI build failed:", tuiResult.logs);
    process.exit(1);
  }

  // Build other components
  const componentsResult = await Bun.build({
    entrypoints: [
      join(PACKAGES_DIR, "kenji", "src", "project", "projectManager.ts"),
      join(PACKAGES_DIR, "kenji", "src", "engine", "core.ts"),
      join(PACKAGES_DIR, "kenji", "src", "components", "index.ts"),
      join(PACKAGES_DIR, "kenji", "src", "ecs", "world.ts"),
    ],
    outdir: DIST_DIR,
    target: "bun",
    format: "esm",
    sourcemap: "none",
    minify: false,
    external: ["bitecs", "@modelcontextprotocol/sdk"],
  });

  if (!componentsResult.success) {
    console.error("❌ Components build failed:", componentsResult.logs);
    process.exit(1);
  }

  console.log("✅ Build completed successfully!");
  console.log(`📁 Output directory: ${DIST_DIR}`);

  // Show build artifacts
  const artifacts = [
    ...cliResult.outputs,
    ...tuiResult.outputs,
    ...componentsResult.outputs,
  ];

  console.log(`\n📦 Built ${artifacts.length} files:`);
  artifacts.forEach((file) => {
    const relativePath = file.path.replace(ROOT_DIR + "/", "");
    console.log(`   - ${relativePath}`);
  });
}

// Run build
build().catch((error) => {
  console.error("❌ Build error:", error);
  process.exit(1);
});
