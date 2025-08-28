console.log("1. Before import");
console.log("CWD:", process.cwd());
console.log("__dirname:", import.meta.dir);

const tuiPath = "../tui/index.tsx";
console.log("2. Importing from:", tuiPath);

import(tuiPath).then((module) => {
  console.log("3. Module imported:", Object.keys(module));
  const { startTUI } = module;
  console.log("4. Calling startTUI...");
  startTUI().then(() => {
    console.log("5. TUI started");
  }).catch((error) => {
    console.error("TUI error:", error);
  });
}).catch((error) => {
  console.error("Import error:", error);
});
