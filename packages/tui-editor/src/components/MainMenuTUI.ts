import { Renderable } from "@opentui/core";
import { ASCIIArt } from "./ASCIIArt";
import { FileTreeBrowser, FileTreeItem } from "./FileTreeBrowser";
import * as fs from "fs";
import * as path from "path";

export interface MainMenuOption {
  id: string;
  label: string;
  description: string;
  icon: string;
  action: () => void;
}

export interface MainMenuTUIOptions {
  width: number;
  height: number;
  currentDirectory: string;
  onOpenProject?: (projectPath: string) => void;
  onCreateProject?: (projectName: string, template: string) => void;
  onExit?: () => void;
}

export class MainMenuTUI extends Renderable {
  private options: MainMenuOption[] = [];
  private selectedIndex: number = 0;
  private currentDirectory: string;
  private showFileBrowser: boolean = false;
  private fileBrowser?: FileTreeBrowser;
  private showCreateDialog: boolean = false;
  private createProjectName: string = "";
  private createProjectTemplate: string = "breakout";
  private inputMode: "menu" | "filebrowser" | "create" = "menu";

  // Callbacks
  private onOpenProject?: (projectPath: string) => void;
  private onCreateProject?: (projectName: string, template: string) => void;
  private onExit?: () => void;

  constructor(id: string, options: MainMenuTUIOptions) {
    super(id, { zIndex: 1 });

    this.currentDirectory = options.currentDirectory;
    this.onOpenProject = options.onOpenProject;
    this.onCreateProject = options.onCreateProject;
    this.onExit = options.onExit;

    this.width = options.width;
    this.height = options.height;

    this.initializeOptions();
  }

  private initializeOptions(): void {
    this.options = [
      {
        id: "open",
        label: "Open Project",
        description: "Browse and open an existing game project",
        icon: "📂",
        action: () => this.showProjectBrowser(),
      },
      {
        id: "create",
        label: "Create New Project",
        description: "Start a new game project with templates",
        icon: "🆕",
        action: () => this.showCreateProjectDialog(),
      },
      {
        id: "recent",
        label: "Recent Projects",
        description: "Open recently used projects",
        icon: "🕒",
        action: () => this.showRecentProjects(),
      },
      {
        id: "examples",
        label: "Example Projects",
        description: "Explore example games and templates",
        icon: "🎮",
        action: () => this.showExampleProjects(),
      },
      {
        id: "settings",
        label: "Settings",
        description: "Configure editor preferences",
        icon: "⚙️",
        action: () => this.showSettings(),
      },
      {
        id: "help",
        label: "Help & Documentation",
        description: "View guides and documentation",
        icon: "❓",
        action: () => this.showHelp(),
      },
      {
        id: "exit",
        label: "Exit",
        description: "Close the Kuuzuki Game Engine",
        icon: "🚪",
        action: () => this.handleExit(),
      },
    ];
  }

  protected renderSelf(buffer: any): void {
    // Clear screen
    buffer.clear();

    if (this.inputMode === "filebrowser" && this.fileBrowser) {
      this.fileBrowser.render(buffer, 0);
      return;
    }

    if (this.inputMode === "create") {
      this.renderCreateProjectDialog(buffer);
      return;
    }

    // Render main menu
    this.renderMainMenu(buffer);
  }

