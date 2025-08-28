import {
  useState,
  useEffect,
  useRef,
  useCallback,
  memo,
  createElement,
} from "react";
import { useKeyboard } from "@opentui/react";
import { themeColors } from "../shared/colors";
import { useViewRouter } from "../provider/ViewRouter";
import { useProjectManager } from "../provider";
import { useTerminalDimensionsContext } from "../provider";
import { watch } from "fs";
import { join } from "path";
import { existsSync } from "fs";

interface CanvasProps {
  onBack?: () => void;
}

interface ProjectInfo {
  loaded: boolean;
  projectName: string;
  projectPath: string;
  component: React.ComponentType<any> | null;
  lastModified: number;
}

const Canvas = (props: CanvasProps) => {
  const router = useViewRouter();
  const projectManager = useProjectManager();
  const { width: terminalWidth, height: terminalHeight } =
    useTerminalDimensionsContext();
  const fileWatcherRef = useRef<any>(null);

  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    loaded: false,
    projectName: "Unknown Project",
    projectPath: "",
    component: null,
    lastModified: 0,
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [componentKey, setComponentKey] = useState(0);

  // Load the project's App component directly
  const loadProjectComponent = useCallback(async () => {
    const project = projectManager.getCurrentProject();
    const projectPath = projectManager.getProjectPath();

    console.log("Debug - Canvas loading component:", {
      project: project?.name,
      projectPath,
    });

    if (!project || !projectPath) {
      setStatusMessage("❌ No project loaded - check Load view first");
      console.log("Debug - No project or path found:", {
        hasProject: !!project,
        hasPath: !!projectPath,
      });
      return;
    }

    try {
      setStatusMessage("🔄 Loading project component...");

      const appPath = join(projectPath, "src", "App.tsx");

      if (!existsSync(appPath)) {
        setStatusMessage("❌ App.tsx not found in project");
        return;
      }

      // Clear module cache to enable hot reload
      delete require.cache[require.resolve(appPath)];

      // Import the project's App component dynamically with cache busting
      const cacheBuster = `?t=${Date.now()}`;
      const appModule = await import(appPath + cacheBuster);
      const AppComponent = appModule.default;

      setProjectInfo({
        loaded: true,
        projectName: project.name,
        projectPath,
        component: AppComponent,
        lastModified: Date.now(),
      });

      setStatusMessage("✅ Project component loaded successfully");
    } catch (error) {
      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = error.message;
        // Check for common import errors
        if (errorMessage.includes("useTerminalDimensions")) {
          errorMessage =
            "Project uses incompatible hooks. Update App.tsx to accept width/height props instead of using useTerminalDimensions hook.";
        }
      }
      setStatusMessage(`❌ Failed to load component: ${errorMessage}`);
      console.error("Component load error:", error);

      // Log helpful information
      console.log(
        "Tip: Projects should accept width/height as props, not use useTerminalDimensions hook.",
      );
      console.log("Example App.tsx structure:");
      console.log("const App = ({ width = 80, height = 24 }) => { ... }");
    }
  }, [projectManager]);

  // Reload the project component (hot reload)
  const reloadProject = useCallback(async () => {
    setStatusMessage("🔄 Reloading project...");

    // Force component remount by changing key
    setComponentKey((prev) => prev + 1);

    // Reload the component
    await loadProjectComponent();
  }, [loadProjectComponent]);

  // Setup file watching for hot reload
  const setupHotReload = useCallback(() => {
    const projectPath = projectManager.getProjectPath();
    if (!projectPath) return;

    const srcPath = join(projectPath, "src");

    try {
      fileWatcherRef.current = watch(
        srcPath,
        { recursive: true },
        (_, filename) => {
          if (
            filename &&
            (filename.endsWith(".ts") ||
              filename.endsWith(".tsx") ||
              filename.endsWith(".js") ||
              filename.endsWith(".jsx"))
          ) {
            setStatusMessage(`🔄 File changed: ${filename} - Hot reloading...`);
            // Actually reload the component
            reloadProject();
          }
        },
      );
    } catch (error) {
      console.warn("File watching not available:", error);
    }
  }, [projectManager]);

  // Initialize on mount
  useEffect(() => {
    loadProjectComponent();
    setupHotReload();

    return () => {
      // Cleanup
      if (fileWatcherRef.current) {
        fileWatcherRef.current.close();
      }
    };
  }, [loadProjectComponent, setupHotReload]);

  // Keyboard controls
  useKeyboard((key) => {
    // Handle Canvas-specific shortcuts
    if (key.name === "escape") {
      if (props.onBack) {
        props.onBack();
      } else {
        router.goBack();
      }
      return; // Prevent further processing
    } else if (key.name === "r" && key.ctrl) {
      // Force reload
      reloadProject();
      return; // Prevent further processing
    } else if (key.name === "s" && !key.ctrl && !key.shift && !key.meta) {
      // Toggle stats (only for plain 's' key, no modifiers)
      setShowStats(!showStats);
      return; // Prevent further processing
    }
  });

  return (
    <group
      style={{
        position: "relative",
        flexDirection: "column",
        height: terminalHeight,
        width: terminalWidth,
      }}
    >
      {/* Header */}
      <group
        style={{
          // flexDirection: "column",
          position: "relative",
        }}
      >
        <text
          style={{
            position: "absolute",
            top: 0,
            // fg: themeColors.hex.accent,
          }}
        >
          {projectInfo.projectName}
        </text>
      </group>

      {/* Status Message */}
      {/*{statusMessage && (
        <group
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 1,
            marginBottom: 1,
          }}
        >
          <text
            style={{
              fg: statusMessage.startsWith("✅")
                ? themeColors.hex.success
                : statusMessage.startsWith("❌")
                  ? "#FF453A"
                  : statusMessage.startsWith("⚠️")
                    ? "#FF9F0A"
                    : statusMessage.startsWith("🔄")
                      ? themeColors.hex.accent
                      : "#FFFFFF",
            }}
          >
            {statusMessage}
          </text>
        </group>
      )}*/}

      {/* Main Game Canvas Area */}
      <group
        style={{
          flexDirection: "row",
        }}
      >
        {/* Live Project Component */}
        <box
          title="Live TUI Application"
          style={{
            width: showStats ? 85 : terminalWidth - 2,
            borderColor: themeColors.hex.accent,
          }}
        >
          <group
            style={{
              width: "100%",
              height: "100%",
            }}
          >
            {projectInfo.loaded && projectInfo.component ? (
              <group
                key={componentKey}
                style={{
                  width: "100%",
                  height: "100%",
                }}
              >
                {/* Render the actual project component with dimensions */}
                {projectInfo.component &&
                  createElement(projectInfo.component, {
                    width: terminalWidth,
                    height: terminalHeight,
                  })}
              </group>
            ) : (
              <group
                style={{
                  width: "100%",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <text style={{ fg: "#FFFF00" }}>🔄 LOADING PROJECT</text>
                <text style={{ fg: "#888888", marginTop: 1 }}>
                  Ctrl+R: Reload
                </text>
              </group>
            )}
          </group>
        </box>

        {/* Game Stats Panel */}
        {showStats && (
          <box
            title="Canvas Stats"
            style={{
              width: 22,
              marginLeft: 1,
              borderColor: themeColors.hex.muted,
            }}
          >
            <group
              style={{
                flexDirection: "column",
                padding: 1,
              }}
            >
              <text
                style={{
                  fg: themeColors.hex.accent,
                  marginBottom: 1,
                }}
              >
                📊 Project Info
              </text>
              <text style={{ fg: "#FFFFFF" }}>
                Status: {projectInfo.loaded ? "Loaded" : "Loading"}
              </text>
              <text style={{ fg: "#CCCCCC" }}>
                Path: {projectInfo.projectPath ? "Set" : "None"}
              </text>
              <text style={{ fg: "#CCCCCC" }}>
                Modified:{" "}
                {new Date(projectInfo.lastModified).toLocaleTimeString()}
              </text>
              <text
                style={{
                  fg: themeColors.hex.muted,
                  marginTop: 1,
                  marginBottom: 1,
                }}
              >
                🎯 Project
              </text>
              <text
                style={{
                  fg: "#FFFFFF",
                }}
              >
                {projectInfo.projectName}
              </text>
              <text
                style={{
                  fg: themeColors.hex.muted,
                  marginTop: 1,
                }}
              >
                🔥 Hot Reload
              </text>
              <text style={{ fg: "#00FF00" }}>Active</text>
            </group>
          </box>
        )}
      </group>

      {/* Footer Controls */}
      <group
        style={{
          position: "absolute",
          bottom: 0,
          left: 1,
          flexDirection: "column",
        }}
      >
        <text
          style={{
            fg: themeColors.hex.muted,
          }}
        >
          Ctrl+R Reload • S Toggle Stats • ESC Back
        </text>
      </group>
    </group>
  );
};

export default memo(Canvas);
