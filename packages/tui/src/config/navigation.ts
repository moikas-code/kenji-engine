import { NavigationItem } from "../components/NavigationManager";

export const navigationItems: NavigationItem[] = [
  {
    id: "home",
    label: "Home",
    route: "home",
    icon: "🏠",
  },
  {
    id: "create",
    label: "Create",
    route: "create",
    icon: "✨",
  },
  {
    id: "load",
    label: "Load",
    route: "load",
    icon: "📁",
  },
  {
    id: "settings",
    label: "Settings",
    route: "settings",
    icon: "⚙️",
  },
  {
    id: "export",
    label: "Export",
    route: "export",
    icon: "📦",
  },
] as const;