  private renderMainMenu(buffer: any): void {
    const centerX = Math.floor(this.width / 2);

    // Render ASCII art logo
    const logo = ASCIIArt.getLogoForWidth(this.width);
    const logoLines = logo.split("\n");
    let logoY = 2;

    for (const line of logoLines) {
      if (line.trim()) {
        const logoX = Math.floor((this.width - line.length) / 2);
        buffer.drawText(line, logoX, logoY, { r: 0.3, g: 0.7, b: 1.0, a: 1 });
      }
      logoY++;
    }

    // Subtitle
    const subtitle = "Terminal-based Visual Game Editor";
    const subtitleX = Math.floor((this.width - subtitle.length) / 2);
    buffer.drawText(subtitle, subtitleX, logoY + 1, {
      r: 0.6,
      g: 0.6,
      b: 0.6,
      a: 1,
    });

    // Current directory info
    const dirInfo = `Current Directory: ${this.currentDirectory}`;
    const dirInfoX = Math.floor((this.width - dirInfo.length) / 2);
    buffer.drawText(dirInfo, dirInfoX, logoY + 3, {
      r: 0.5,
      g: 0.5,
      b: 0.5,
      a: 1,
    });

    // Menu options
    const menuStartY = logoY + 6;
    const menuWidth = 60;
    const menuX = Math.floor((this.width - menuWidth) / 2);

    // Menu border
    buffer.drawBorder(
      menuX - 2,
      menuStartY - 1,
      menuWidth + 4,
      this.options.length + 2,
      { r: 0.4, g: 0.4, b: 0.4, a: 1 }
    );

    // Menu title
    buffer.drawText(" Main Menu ", menuX, menuStartY - 1, {
      r: 0.8,
      g: 0.8,
      b: 0.8,
      a: 1,
    });

    // Render menu options
    for (let i = 0; i < this.options.length; i++) {
      const option = this.options[i];
      const y = menuStartY + i;
      const isSelected = i === this.selectedIndex;

      // Background for selected item
      if (isSelected) {
        for (let x = menuX; x < menuX + menuWidth; x++) {
          buffer.drawText(
            " ",
            x,
            y,
            { r: 1, g: 1, b: 1, a: 1 },
            { r: 0.2, g: 0.4, b: 0.8, a: 1 }
          );
        }
      }

      // Option text
      const optionText = `${option.icon} ${option.label}`;
      const textColor = isSelected
        ? { r: 1, g: 1, b: 1, a: 1 }
        : { r: 0.8, g: 0.8, b: 0.8, a: 1 };
      const bgColor = isSelected
        ? { r: 0.2, g: 0.4, b: 0.8, a: 1 }
        : { r: 0, g: 0, b: 0, a: 0 };

      buffer.drawText(optionText, menuX + 2, y, textColor, bgColor);

      // Description (only for selected item)
      if (isSelected) {
        const descColor = { r: 0.9, g: 0.9, b: 0.9, a: 1 };
        buffer.drawText(option.description, menuX + 25, y, descColor, bgColor);
      }
    }

    // Help text
    const helpY = this.height - 3;
    const helpText = "↑↓: Navigate | Enter: Select | Q: Quit";
    const helpX = Math.floor((this.width - helpText.length) / 2);
    buffer.drawText(helpText, helpX, helpY, { r: 0.6, g: 0.6, b: 0.6, a: 1 });

    // Version info
    const versionText = "Kuuzuki Game Engine v1.0.0";
    const versionX = Math.floor((this.width - versionText.length) / 2);
    buffer.drawText(versionText, versionX, this.height - 1, {
      r: 0.4,
      g: 0.4,
      b: 0.4,
      a: 1,
    });
  }

  private renderCreateProjectDialog(buffer: any): void {
    const dialogWidth = 60;
    const dialogHeight = 12;
    const dialogX = Math.floor((this.width - dialogWidth) / 2);
    const dialogY = Math.floor((this.height - dialogHeight) / 2);

    // Dialog background
    for (let y = dialogY; y < dialogY + dialogHeight; y++) {
      for (let x = dialogX; x < dialogX + dialogWidth; x++) {
        buffer.drawText(
          " ",
          x,
          y,
          { r: 1, g: 1, b: 1, a: 1 },
          { r: 0.1, g: 0.1, b: 0.1, a: 1 }
        );
      }
    }

    // Dialog border
    buffer.drawBorder(dialogX, dialogY, dialogWidth, dialogHeight, {
      r: 0.6,
      g: 0.6,
      b: 0.6,
      a: 1,
    });

    // Title
    buffer.drawText(" Create New Project ", dialogX + 2, dialogY, {
      r: 1,
      g: 1,
      b: 1,
      a: 1,
    });

    // Project name input
    buffer.drawText("Project Name:", dialogX + 2, dialogY + 2, {
      r: 0.8,
      g: 0.8,
      b: 0.8,
      a: 1,
    });
    buffer.drawText(`> ${this.createProjectName}_`, dialogX + 2, dialogY + 3, {
      r: 1,
      g: 1,
      b: 1,
      a: 1,
    });

    // Template selection
    buffer.drawText("Template:", dialogX + 2, dialogY + 5, {
      r: 0.8,
      g: 0.8,
      b: 0.8,
      a: 1,
    });
    const templates = ["breakout", "platformer", "empty"];
    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      const isSelected = template === this.createProjectTemplate;
      const marker = isSelected ? "●" : "○";
      const color = isSelected
        ? { r: 0.3, g: 0.7, b: 1, a: 1 }
        : { r: 0.6, g: 0.6, b: 0.6, a: 1 };
      buffer.drawText(
        `${marker} ${template}`,
        dialogX + 4,
        dialogY + 6 + i,
        color
      );
    }

