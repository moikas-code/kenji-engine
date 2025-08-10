#!/usr/bin/env bun
/**
 * Kuuzuki Game Engine - Bundle Analyzer
 *
 * Analyzes build outputs for:
 * - Bundle size optimization opportunities
 * - Dependency analysis
 * - Tree-shaking effectiveness
 * - Performance metrics
 * - Security vulnerabilities
 */

import { existsSync, readFileSync, statSync } from "fs";
import { join, resolve } from "path";

interface BundleAnalysis {
  file: string;
  size: number;
  sizeFormatted: string;
  gzipSize?: number;
  gzipSizeFormatted?: string;
  dependencies: string[];
  exports: string[];
  imports: string[];
  treeshakeEffectiveness: number;
  duplicateCode: string[];
  securityIssues: string[];
}

interface AnalysisReport {
  timestamp: string;
  totalSize: number;
  totalSizeFormatted: string;
  bundles: BundleAnalysis[];
  recommendations: string[];
  performance: {
    loadTime: number;
    parseTime: number;
    executionTime: number;
  };
  security: {
    vulnerabilities: number;
    issues: string[];
  };
}

const ROOT_DIR = resolve(import.meta.dir, "..");
const DIST_DIR = join(ROOT_DIR, "dist");

async function main() {
  console.log("📊 Starting Kuuzuki-GE Bundle Analysis");
  console.log("=".repeat(60));

  if (!existsSync(DIST_DIR)) {
    console.error("❌ No build artifacts found. Run 'bun run build' first.");
    process.exit(1);
  }

  try {
    const analysis = await analyzeBundles();
    await generateReport(analysis);
    await printSummary(analysis);

    console.log("\n✅ Bundle analysis completed successfully!");
  } catch (error) {
    console.error("\n❌ Bundle analysis failed:", error);
    process.exit(1);
  }
}

async function analyzeBundles(): Promise<AnalysisReport> {
  console.log("\n🔍 Analyzing bundles...");

  const analysis: AnalysisReport = {
    timestamp: new Date().toISOString(),
    totalSize: 0,
    totalSizeFormatted: "",
    bundles: [],
    recommendations: [],
    performance: {
      loadTime: 0,
      parseTime: 0,
      executionTime: 0,
    },
    security: {
      vulnerabilities: 0,
      issues: [],
    },
  };

  // Analyze package bundles
  const packageDirs = [
    "packages/core/dist",
    "packages/pixel-art-generator/dist",
    "packages/mcp-server/dist",
    "packages/cli/dist",
    "packages/butler-deploy/dist",
  ];

  for (const packageDir of packageDirs) {
    const fullPath = join(ROOT_DIR, packageDir);
    if (existsSync(fullPath)) {
      const bundleAnalysis = await analyzeBundle(fullPath);
      if (bundleAnalysis) {
        analysis.bundles.push(bundleAnalysis);
        analysis.totalSize += bundleAnalysis.size;
      }
    }
  }

  // Analyze web bundle
  const webBundlePath = join(DIST_DIR, "web", "main.js");
  if (existsSync(webBundlePath)) {
    const webAnalysis = await analyzeBundle(webBundlePath, true);
    if (webAnalysis) {
      analysis.bundles.push(webAnalysis);
      analysis.totalSize += webAnalysis.size;
    }
  }

  analysis.totalSizeFormatted = formatBytes(analysis.totalSize);

  // Generate recommendations
  analysis.recommendations = generateRecommendations(analysis);

  // Estimate performance metrics
  analysis.performance = estimatePerformance(analysis);

  // Security analysis
  analysis.security = await performSecurityAnalysis(analysis);

  return analysis;
}

async function analyzeBundle(
  bundlePath: string,
  isWebBundle = false
): Promise<BundleAnalysis | null> {
  const filePath = isWebBundle ? bundlePath : join(bundlePath, "index.js");

  if (!existsSync(filePath)) {
    return null;
  }

  console.log(`  📦 Analyzing ${filePath}...`);

  const stats = statSync(filePath);
  const content = readFileSync(filePath, "utf-8");

  const analysis: BundleAnalysis = {
    file: filePath,
    size: stats.size,
    sizeFormatted: formatBytes(stats.size),
    dependencies: extractDependencies(content),
    exports: extractExports(content),
    imports: extractImports(content),
    treeshakeEffectiveness: calculateTreeshakeEffectiveness(content),
    duplicateCode: findDuplicateCode(content),
    securityIssues: findSecurityIssues(content),
  };

  // Calculate gzip size estimate
  try {
    const gzipSize = await estimateGzipSize(content);
    analysis.gzipSize = gzipSize;
    analysis.gzipSizeFormatted = formatBytes(gzipSize);
  } catch (error) {
    console.warn(`    ⚠️  Could not estimate gzip size: ${error}`);
  }

  return analysis;
}

