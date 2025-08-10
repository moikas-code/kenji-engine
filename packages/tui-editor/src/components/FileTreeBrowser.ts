import { Renderable } from "@opentui/core";
import * as fs from "fs";
import * as path from "path";

export interface FileTreeItem {
  name: string;
  path: string;
  isDirectory: boolean;
  isExpanded?: boolean;
  children?: FileTreeItem[];
  depth: number;
}

export interface FileTreeBrowserOptions {
  rootPath: string;
  onSelect?: (item: FileTreeItem) => void;
  onCancel?: () => void;
  showHidden?: boolean;
  fileFilter?: (filename: string) => boolean;
}

export class FileTreeBrowser extends Renderable {
  private rootPath: string;
  private items: FileTreeItem[] = [];
  private selectedIndex: number = 0;
  private scrollOffset: number = 0;
  private onSelect?: (item: FileTreeItem) => void;
  private onCancel?: () => void;
  private showHidden: boolean;
  private fileFilter?: (filename: string) => boolean;

  constructor(id: string, options: FileTreeBrowserOptions) {
    super(id, { zIndex: 10 });

    this.rootPath = options.rootPath;
    this.onSelect = options.onSelect;
    this.onCancel = options.onCancel;
    this.showHidden = options.showHidden || false;
    this.fileFilter = options.fileFilter;

    this.loadDirectory(this.rootPath);
  }

  private loadDirectory(dirPath: string, depth: number = 0): FileTreeItem[] {
    const items: FileTreeItem[] = [];

    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        // Skip hidden files unless showHidden is true
        if (!this.showHidden && entry.name.startsWith(".")) {
          continue;
        }

        // Apply file filter if provided
        if (
          this.fileFilter &&
          !entry.isDirectory() &&
          !this.fileFilter(entry.name)
        ) {
          continue;
        }

        const fullPath = path.join(dirPath, entry.name);
        const item: FileTreeItem = {
          name: entry.name,
          path: fullPath,
          isDirectory: entry.isDirectory(),
          depth,
          isExpanded: false,
          children: [],
        };

        items.push(item);
      }

