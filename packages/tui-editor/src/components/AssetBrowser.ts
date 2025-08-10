import { readdir, stat } from "fs/promises";
import { join, extname, dirname } from "path";

export interface AssetItem {
  name: string;
  path: string;
  type: "file" | "directory";
  size?: number;
  extension?: string;
  isImage?: boolean;
  isAudio?: boolean;
  isScript?: boolean;
}

export interface AssetBrowserState {
  currentPath: string;
  items: AssetItem[];
  selectedIndex: number;
  loading: boolean;
  error: string | null;
  history: string[];
  historyIndex: number;
}

export class AssetBrowser {
  private state: AssetBrowserState;
  private width: number;
  private height: number;
  private x: number;
  private y: number;
  private scrollOffset: number = 0;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    initialPath: string = process.cwd()
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.state = {
      currentPath: initialPath,
      items: [],
      selectedIndex: 0,
      loading: false,
      error: null,
      history: [initialPath],
      historyIndex: 0,
    };

    this.loadDirectory(initialPath);
  }

  async loadDirectory(path: string): Promise<void> {
    this.state.loading = true;
    this.state.error = null;

    try {
      const entries = await readdir(path);
      const items: AssetItem[] = [];

      if (path !== "/") {
        items.push({
          name: "..",
          path: dirname(path),
          type: "directory",
        });
      }

      for (const entry of entries) {
        const fullPath = join(path, entry);
        try {
          const stats = await stat(fullPath);
          const extension = extname(entry).toLowerCase();

          const item: AssetItem = {
            name: entry,
            path: fullPath,
            type: stats.isDirectory() ? "directory" : "file",
            size: stats.isFile() ? stats.size : undefined,
            extension: stats.isFile() ? extension : undefined,
            isImage: this.isImageFile(extension),
            isAudio: this.isAudioFile(extension),
            isScript: this.isScriptFile(extension),
          };

          items.push(item);
        } catch (err) {
          console.warn(`Could not stat ${fullPath}:`, err);
        }
      }

      items.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === "directory" ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      this.state.items = items;
      this.state.selectedIndex = 0;
      this.state.currentPath = path;
      this.scrollOffset = 0;
    } catch (error) {
      this.state.error = `Failed to load directory: ${error}`;
      this.state.items = [];
    } finally {
      this.state.loading = false;
    }
  }

  private isImageFile(extension: string): boolean {
    return [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".svg", ".webp"].includes(
      extension
    );
  }

  private isAudioFile(extension: string): boolean {
    return [".mp3", ".wav", ".ogg", ".m4a", ".flac"].includes(extension);
  }

  private isScriptFile(extension: string): boolean {
    return [".ts", ".js", ".json", ".md", ".txt", ".yaml", ".yml"].includes(
      extension
    );
  }

  async navigateToPath(path: string): Promise<void> {
    if (this.state.historyIndex < this.state.history.length - 1) {
      this.state.history = this.state.history.slice(
        0,
        this.state.historyIndex + 1
      );
    }

    this.state.history.push(path);
    this.state.historyIndex = this.state.history.length - 1;

    await this.loadDirectory(path);
  }

  async navigateUp(): Promise<void> {
    const parentPath = dirname(this.state.currentPath);
    if (parentPath !== this.state.currentPath) {
      await this.navigateToPath(parentPath);
    }
  }

  async navigateBack(): Promise<void> {
    if (this.state.historyIndex > 0) {
      this.state.historyIndex--;
      await this.loadDirectory(this.state.history[this.state.historyIndex]);
    }
  }

  async navigateForward(): Promise<void> {
    if (this.state.historyIndex < this.state.history.length - 1) {
      this.state.historyIndex++;
      await this.loadDirectory(this.state.history[this.state.historyIndex]);
    }
  }

  async enterSelected(): Promise<void> {
    const selected = this.getSelectedItem();
    if (!selected) return;

    if (selected.type === "directory") {
      await this.navigateToPath(selected.path);
    }
  }

  moveSelection(direction: "up" | "down"): void {
    if (this.state.items.length === 0) return;

    if (direction === "up") {
      this.state.selectedIndex = Math.max(0, this.state.selectedIndex - 1);
    } else {
      this.state.selectedIndex = Math.min(
        this.state.items.length - 1,
        this.state.selectedIndex + 1
      );
    }

    this.updateScrollOffset();
  }

  private updateScrollOffset(): void {
    const visibleItems = this.height - 4; // Account for header and borders

    if (this.state.selectedIndex < this.scrollOffset) {
      this.scrollOffset = this.state.selectedIndex;
    } else if (this.state.selectedIndex >= this.scrollOffset + visibleItems) {
      this.scrollOffset = this.state.selectedIndex - visibleItems + 1;
    }
  }

  getSelectedItem(): AssetItem | null {
    return this.state.items[this.state.selectedIndex] || null;
  }

  getCurrentPath(): string {
    return this.state.currentPath;
  }

  getFileIcon(item: AssetItem): string {
    if (item.type === "directory") {
      return item.name === ".." ? "↰" : "📁";
    }

    if (item.isImage) return "🖼️";
    if (item.isAudio) return "🎵";
    if (item.isScript) return "📄";

    switch (item.extension) {
      case ".json":
        return "⚙️";
      case ".md":
        return "📝";
      case ".txt":
        return "📄";
      case ".zip":
      case ".tar":
      case ".gz":
        return "📦";
      default:
        return "📄";
    }
  }

  formatFileSize(bytes?: number): string {
    if (!bytes) return "";

    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(unitIndex > 0 ? 1 : 0)}${units[unitIndex]}`;
  }

  render(): string[] {
    const lines: string[] = [];

    // Header
    const pathDisplay =
      this.state.currentPath.length > this.width - 4
        ? "..." + this.state.currentPath.slice(-(this.width - 7))
        : this.state.currentPath;

    lines.push("┌─ Assets ─┐".padEnd(this.width, "─"));
    lines.push(`│ ${pathDisplay}`.padEnd(this.width - 1) + "│");
    lines.push("├".padEnd(this.width - 1, "─") + "┤");

    if (this.state.loading) {
      lines.push("│ Loading...".padEnd(this.width - 1) + "│");
    } else if (this.state.error) {
      lines.push(
        `│ Error: ${this.state.error}`
          .substring(0, this.width - 1)
          .padEnd(this.width - 1) + "│"
      );
    } else if (this.state.items.length === 0) {
      lines.push("│ Empty directory".padEnd(this.width - 1) + "│");
    } else {
      const visibleItems = this.height - 4;
      const endIndex = Math.min(
        this.scrollOffset + visibleItems,
        this.state.items.length
      );

      for (let i = this.scrollOffset; i < endIndex; i++) {
        const item = this.state.items[i];
        const isSelected = i === this.state.selectedIndex;
        const icon = this.getFileIcon(item);
        const size = item.type === "file" ? this.formatFileSize(item.size) : "";

        let itemText = `${icon} ${item.name}`;
        if (size) {
          const maxNameLength = this.width - size.length - 6; // Account for icon, spaces, borders
          if (itemText.length > maxNameLength) {
            itemText = itemText.substring(0, maxNameLength - 3) + "...";
          }
          itemText = itemText.padEnd(maxNameLength) + size;
        }

        const prefix = isSelected ? "│>" : "│ ";
        const line =
          `${prefix}${itemText}`
            .substring(0, this.width - 1)
            .padEnd(this.width - 1) + "│";
        lines.push(line);
      }
    }

    // Fill remaining space
    while (lines.length < this.height - 1) {
      lines.push("│".padEnd(this.width - 1) + "│");
    }

    // Footer
    lines.push("└".padEnd(this.width - 1, "─") + "┘");

    return lines;
  }

  handleInput(key: string): boolean {
    switch (key) {
      case "ArrowUp":
      case "k":
        this.moveSelection("up");
        return true;

      case "ArrowDown":
      case "j":
        this.moveSelection("down");
        return true;

      case "Enter":
        this.enterSelected();
        return true;

      case "Backspace":
      case "h":
        this.navigateUp();
        return true;

      case "ArrowLeft":
        this.navigateBack();
        return true;

      case "ArrowRight":
        this.navigateForward();
        return true;

      default:
        return false;
    }
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  getState(): AssetBrowserState {
    return { ...this.state };
  }
}
