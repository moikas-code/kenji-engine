export interface LayoutPanel {
  x: number;
  y: number;
  width: number;
  height: number;
  component: any;
}

export interface MainLayoutState {
  width: number;
  height: number;
  panels: {
    sceneHierarchy: LayoutPanel;
    gamePreview: LayoutPanel;
    propertyPanel: LayoutPanel;
    assetBrowser: LayoutPanel;
  };
  focusedPanel:
    | "sceneHierarchy"
    | "gamePreview"
    | "propertyPanel"
    | "assetBrowser";
}

export class MainLayout {
  private state: MainLayoutState;

  constructor(width: number, height: number) {
    this.state = {
      width,
      height,
      panels: {
        sceneHierarchy: {
          x: 0,
          y: 0,
          width: Math.floor(width * 0.25),
          height: Math.floor(height * 0.6),
          component: null,
        },
        gamePreview: {
          x: Math.floor(width * 0.25),
          y: 0,
          width: Math.floor(width * 0.5),
          height: Math.floor(height * 0.6),
          component: null,
        },
        propertyPanel: {
          x: Math.floor(width * 0.75),
          y: 0,
          width: Math.floor(width * 0.25),
          height: Math.floor(height * 0.6),
          component: null,
        },
        assetBrowser: {
          x: 0,
          y: Math.floor(height * 0.6),
          width: width,
          height: Math.floor(height * 0.4),
          component: null,
        },
      },
      focusedPanel: "gamePreview",
    };
  }

  resize(width: number, height: number): void {
    this.state.width = width;
    this.state.height = height;

    this.state.panels.sceneHierarchy = {
      ...this.state.panels.sceneHierarchy,
      width: Math.floor(width * 0.25),
      height: Math.floor(height * 0.6),
    };

    this.state.panels.gamePreview = {
      ...this.state.panels.gamePreview,
      x: Math.floor(width * 0.25),
      width: Math.floor(width * 0.5),
      height: Math.floor(height * 0.6),
    };

    this.state.panels.propertyPanel = {
      ...this.state.panels.propertyPanel,
      x: Math.floor(width * 0.75),
      width: Math.floor(width * 0.25),
      height: Math.floor(height * 0.6),
    };

    this.state.panels.assetBrowser = {
      ...this.state.panels.assetBrowser,
      y: Math.floor(height * 0.6),
      width: width,
      height: Math.floor(height * 0.4),
    };
  }

  setComponent(
    panelName: keyof MainLayoutState["panels"],
    component: any
  ): void {
    this.state.panels[panelName].component = component;
  }

  getPanel(panelName: keyof MainLayoutState["panels"]): LayoutPanel {
    return this.state.panels[panelName];
  }

  setFocus(panelName: keyof MainLayoutState["panels"]): void {
    this.state.focusedPanel = panelName;
  }

  getFocusedPanel(): keyof MainLayoutState["panels"] {
    return this.state.focusedPanel;
  }

  cycleFocus(): void {
    const panels: (keyof MainLayoutState["panels"])[] = [
      "sceneHierarchy",
      "gamePreview",
      "propertyPanel",
      "assetBrowser",
    ];
    const currentIndex = panels.indexOf(this.state.focusedPanel);
    const nextIndex = (currentIndex + 1) % panels.length;
    this.state.focusedPanel = panels[nextIndex];
  }

  render(): string[] {
    const lines: string[] = [];

    for (let y = 0; y < this.state.height; y++) {
      let line = "";

      for (let x = 0; x < this.state.width; x++) {
        const panel = this.getPanelAt(x, y);

        if (panel) {
          const relativeX = x - panel.x;
          const relativeY = y - panel.y;

          if (panel.component && typeof panel.component.render === "function") {
            const panelLines = panel.component.render();
            if (panelLines[relativeY] && panelLines[relativeY][relativeX]) {
              line += panelLines[relativeY][relativeX];
            } else {
              line += " ";
            }
          } else {
            line += " ";
          }
        } else {
          line += " ";
        }
      }

      lines.push(line);
    }

    return lines;
  }

  private getPanelAt(x: number, y: number): LayoutPanel | null {
    for (const panel of Object.values(this.state.panels)) {
      if (
        x >= panel.x &&
        x < panel.x + panel.width &&
        y >= panel.y &&
        y < panel.y + panel.height
      ) {
        return panel;
      }
    }
    return null;
  }

  handleInput(key: string): boolean {
    const focusedPanel = this.state.panels[this.state.focusedPanel];

    if (key === "Tab") {
      this.cycleFocus();
      return true;
    }

    if (
      focusedPanel.component &&
      typeof focusedPanel.component.handleInput === "function"
    ) {
      return focusedPanel.component.handleInput(key);
    }

    return false;
  }

  getState(): MainLayoutState {
    return { ...this.state };
  }
}
