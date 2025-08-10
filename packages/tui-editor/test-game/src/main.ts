import { GameEngine } from "@kenji-engine/core";
import { BreakoutGame } from "./game/BreakoutGame";

async function main() {
  const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
  if (!canvas) {
    throw new Error("Canvas element not found");
  }

  const engine = new GameEngine({
    canvas,
    mode: "2d",
    targetFPS: 60,
    debug: true
  });

  await engine.initialize();

  const game = new BreakoutGame();
  game.initialize(engine.world);

  engine.start();
}

main().catch(console.error);