    // Help text
    buffer.drawText(
      "Type name, Tab: switch template, Enter: create, Esc: cancel",
      dialogX + 2,
      dialogY + dialogHeight - 2,
      { r: 0.6, g: 0.6, b: 0.6, a: 1 }
    );
  }

  public handleKeyPress(key: string): boolean {
    if (this.inputMode === "filebrowser" && this.fileBrowser) {
      return this.fileBrowser.handleKeyPress(key);
    }

    if (this.inputMode === "create") {
      return this.handleCreateProjectInput(key);
    }

    // Main menu input
    switch (key) {
      case "ArrowUp":
      case "k":
        this.selectedIndex = Math.max(0, this.selectedIndex - 1);
        return true;

      case "ArrowDown":
      case "j":
        this.selectedIndex = Math.min(
          this.options.length - 1,
          this.selectedIndex + 1
        );
        return true;

      case "Enter":
        this.options[this.selectedIndex].action();
        return true;

      case "q":
      case "Q":
        this.handleExit();
        return true;

      default:
        return false;
    }
  }

  private handleCreateProjectInput(key: string): boolean {
    switch (key) {
      case "Escape":
        this.inputMode = "menu";
        this.createProjectName = "";
        return true;

      case "Enter":
        if (this.createProjectName.trim()) {
          if (this.onCreateProject) {
            this.onCreateProject(
              this.createProjectName.trim(),
              this.createProjectTemplate
            );
          }
          this.inputMode = "menu";
          this.createProjectName = "";
        }
        return true;

      case "Tab":
        const templates = ["breakout", "platformer", "empty"];
        const currentIndex = templates.indexOf(this.createProjectTemplate);
        const nextIndex = (currentIndex + 1) % templates.length;
        this.createProjectTemplate = templates[nextIndex];
        return true;

      case "Backspace":
        this.createProjectName = this.createProjectName.slice(0, -1);
        return true;

      default:
        // Add character to project name
        if (key.length === 1 && /[a-zA-Z0-9-_]/.test(key)) {
          this.createProjectName += key;
        }
        return true;
    }
  }

  // Menu actions
  private showProjectBrowser(): void {
    this.inputMode = "filebrowser";
    this.fileBrowser = new FileTreeBrowser("file-browser", {
      rootPath: this.currentDirectory,
      onSelect: (item: FileTreeItem) => this.handleProjectSelection(item),
      onCancel: () => this.cancelFileBrowser(),
      fileFilter: (filename: string) => {
        // Show directories and package.json files
        return filename === "package.json" || !filename.includes(".");
      },
    });

    // Set browser size
    this.fileBrowser.width = this.width;
    this.fileBrowser.height = this.height;
  }

  private handleProjectSelection(item: FileTreeItem): void {
    if (item.isDirectory) {
      // Check if this directory contains a package.json with game engine dependencies
      const packageJsonPath = path.join(item.path, "package.json");
      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(
            fs.readFileSync(packageJsonPath, "utf8")
          );
          if (
            packageJson.dependencies &&
            (packageJson.dependencies["@kuuzuki-ge/core"] ||
              packageJson.name?.includes("kuuzuki"))
          ) {
            // This is a valid project
            if (this.onOpenProject) {
              this.onOpenProject(item.path);
            }
            return;
          }
        } catch (e) {
          // Invalid package.json
        }
      }

      // Not a project, navigate into directory
      this.fileBrowser?.setRootPath(item.path);
    }
  }

  private cancelFileBrowser(): void {
    this.inputMode = "menu";
    this.fileBrowser = undefined;
  }

  private showCreateProjectDialog(): void {
    this.inputMode = "create";
    this.createProjectName = "";
    this.createProjectTemplate = "breakout";
  }

  private showRecentProjects(): void {
    // TODO: Implement recent projects
    console.log("Recent projects not implemented yet");
  }

  private showExampleProjects(): void {
    // TODO: Implement example projects
    console.log("Example projects not implemented yet");
  }

  private showSettings(): void {
    // TODO: Implement settings
    console.log("Settings not implemented yet");
  }

  private showHelp(): void {
    // TODO: Implement help
    console.log("Help not implemented yet");
  }

  private handleExit(): void {
    if (this.onExit) {
      this.onExit();
    }
  }
}
