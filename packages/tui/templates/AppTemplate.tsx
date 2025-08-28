import React from "react";

interface AppProps {
  width?: number;
  height?: number;
}

/**
 * Template for Kenji TUI project App components.
 * 
 * When your App is loaded by the Canvas view, it will receive
 * terminal dimensions as props. Do not use useTerminalDimensions hook
 * as it won't be available in the loaded context.
 */
const App: React.FC<AppProps> = ({ width = 80, height = 24 }) => {
  return (
    <group
      style={{
        flexDirection: "column",
        width,
        height,
      }}
    >
      <text style={{ fg: "#FFFFFF" }}>
        Your TUI App - Width: {width}, Height: {height}
      </text>
      {/* Your app content here */}
    </group>
  );
};

export default App;