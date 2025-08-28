import { ViewRoute } from "../provider/ViewRouter";
import Home from "../views/Home";
import CreateProjectView from "../views/Create";
import LoadProjectView from "../views/Load";
import SettingsView from "../views/Settings";
import ExportView from "../views/Export";
import NativeEditorView from "../views/NativeEditorView";
import Canvas from "../views/Canvas";

export const routes: ViewRoute[] = [
  {
    id: "home",
    component: Home,
    title: "Kenji Engine",
  },
  {
    id: "create",
    component: CreateProjectView,
    title: "Create Project",
    parent: "home",
    transition: "slide",
  },
  {
    id: "load",
    component: LoadProjectView,
    title: "Load Project",
    parent: "home",
    transition: "slide",
  },
  {
    id: "settings",
    component: SettingsView,
    title: "Settings",
    parent: "home",
    transition: "slide",
  },
  {
    id: "export",
    component: ExportView,
    title: "Export",
    parent: "home",
    transition: "slide",
  },
  {
    id: "editor",
    component: NativeEditorView,
    title: "Editor",
    transition: "fade",
  },
  {
    id: "game",
    component: Canvas,
    title: "Canvas",
    transition: "fade",
  },
] as const;

export const DEFAULT_ROUTE = "home";