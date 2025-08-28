import { startTUI } from "./index.tsx";

console.log("Calling startTUI...");
startTUI().then(() => {
  console.log("startTUI completed");
}).catch((error) => {
  console.error("startTUI error:", error);
});
