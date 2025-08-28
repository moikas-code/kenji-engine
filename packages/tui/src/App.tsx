import { useEffect, memo, useCallback, useState } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { themeColors } from "./shared/colors";
import {
  TerminalLayerProvider,
  ProjectManagerProvider,
  ViewRouterProvider,
  ViewRenderer,
  useViewRouter,
  useTerminalDimensionsContext,
  useRendererContext,
} from "./provider";
import { NavigationManager } from "./components/NavigationManager";
import { HelpOverlay } from "./components/HelpOverlay";
import { routes, DEFAULT_ROUTE } from "./config/routes";
import { navigationItems } from "./config/navigation";
import { useKeybindHandler, useKeybinds } from "./keybinds";

interface BoxStyle {
  height: number;
  width: number;
  backgroundColor: string;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  [key: string]: any;
}

const AppContent = memo(() => {
  const { width, height } = useTerminalDimensionsContext();
  const renderer = useRendererContext();
  const { currentRoute } = useViewRouter();
  const [showHelp, setShowHelp] = useState(false);

  // Global keybinds
  useKeybinds(
    {
      "app:quit": useCallback(() => {
        process.exit(0);
      }, []),
      "app:toggleDebug": useCallback(() => {
        console.log("Debug console toggle");
      }, []),
      "app:help": useCallback(() => {
        setShowHelp(true);
      }, []),
    },
    { context: "global" },
  );

  const boxStyle: BoxStyle = {
    width: width,
    height,
    backgroundColor: themeColors.hex.background,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    // borderStyle: "solid",/
    // paddingTop: 1,
    // paddingBottom: 0,
    // paddingLeft: 1,
    // paddingRight: 1,
    // border: {
    //   top: {
    //     style: "solid",
    //     color: themeColors.hex.accent || "#fff",
    //     width: 1,
    //   },
    //   bottom: {
    //     style: "solid",
    //     color: themeColors.hex.accent || "#fff",
    //     width: 1,
    //   },
    //   left: {
    //     style: "solid",
    //     color: themeColors.hex.accent || "#fff",
    //     width: 1,
    //   },
    //   right: {
    //     style: "solid",
    //     color: themeColors.hex.accent || "#fff",
    //     width: 1,
    //   },
    // },
  };

  return (
    <box style={boxStyle}>
      <NavigationManager
        items={navigationItems}
        showBreadcrumbs={true}
        showShortcuts={true}
      />
      <ViewRenderer currentRoute={currentRoute} />
      {showHelp && (
        <HelpOverlay
          isOpen={showHelp}
          onClose={() => setShowHelp(false)}
          context="global"
        />
      )}
    </box>
  );
});

AppContent.displayName = "AppContent";

const App = memo(() => {
  return (
    <ErrorBoundary>
      <TerminalLayerProvider>
        <ProjectManagerProvider>
          <ViewRouterProvider
            defaultRoute={DEFAULT_ROUTE}
            routes={routes}
            enableKeyboardNavigation={true}
          >
            <AppContent />
          </ViewRouterProvider>
        </ProjectManagerProvider>
      </TerminalLayerProvider>
    </ErrorBoundary>
  );
});

App.displayName = "App";

export default App;