function extractDependencies(content: string): string[] {
  const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  const requireRegex = /require\(['"]([^'"]+)['"]\)/g;

  const dependencies = new Set<string>();

  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(content)) !== null) {
    dependencies.add(match[1]);
  }

  while ((match = requireRegex.exec(content)) !== null) {
    dependencies.add(match[1]);
  }

  return Array.from(dependencies);
}
function extractExports(content: string): string[] {
  const exportRegex =
    /export\s+(?:(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)|{\s*([^}]+)\s*})/g;
  const exports = new Set<string>();

  let match: RegExpExecArray | null;
  while ((match = exportRegex.exec(content)) !== null) {
    if (match[1]) {
      exports.add(match[1]);
    } else if (match[2]) {
      const namedExports = match[2]
        .split(",")
        .map((e: string) => e.trim().split(" ")[0]);
      namedExports.forEach((e: string) => exports.add(e));
    }
  }

  return Array.from(exports);
}

function extractImports(content: string): string[] {
  const importRegex = /import\s+(?:(?:{\s*([^}]+)\s*})|(\w+))\s+from/g;
  const imports = new Set<string>();

  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(content)) !== null) {
    if (match[1]) {
      const namedImports = match[1].split(",").map((i: string) => i.trim());
      namedImports.forEach((i: string) => imports.add(i));
    } else if (match[2]) {
      imports.add(match[2]);
    }
  }

  return Array.from(imports);
}

function calculateTreeshakeEffectiveness(content: string): number {
  // Simple heuristic: ratio of exports to total functions/classes
  const totalFunctions = (
    content.match(/function\s+\w+|class\s+\w+|const\s+\w+\s*=/g) || []
  ).length;
  const exportedFunctions = (
    content.match(/export\s+(?:function|class|const)/g) || []
  ).length;

  if (totalFunctions === 0) return 100;
  return Math.round((exportedFunctions / totalFunctions) * 100);
}

