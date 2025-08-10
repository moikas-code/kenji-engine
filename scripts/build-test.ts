#!/usr/bin/env bun
/**
 * Kuuzuki Game Engine - Build Testing Pipeline
 *
 * This script tests the production build to ensure everything works correctly:
 * 1. Run all unit tests
 * 2. Test package imports and exports
 * 3. Validate web bundle functionality
 * 4. Check TypeScript declarations
 * 5. Verify build artifacts integrity
 */

import { $ } from "bun";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

const ROOT_DIR = resolve(import.meta.dir, "..");
const DIST_DIR = join(ROOT_DIR, "dist");

async function main() {
  console.log("🧪 Starting Kuuzuki-GE Build Testing Pipeline");
  console.log("=".repeat(60));

  try {
    await runUnitTests();
    await testPackageImports();
    await validateWebBundle();
    await checkTypeScriptDeclarations();
    await verifyBuildArtifacts();

    console.log("\n✅ All build tests passed successfully!");
  } catch (error) {
    console.error("\n❌ Build testing failed:", error);
    process.exit(1);
  }
}

async function runUnitTests() {
  console.log("\n🔬 Running unit tests...");

  try {
    await $`cd ${ROOT_DIR} && bun test`;
    console.log("  ✅ All unit tests passed");
  } catch (error) {
    console.error("  ❌ Unit tests failed");
    throw error;
  }
}

async function testPackageImports() {
  console.log("\n📦 Testing package imports...");

  const packages = [
    "@kenji-engine/core",
    "@kenji-engine/pixel-art-generator",
    "@kenji-engine/mcp-server",
    "@kenji-engine/cli",
    "@kenji-engine/butler-deploy",
  ];

  for (const packageName of packages) {
    const packageDir = join(ROOT_DIR, "packages", packageName.split("/")[1]);

    // Read package.json to get the correct main entry point
    const packageJsonPath = join(packageDir, "package.json");
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
    const mainEntry = packageJson.main || "./dist/index.js";
    const entryPath = join(packageDir, mainEntry);

    if (!existsSync(entryPath)) {
      throw new Error(`Missing build artifact: ${entryPath}`);
    }
    // Test import by creating a temporary test file
    const testImportCode = `
      try {
        const module = await import("${entryPath}");
        console.log("✅ ${packageName}: Import successful");
        console.log("  Exports:", Object.keys(module).join(", "));
      } catch (error) {
        console.error("❌ ${packageName}: Import failed", error.message);
        process.exit(1);
      }
    `;

    await $`cd ${ROOT_DIR} && echo ${testImportCode} | bun -`;
  }

  console.log("  ✅ All package imports successful");
}

async function validateWebBundle() {
  console.log("\n🌐 Validating web bundle...");

  const webDistDir = join(DIST_DIR, "web");
  const mainJsPath = join(webDistDir, "main.js");
  const indexHtmlPath = join(webDistDir, "index.html");

  // Check if files exist (optional for core package builds)
  if (!existsSync(mainJsPath)) {
    console.log(
      "⚠️  Web bundle not found - skipping web validation (core packages only)"
    );
    return;
  }

  if (!existsSync(indexHtmlPath)) {
    throw new Error(`Missing HTML file: ${indexHtmlPath}`);
  }

  // Validate JavaScript bundle
  const jsContent = readFileSync(mainJsPath, "utf-8");

  // Check for minification
  if (jsContent.includes("  ") || jsContent.includes("\n\n")) {
    console.warn("  ⚠️  JavaScript bundle may not be properly minified");
  } else {
    console.log("  ✅ JavaScript bundle is minified");
  }

  // Check for source map
  if (jsContent.includes("//# sourceMappingURL=")) {
    console.log("  ✅ Source map reference found");
  } else {
    console.warn("  ⚠️  Source map reference missing");
  }

  // Validate HTML
  const htmlContent = readFileSync(indexHtmlPath, "utf-8");

  if (htmlContent.includes('src="main.js"')) {
    console.log("  ✅ HTML references main.js correctly");
  } else {
    throw new Error("HTML does not reference main.js correctly");
  }

  // Check for production optimizations
  if (htmlContent.includes("Production Build")) {
    console.log("  ✅ HTML updated for production");
  } else {
    console.warn("  ⚠️  HTML may not be optimized for production");
  }

  console.log("  ✅ Web bundle validation passed");
}

async function checkTypeScriptDeclarations() {
  console.log("\n📝 Checking TypeScript declarations...");

  const packagesWithTypes = [
    "@kenji-engine/core",
    "@kenji-engine/pixel-art-generator",
    "@kenji-engine/mcp-server",
    "@kenji-engine/cli",
    "@kenji-engine/butler-deploy",
  ];

  for (const packageName of packagesWithTypes) {
    const packageDir = join(ROOT_DIR, "packages", packageName.split("/")[1]);
    const distDir = join(packageDir, "dist");
    const typesPath = join(distDir, "index.d.ts");

    if (!existsSync(typesPath)) {
      throw new Error(`Missing TypeScript declarations: ${typesPath}`);
    }

    // Validate declaration file content
    const typesContent = readFileSync(typesPath, "utf-8");

    if (typesContent.includes("export")) {
      console.log(`  ✅ ${packageName}: TypeScript declarations valid`);
    } else {
      throw new Error(`Invalid TypeScript declarations for ${packageName}`);
    }
  }

  console.log("  ✅ All TypeScript declarations valid");
}

async function verifyBuildArtifacts() {
  console.log("\n🔍 Verifying build artifacts integrity...");

  // Check dist directory structure
  const expectedDirs = [join(DIST_DIR, "web"), join(DIST_DIR, "itch")];

  for (const dir of expectedDirs) {
    if (!existsSync(dir)) {
      throw new Error(`Missing directory: ${dir}`);
    }
    console.log(`  ✅ Directory exists: ${dir}`);
  }

  // Check build report
  const buildReportPath = join(DIST_DIR, "build-report.json");
  if (!existsSync(buildReportPath)) {
    throw new Error(`Missing build report: ${buildReportPath}`);
  }

  const buildReport = JSON.parse(readFileSync(buildReportPath, "utf-8"));

  if (buildReport.packages && buildReport.packages.length > 0) {
    console.log(
      `  ✅ Build report contains ${buildReport.packages.length} packages`
    );
  } else {
    throw new Error("Build report is invalid or empty");
  }

  // Check itch.io deployment files
  const itchFiles = [
    join(DIST_DIR, "itch", "index.html"),
    join(DIST_DIR, "itch", "manifest.json"),
    join(DIST_DIR, "itch", "deploy-itch.sh"),
  ];

  for (const file of itchFiles) {
    if (!existsSync(file)) {
      throw new Error(`Missing itch.io file: ${file}`);
    }
  }

  console.log("  ✅ Itch.io deployment files present");
  console.log("  ✅ Build artifacts integrity verified");
}

// Run the testing pipeline
if (import.meta.main) {
  main();
}
