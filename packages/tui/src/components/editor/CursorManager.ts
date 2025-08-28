import type { EditorPosition, EditorRange } from './EditorBuffer';

export class CursorManager {
  private position: EditorPosition;
  private selection: EditorRange | null = null;
  private bufferLineCount: number = 1;

  constructor(initialPosition: EditorPosition = { line: 0, column: 0 }) {
    this.position = { ...initialPosition };
  }

  // Basic movement
  moveUp(): void {
    if (this.position.line > 0) {
      this.position.line--;
      this.clampColumnToLine();
    }
  }

  moveDown(): void {
    if (this.position.line < this.bufferLineCount - 1) {
      this.position.line++;
      this.clampColumnToLine();
    }
  }

  moveLeft(): void {
    if (this.position.column > 0) {
      this.position.column--;
    } else if (this.position.line > 0) {
      this.position.line--;
      // Move to end of previous line
      this.position.column = this.getLineLength(this.position.line);
    }
  }

  moveRight(): void {
    // Allow moving beyond line end for insertion
    this.position.column++;
  }

  moveToLine(line: number): void {
    this.position.line = Math.max(0, Math.min(line, this.bufferLineCount - 1));
    this.clampColumnToLine();
  }

  moveToPosition(position: EditorPosition): void {
    this.position = { ...position };
    this.clampColumnToLine();
  }

  moveToLineStart(): void {
    this.position.column = 0;
  }

  moveToLineEnd(): void {
    this.position.column = this.getLineLength(this.position.line);
  }

  moveToBufferStart(): void {
    this.position = { line: 0, column: 0 };
  }

  moveToBufferEnd(): void {
    const lastLine = Math.max(0, this.bufferLineCount - 1);
    this.position = {
      line: lastLine,
      column: this.getLineLength(lastLine)
    };
  }

  // Page movement
  movePageUp(linesPerPage: number = 20): void {
    const targetLine = Math.max(0, this.position.line - linesPerPage);
    this.moveToLine(targetLine);
  }

  movePageDown(linesPerPage: number = 20): void {
    const targetLine = Math.min(this.bufferLineCount - 1, this.position.line + linesPerPage);
    this.moveToLine(targetLine);
  }

  // Word movement
  moveWordLeft(): void {
    if (this.position.column === 0 && this.position.line > 0) {
      this.moveUp();
      this.moveToLineEnd();
      return;
    }

    // Find previous word boundary
    const line = this.getLineContent(this.position.line) || '';
    let column = this.position.column - 1;

    // Skip whitespace
    while (column > 0 && /\s/.test(line[column] || '')) {
      column--;
    }

    // Find word boundary
    while (column > 0 && !/\s/.test(line[column - 1] || '')) {
      column--;
    }

    this.position.column = Math.max(0, column);
  }

  moveWordRight(): void {
    const line = this.getLineContent(this.position.line) || '';
    let column = this.position.column;

    // Skip current word
    while (column < line.length && !/\s/.test(line[column] || '')) {
      column++;
    }

    // Skip whitespace
    while (column < line.length && /\s/.test(line[column] || '')) {
      column++;
    }

    if (column >= line.length && this.position.line < this.bufferLineCount - 1) {
      // Move to next line
      this.moveDown();
      this.moveToLineStart();
    } else {
      this.position.column = column;
    }
  }

  // Selection
  selectRange(range: EditorRange): void {
    this.selection = { ...range };
  }

  selectAll(): void {
    this.selection = {
      start: { line: 0, column: 0 },
      end: {
        line: this.bufferLineCount - 1,
        column: this.getLineLength(this.bufferLineCount - 1)
      }
    };
  }

  clearSelection(): void {
    this.selection = null;
  }

  // Getters
  getPosition(): EditorPosition {
    return { ...this.position };
  }

  getSelection(): EditorRange | null {
    return this.selection ? { ...this.selection } : null;
  }

  hasSelection(): boolean {
    return this.selection !== null;
  }

  // Buffer integration
  updateBufferInfo(lineCount: number, getLineContent: (line: number) => string): void {
    this.bufferLineCount = lineCount;
    this.getLineContent = getLineContent;
    this.clampColumnToLine();
  }

  // Private helpers
  private getLineContent: (line: number) => string = () => '';

  private getLineLength(line: number): number {
    return this.getLineContent(line).length;
  }

  private clampColumnToLine(): void {
    const lineLength = this.getLineLength(this.position.line);
    if (this.position.column > lineLength) {
      this.position.column = lineLength;
    }
  }
}