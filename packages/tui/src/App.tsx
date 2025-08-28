import { useEffect, memo } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { themeColors } from "./shared/colors";
import { 
  ViewRouterProvider, 
  ViewOutlet, 
  TerminalLayerProvider, 
  ProjectManagerProvider,
  useRendererContext, 
  useTerminalDimensionsContext 
} from "./provider";
import { NavigationManager } from "./components/NavigationManager";
import { routes, DEFAULT_ROUTE } from "./config/routes";
import { navigationItems } from "./config/navigation";
import { useGlobalShortcuts } from "./hooks/useKeyboardShortcuts";

interface BoxStyle {
  height: number;
  width: number;
  backgroundColor: string;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
}

const AppContent = memo(() => {
  const renderer = useRendererContext();
  const { width, height } = useTerminalDimensionsContext();

  useEffect(() => {
    renderer.setBackgroundColor(themeColors.hex.background);
  }, [renderer]);

  useGlobalShortcuts();

  const boxStyle: BoxStyle = {
    width: width,
    height: Math.floor(height / 1),
    backgroundColor: themeColors.hex.background,
    paddingTop: 1,
    paddingBottom: 0,
    paddingLeft: 1,
    paddingRight: 1,
  };

  return (
    <group style={boxStyle}>
      <NavigationManager
        items={navigationItems}
        showBreadcrumbs={true}
        showShortcuts={true}
      />
      <ViewOutlet />
    </group>
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
