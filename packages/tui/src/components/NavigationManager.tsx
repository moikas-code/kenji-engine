import { useEffect, useCallback, useState, memo } from "react";
import { useKeyboard } from "@opentui/react";
import { useViewRouter } from "../provider/ViewRouter";

export interface NavigationItem {
  id: string;
  label: string;
  route: string;
  icon?: string;
  shortcut?: string;
  enabled?: boolean;
  visible?: boolean;
  children?: NavigationItem[];
}

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

interface NavigationManagerProps {
  items: NavigationItem[];
  showBreadcrumbs?: boolean;
  showShortcuts?: boolean;
  onNavigate?: (item: NavigationItem) => void;
}

export const NavigationManager = memo(
  ({
    items,
    showBreadcrumbs = true,
    showShortcuts = true,
    onNavigate,
  }: NavigationManagerProps) => {
    const router = useViewRouter();
    const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
    const [shortcuts, setShortcuts] = useState<Map<string, NavigationItem>>(
      new Map(),
    );

    useEffect(() => {
      const shortcutMap = new Map<string, NavigationItem>();

      const processItems = (navItems: NavigationItem[]) => {
        navItems.forEach((item) => {
          if (
            item.shortcut &&
            item.enabled !== false &&
            item.visible !== false
          ) {
            shortcutMap.set(item.shortcut, item);
          }
          if (item.children) {
            processItems(item.children);
          }
        });
      };

      processItems(items);
      setShortcuts(shortcutMap);
    }, [items]);

    useEffect(() => {
      const currentRoute = router.getCurrentRoute();
      if (!currentRoute) {
        setBreadcrumbs([]);
        return;
      }

      const crumbs: BreadcrumbItem[] = [];
      let route = currentRoute;

      while (route) {
        crumbs.unshift({
          label: route.title || route.id,
          route: route.id,
        });

        if (route.parent) {
          const parentRoute = router.history.find((r) => r.id === route.parent);
          route = parentRoute || null;
        } else {
          route = null;
        }
      }

      setBreadcrumbs(crumbs);
    }, [router.currentRoute, router.history]);

    const handleNavigation = useCallback(
      (item: NavigationItem) => {
        if (item.enabled === false) return;

        onNavigate?.(item);
        router.navigate(item.route);
      },
      [router, onNavigate],
    );

    useKeyboard((key) => {
      if (showShortcuts) {
        // Only process navigation shortcuts for plain key presses (no modifiers)
        const isPlainKeyPress = !key.ctrl && !key.shift && !key.meta;
        
        // Don't process shortcuts on routes that have forms or custom keyboard handling
        const currentRoute = router.getCurrentRoute();
        const routesWithCustomKeyboard = ['create', 'settings', 'load', 'game'];
        const isOnCustomKeyboardRoute = currentRoute && routesWithCustomKeyboard.includes(currentRoute.id);
        
        if (isPlainKeyPress && !isOnCustomKeyboardRoute) {
          const item = shortcuts.get(key.name);
          
          if (item) {
            handleNavigation(item);
          }
        }
      }
    });

    return null;
  },
);

export const Breadcrumbs = memo(
  ({
    items,
    separator = " / ",
  }: {
    items: BreadcrumbItem[];
    separator?: string;
  }) => {
    const router = useViewRouter();

    return (
      <text>
        {items.map((item, index) => (
          <span key={index}>
            {index > 0 && separator}
            {item.route ? (
              <button
                onPress={() => router.navigate(item.route!)}
                style={{ cursor: "pointer" }}
              >
                {item.label}
              </button>
            ) : (
              item.label
            )}
          </span>
        ))}
      </text>
    );
  },
);

export const NavigationMenu = ({
  items,
  orientation = "horizontal",
  activeRoute,
}: {
  items: NavigationItem[];
  orientation?: "horizontal" | "vertical";
  activeRoute?: string;
}) => {
  const router = useViewRouter();
  const currentRoute = activeRoute || router.getCurrentRoute()?.id;

  return (
    <box
      style={{ flexDirection: orientation === "horizontal" ? "row" : "column" }}
    >
      {items.map((item) => {
        if (item.visible === false) return null;

        const isActive = currentRoute === item.route;
        const isDisabled = item.enabled === false;

        return (
          <button
            key={item.id}
            onPress={() => !isDisabled && router.navigate(item.route)}
            disabled={isDisabled}
            style={{
              padding: orientation === "horizontal" ? "0 1" : "1 0",
              opacity: isDisabled ? 0.5 : 1,
              fontWeight: isActive ? "bold" : "normal",
              textDecoration: isActive ? "underline" : "none",
            }}
          >
            {item.icon && `${item.icon} `}
            {item.label}
            {item.shortcut && showShortcuts && ` (${item.shortcut})`}
          </button>
        );
      })}
    </box>
  );
};

export const useNavigation = () => {
  const router = useViewRouter();
  const [canNavigateBack, setCanNavigateBack] = useState(false);
  const [canNavigateForward, setCanNavigateForward] = useState(false);

  useEffect(() => {
    setCanNavigateBack(router.canGoBack());
    setCanNavigateForward(router.canGoForward());
  }, [router]);

  const navigateTo = useCallback(
    (route: string, options?: any) => {
      return router.navigate(route, options);
    },
    [router],
  );

  const goBack = useCallback(() => {
    return router.goBack();
  }, [router]);

  const goForward = useCallback(() => {
    return router.goForward();
  }, [router]);

  const goHome = useCallback(() => {
    return router.navigate("home");
  }, [router]);

  return {
    navigateTo,
    goBack,
    goForward,
    goHome,
    canNavigateBack,
    canNavigateForward,
    currentRoute: router.getCurrentRoute(),
    history: router.history,
  };
};
