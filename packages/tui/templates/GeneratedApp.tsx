import { memo } from "react";

interface AppProps {
  width?: number;
  height?: number;
}

const AppContent = memo<AppProps>(({ width = 80, height = 24 }) => {
  return (
    <box style={{
      width,
      height,
      backgroundColor: "#1a1a1a",
      paddingTop: 1,
      paddingLeft: 1,
      paddingRight: 1
    }}>
      <group style={{ flexDirection: "column" }}>
        <text style={{ fg: "#00ff00" }}>
          Welcome to Test!
        </text>
        <text style={{ fg: "#888888", marginTop: 1 }}>
          This is a Terminal User Interface (TUI) application
        </text>
        <text style={{ fg: "#888888", marginTop: 1 }}>
          Built with Kenji Engine and OpenTUI
        </text>
        <text style={{ fg: "#666666", marginTop: 2 }}>
          Terminal Size: {width} x {height}
        </text>
      </group>
    </box>
  );
});

AppContent.displayName = "AppContent";

const App = memo<AppProps>((props) => {
  return <AppContent {...props} />;
});

App.displayName = "App";

export default App;