      // Sort: directories first, then files, both alphabetically
      items.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error(`Error reading directory ${dirPath}:`, error);
    }

    return items;
  }

  private buildFlatList(): FileTreeItem[] {
    const flatList: FileTreeItem[] = [];

    const addItems = (items: FileTreeItem[]) => {
      for (const item of items) {
        flatList.push(item);
        if (item.isDirectory && item.isExpanded && item.children) {
          addItems(item.children);
        }
      }
    };

    addItems(this.items);
    return flatList;
  }

  private expandDirectory(item: FileTreeItem): void {
    if (!item.isDirectory || item.isExpanded) return;

    item.children = this.loadDirectory(item.path, item.depth + 1);
    item.isExpanded = true;
  }

  private collapseDirectory(item: FileTreeItem): void {
    if (!item.isDirectory || !item.isExpanded) return;

    item.isExpanded = false;
    item.children = [];
  }

  protected renderSelf(buffer: any): void {
    const flatList = this.buildFlatList();
    const visibleHeight = this.height - 4; // Account for border and title

    // Draw border and title
    buffer.drawBorder(this.x, this.y, this.width, this.height, {
      r: 0.5,
      g: 0.5,
      b: 0.5,
      a: 1,
    });
    buffer.drawText(" File Browser ", this.x + 2, this.y, {
      r: 0.8,
      g: 0.8,
      b: 0.8,
      a: 1,
    });
    buffer.drawText(`Path: ${this.rootPath}`, this.x + 2, this.y + 1, {
      r: 0.6,
      g: 0.6,
      b: 0.6,
      a: 1,
    });

    // Adjust scroll offset to keep selected item visible
    if (this.selectedIndex < this.scrollOffset) {
      this.scrollOffset = this.selectedIndex;
    } else if (this.selectedIndex >= this.scrollOffset + visibleHeight) {
      this.scrollOffset = this.selectedIndex - visibleHeight + 1;
    }

    // Draw file list
    for (
      let i = 0;
      i < visibleHeight && i + this.scrollOffset < flatList.length;
      i++
    ) {
      const itemIndex = i + this.scrollOffset;
      const item = flatList[itemIndex];
      const y = this.y + 2 + i;

      // Highlight selected item
      const isSelected = itemIndex === this.selectedIndex;
      const bgColor = isSelected
        ? { r: 0.2, g: 0.4, b: 0.8, a: 1 }
        : { r: 0, g: 0, b: 0, a: 0 };
      const textColor = isSelected
        ? { r: 1, g: 1, b: 1, a: 1 }
        : { r: 0.8, g: 0.8, b: 0.8, a: 1 };

      // Draw background for selected item
      if (isSelected) {
        for (let x = this.x + 1; x < this.x + this.width - 1; x++) {
          buffer.drawText(" ", x, y, textColor, bgColor);
        }
      }

      // Draw indentation
      const indent = "  ".repeat(item.depth);
      let displayText = indent;

      // Add expand/collapse indicator for directories
      if (item.isDirectory) {
        displayText += item.isExpanded ? "📂 " : "📁 ";
      } else {
        displayText += "📄 ";
      }

      displayText += item.name;

      // Truncate if too long
      const maxWidth = this.width - 4;
      if (displayText.length > maxWidth) {
        displayText = displayText.substring(0, maxWidth - 3) + "...";
      }

      buffer.drawText(displayText, this.x + 2, y, textColor, bgColor);
    }

    // Draw scrollbar if needed
    if (flatList.length > visibleHeight) {
      const scrollbarHeight = Math.max(
        1,
        Math.floor((visibleHeight * visibleHeight) / flatList.length)
      );
      const scrollbarPosition = Math.floor(
        (this.scrollOffset * (visibleHeight - scrollbarHeight)) /
          (flatList.length - visibleHeight)
      );

      for (let i = 0; i < visibleHeight; i++) {
        const char =
          i >= scrollbarPosition && i < scrollbarPosition + scrollbarHeight
            ? "█"
            : "░";
        buffer.drawText(char, this.x + this.width - 2, this.y + 2 + i, {
          r: 0.5,
          g: 0.5,
          b: 0.5,
          a: 1,
        });
      }
    }

    // Draw help text
    buffer.drawText(
      "Enter: Select | Space: Expand/Collapse | Esc: Cancel",
      this.x + 2,
      this.y + this.height - 1,
      { r: 0.6, g: 0.6, b: 0.6, a: 1 }
    );
  }

  public handleKeyPress(key: string): boolean {
    const flatList = this.buildFlatList();

    switch (key) {
      case "ArrowUp":
      case "k":
        if (this.selectedIndex > 0) {
          this.selectedIndex--;
        }
        return true;

      case "ArrowDown":
      case "j":
        if (this.selectedIndex < flatList.length - 1) {
          this.selectedIndex++;
        }
        return true;

      case "Enter":
        if (flatList.length > 0) {
          const selectedItem = flatList[this.selectedIndex];
          if (this.onSelect) {
            this.onSelect(selectedItem);
          }
        }
        return true;

      case " ": // Space
        if (flatList.length > 0) {
          const selectedItem = flatList[this.selectedIndex];
          if (selectedItem.isDirectory) {
            if (selectedItem.isExpanded) {
              this.collapseDirectory(selectedItem);
            } else {
              this.expandDirectory(selectedItem);
            }
          }
        }
        return true;

      case "Escape":
        if (this.onCancel) {
          this.onCancel();
        }
        return true;

      default:
        return false;
    }
  }

  public setRootPath(newPath: string): void {
    this.rootPath = newPath;
    this.selectedIndex = 0;
    this.scrollOffset = 0;
    this.items = this.loadDirectory(this.rootPath);
  }

  public getSelectedItem(): FileTreeItem | null {
    const flatList = this.buildFlatList();
    return flatList[this.selectedIndex] || null;
  }

  // Initialize the tree
  private initializeTree(): void {
    this.items = this.loadDirectory(this.rootPath);
  }
}
