import { GameEngine } from "@kenji-engine/core";
import { PongGame } from "./PongGame";

async function main() {
  console.log("🎮 Starting Kenji Pong Game...");

  const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
  if (!canvas) {
    throw new Error("Canvas element not found");
  }

  // Initialize the Kenji Game Engine
  const engine = new GameEngine({
    canvas,
    mode: "2d",
    targetFPS: 60,
    debug: false, // Set to true for development
  });

  await engine.initialize();
  console.log("✅ Kenji Game Engine initialized");

  // Create and initialize the Pong game
  const pongGame = new PongGame();
  await pongGame.initialize(engine.world, engine.inputManager);
  console.log("✅ Pong game initialized");

  // Start the game loop
  engine.start();
  console.log("🚀 Game started! Use W/S and Arrow Keys to play");
}

// Handle errors gracefully
main().catch((error) => {
  console.error("❌ Failed to start Pong game:", error);

  // Show error message to user
  const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
  if (canvas) {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ff0000";
      ctx.font = "20px Courier New";
      ctx.textAlign = "center";
      ctx.fillText("Game Failed to Load", canvas.width / 2, canvas.height / 2);
      ctx.font = "14px Courier New";
      ctx.fillText(
        "Check console for details",
        canvas.width / 2,
        canvas.height / 2 + 30
      );
    }
  }
});
