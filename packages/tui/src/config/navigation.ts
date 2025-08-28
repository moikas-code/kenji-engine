import { NavigationItem } from "../components/NavigationManager";

export const navigationItems: NavigationItem[] = [
  {
    id: "home",
    label: "Home",
    route: "home",
    shortcut: "h",
    icon: "🏠",
  },
  {
    id: "create",
    label: "Create",
    route: "create",
    shortcut: "c",
    icon: "✨",
  },
  {
    id: "load",
    label: "Load",
    route: "load",
    shortcut: "l",
    icon: "📁",
  },
  {
    id: "settings",
    label: "Settings",
    route: "settings",
    shortcut: "s",
    icon: "⚙️",
  },
  {
    id: "export",
    label: "Export",
    route: "export",
    shortcut: "e",
    icon: "📦",
  },
] as const;