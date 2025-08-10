#!/usr/bin/env bun

import { serve } from "bun";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const WEB_DIR = "./dist/web";
const PORT = 3000;

serve({
  port: PORT,
  fetch(req) {
    const url = new URL(req.url);
    let filePath = url.pathname;

    // Default to index.html for root
    if (filePath === "/") {
      filePath = "/index.html";
    }

    const fullPath = join(WEB_DIR, filePath);

    if (!existsSync(fullPath)) {
      return new Response("Not Found", { status: 404 });
    }

    const file = readFileSync(fullPath);

    // Set appropriate content type
    let contentType = "text/plain";
    if (filePath.endsWith(".html")) contentType = "text/html";
    else if (filePath.endsWith(".js")) contentType = "application/javascript";
    else if (filePath.endsWith(".css")) contentType = "text/css";
    else if (filePath.endsWith(".json")) contentType = "application/json";

    return new Response(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-cache",
      },
    });
  },
});

console.log(`🎮 Kenji Pong Game Server running at http://localhost:${PORT}`);
console.log(`📁 Serving files from: ${WEB_DIR}`);
console.log(`🚀 Open your browser and navigate to the URL above to play!`);
