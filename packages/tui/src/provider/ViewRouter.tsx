import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { useKeyboard } from "@opentui/react";

export interface ViewRoute {
  id: string;
  component: React.ComponentType<any>;
  title?: string;
  parent?: string;
  transition?: "fade" | "slide" | "none";
}

interface ViewRouterContextType {
  navigate: (routeId: string) => void;
  goBack: () => void;
  goForward: () => void;
  canGoBack: () => boolean;
  canGoForward: () => boolean;
  getCurrentRoute: () => ViewRoute | null;
  currentRoute: ViewRoute | null;
  history: ViewRoute[];
}

const ViewRouterContext = createContext<ViewRouterContextType | null>(null);

export const useViewRouter = () => {
  const context = useContext(ViewRouterContext);
  if (!context) {
    throw new Error("useViewRouter must be used within a ViewRouterProvider");
  }
  return context;
};

interface ViewRouterProviderProps {
  children: ReactNode;
  defaultRoute?: string;
  routes?: ViewRoute[];
  enableKeyboardNavigation?: boolean;
  onRouteChange?: (from: ViewRoute | null, to: ViewRoute | null) => void;
}

export const ViewRouterProvider = ({
  children,
  defaultRoute,
  routes: initialRoutes = [],
  enableKeyboardNavigation = true,
  onRouteChange,
}: ViewRouterProviderProps) => {
  const routesMap = new Map(initialRoutes.map((route) => [route.id, route]));
  const [currentRoute, setCurrentRoute] = useState<ViewRoute | null>(null);
  const [history, setHistory] = useState<ViewRoute[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (defaultRoute && routesMap.has(defaultRoute) && !currentRoute) {
      const route = routesMap.get(defaultRoute)!;
      setCurrentRoute(route);
      setHistory([route]);
      setHistoryIndex(0);
    }
  }, [defaultRoute, currentRoute]);

  const navigate = useCallback(
    (routeId: string) => {
      const targetRoute = routesMap.get(routeId);
      if (!targetRoute) {
        console.error(`Route "${routeId}" not found`);
        return;
      }

      const newHistory = [...history.slice(0, historyIndex + 1), targetRoute];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setCurrentRoute(targetRoute);
      onRouteChange?.(currentRoute, targetRoute);
    },
    [history, historyIndex, currentRoute, onRouteChange],
  );

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      const targetRoute = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setCurrentRoute(targetRoute);
      onRouteChange?.(currentRoute, targetRoute);
    }
  }, [history, historyIndex, currentRoute, onRouteChange]);

  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const targetRoute = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setCurrentRoute(targetRoute);
      onRouteChange?.(currentRoute, targetRoute);
    }
  }, [history, historyIndex, currentRoute, onRouteChange]);

  const canGoBack = useCallback(() => historyIndex > 0, [historyIndex]);

  const canGoForward = useCallback(
    () => historyIndex < history.length - 1,
    [historyIndex, history],
  );

  const getCurrentRoute = useCallback(() => currentRoute, [currentRoute]);

  if (enableKeyboardNavigation) {
    useKeyboard((key) => {
      if (key.name === "backspace" || (key.name === "left" && key.option)) {
        if (canGoBack()) {
          goBack();
        }
      } else if (key.name === "right" && key.option) {
        if (canGoForward()) {
          goForward();
        }
      }
    });
  }

  const value: ViewRouterContextType = {
    navigate,
    goBack,
    goForward,
    canGoBack,
    canGoForward,
    getCurrentRoute,
    currentRoute,
    history: history.slice(0, historyIndex + 1),
  };

  return (
    <ViewRouterContext.Provider value={value}>
      {children}
    </ViewRouterContext.Provider>
  );
};

interface ViewOutletProps {
  fallback?: ReactNode;
}

export const ViewOutlet = ({ fallback }: ViewOutletProps) => {
  const { currentRoute } = useViewRouter();

  if (!currentRoute) {
    return <>{fallback || <text>No route selected</text>}</>;
  }

  return React.createElement(currentRoute.component);
};
