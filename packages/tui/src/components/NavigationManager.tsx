import { useEffect, useCallback, useState, memo } from "react";
import { useViewRouter } from "../provider/ViewRouter";
import { useKeybinds } from "../keybinds/hooks/useKeybind";

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

    // Set up keybind handlers for navigation
    const keybindHandlers = useCallback(() => {
      const handlers: Record<string, () => void> = {};
      
      // Create handlers for each navigation item
      items.forEach((item) => {
        if (item.enabled !== false && item.visible !== false) {
          handlers[`navigate:${item.route}`] = () => handleNavigation(item);
        }
      });
      
      return handlers;
    }, [items, handleNavigation]);

    // Register keybind handlers with the navigation context
    useKeybinds(keybindHandlers(), { context: 'navigation' });

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