function findDuplicateCode(content: string): string[] {
  // Simple duplicate detection - look for repeated function signatures
  const functionRegex = /function\s+(\w+)\s*\([^)]*\)\s*{/g;
  const functions = new Map<string, number>();
  const duplicates: string[] = [];

  let match: RegExpExecArray | null;
  while ((match = functionRegex.exec(content)) !== null) {
    const signature = match[0];
    const count = functions.get(signature) || 0;
    functions.set(signature, count + 1);

    if (count === 1) {
      duplicates.push(match[1]);
    }
  }

  return duplicates;
}
function findSecurityIssues(content: string): string[] {
  const issues: string[] = [];

  // Check for common security anti-patterns
  if (content.includes("eval(")) {
    issues.push("Use of eval() detected");
  }

  if (content.includes("innerHTML")) {
    issues.push("Use of innerHTML detected (potential XSS)");
  }

  if (content.includes("document.write")) {
    issues.push("Use of document.write detected");
  }

  if (content.match(/http:\/\/[^'"\s]+/)) {
    issues.push("Insecure HTTP URLs detected");
  }

  return issues;
}

async function estimateGzipSize(content: string): Promise<number> {
  // Rough gzip estimation - typically 70-80% compression for JS
  return Math.floor(content.length * 0.3);
}

function generateRecommendations(analysis: AnalysisReport): string[] {
  const recommendations: string[] = [];

  // Size-based recommendations
  const largeBundles = analysis.bundles.filter((b) => b.size > 500 * 1024); // > 500KB
  if (largeBundles.length > 0) {
    recommendations.push(
      `Consider code splitting for large bundles: ${largeBundles
        .map((b) => b.file)
        .join(", ")}`
    );
  }

  // Tree-shaking recommendations
  const poorTreeshaking = analysis.bundles.filter(
    (b) => b.treeshakeEffectiveness < 50
  );
  if (poorTreeshaking.length > 0) {
    recommendations.push(
      "Improve tree-shaking by using named exports and avoiding side effects"
    );
  }

  // Duplicate code recommendations
  const duplicateCode = analysis.bundles.filter(
    (b) => b.duplicateCode.length > 0
  );
  if (duplicateCode.length > 0) {
    recommendations.push("Remove duplicate code to reduce bundle size");
  }

  // Security recommendations
  if (analysis.security.vulnerabilities > 0) {
    recommendations.push("Address security vulnerabilities in dependencies");
  }

  // Performance recommendations
  if (analysis.totalSize > 2 * 1024 * 1024) {
    // > 2MB
    recommendations.push(
      "Consider lazy loading or code splitting to improve initial load time"
    );
  }

  return recommendations;
}

function estimatePerformance(
  analysis: AnalysisReport
): AnalysisReport["performance"] {
  // Rough performance estimates based on bundle size
  const totalSizeMB = analysis.totalSize / (1024 * 1024);

  return {
    loadTime: Math.round(totalSizeMB * 100), // ~100ms per MB on average connection
    parseTime: Math.round(totalSizeMB * 50), // ~50ms per MB parse time
    executionTime: Math.round(totalSizeMB * 25), // ~25ms per MB execution time
  };
}

async function performSecurityAnalysis(
  analysis: AnalysisReport
): Promise<AnalysisReport["security"]> {
  const allIssues = analysis.bundles.flatMap((b) => b.securityIssues);

  return {
    vulnerabilities: allIssues.length,
    issues: [...new Set(allIssues)], // Remove duplicates
  };
}

async function generateReport(analysis: AnalysisReport) {
  console.log("\n📄 Generating analysis report...");

  const reportPath = join(DIST_DIR, "bundle-analysis.json");
  await Bun.write(reportPath, JSON.stringify(analysis, null, 2));

  // Generate human-readable report
  const humanReport = `# Kuuzuki-GE Bundle Analysis Report

Generated: ${analysis.timestamp}

## Summary
- **Total Size**: ${analysis.totalSizeFormatted}
- **Bundles Analyzed**: ${analysis.bundles.length}
- **Security Issues**: ${analysis.security.vulnerabilities}

## Bundle Details
${analysis.bundles
  .map(
    (bundle) => `
### ${bundle.file}
- **Size**: ${bundle.sizeFormatted}${
      bundle.gzipSizeFormatted ? ` (${bundle.gzipSizeFormatted} gzipped)` : ""
    }
- **Dependencies**: ${bundle.dependencies.length}
- **Exports**: ${bundle.exports.length}
- **Tree-shake Effectiveness**: ${bundle.treeshakeEffectiveness}%
- **Duplicate Code**: ${bundle.duplicateCode.length} instances
- **Security Issues**: ${bundle.securityIssues.length}
`
  )
  .join("\n")}

## Performance Estimates
- **Load Time**: ~${analysis.performance.loadTime}ms
- **Parse Time**: ~${analysis.performance.parseTime}ms
- **Execution Time**: ~${analysis.performance.executionTime}ms

## Recommendations
${analysis.recommendations.map((rec) => `- ${rec}`).join("\n")}

## Security Analysis
${
  analysis.security.issues.length > 0
    ? analysis.security.issues.map((issue) => `- ⚠️  ${issue}`).join("\n")
    : "- ✅ No security issues detected"
}

---
*Generated by Kuuzuki-GE Bundle Analyzer*
`;

  const humanReportPath = join(DIST_DIR, "BUNDLE_ANALYSIS.md");
  await Bun.write(humanReportPath, humanReport);

  console.log(`  ✅ Reports generated:`);
  console.log(`    📄 JSON: ${reportPath}`);
  console.log(`    📄 Markdown: ${humanReportPath}`);
}

async function printSummary(analysis: AnalysisReport) {
  console.log("\n📈 Bundle Analysis Summary:");
  console.log(`  Total size: ${analysis.totalSizeFormatted}`);
  console.log(`  Bundles: ${analysis.bundles.length}`);
  console.log(`  Estimated load time: ~${analysis.performance.loadTime}ms`);

  if (analysis.security.vulnerabilities > 0) {
    console.log(`  ⚠️  Security issues: ${analysis.security.vulnerabilities}`);
  } else {
    console.log(`  ✅ No security issues detected`);
  }

  if (analysis.recommendations.length > 0) {
    console.log(`\n💡 Top Recommendations:`);
    analysis.recommendations.slice(0, 3).forEach((rec) => {
      console.log(`  • ${rec}`);
    });
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Run the analyzer
if (import.meta.main) {
  main();
}
