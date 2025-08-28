export interface EditorPosition {
  line: number;
  column: number;
}

export interface EditorRange {
  start: EditorPosition;
  end: EditorPosition;
}

export interface BufferSnapshot {
  lines: string[];
  timestamp: number;
}

export class EditorBuffer {
  private lines: string[] = [''];
  private undoStack: BufferSnapshot[] = [];
  private redoStack: BufferSnapshot[] = [];
  private maxUndoSteps = 100;

  constructor(initialContent: string = '') {
    if (initialContent) {
      this.lines = initialContent.split('\n');
    }
    this.saveSnapshot();
  }

  // Basic operations
  insertText(position: EditorPosition, text: string): void {
    this.ensureLineExists(position.line);

    const line = this.lines[position.line] || '';
    const before = line.substring(0, position.column);
    const after = line.substring(position.column);

    const newLine = before + text + after;
    const newLines = newLine.split('\n');

    // Replace the current line and insert additional lines if any
    this.lines.splice(position.line, 1, ...newLines);

    this.saveSnapshot();
  }

  deleteText(range: EditorRange): void {
    this.ensureLineExists(Math.max(range.start.line, range.end.line));

    if (range.start.line === range.end.line) {
      // Same line deletion
      const line = this.lines[range.start.line] || '';
      const before = line.substring(0, range.start.column);
      const after = line.substring(range.end.column);
      this.lines[range.start.line] = before + after;
    } else {
      // Multi-line deletion
      const startLine = this.lines[range.start.line] || '';
      const endLine = this.lines[range.end.line] || '';

      const before = startLine.substring(0, range.start.column);
      const after = endLine.substring(range.end.column);

      this.lines[range.start.line] = before + after;
      this.lines.splice(range.start.line + 1, range.end.line - range.start.line);
    }

    this.saveSnapshot();
  }

  replaceText(range: EditorRange, text: string): void {
    this.deleteText(range);
    this.insertText(range.start, text);
  }

  getText(range?: EditorRange): string {
    if (!range) {
      return this.lines.join('\n');
    }

    this.ensureLineExists(Math.max(range.start.line, range.end.line));

    if (range.start.line === range.end.line) {
      const line = this.lines[range.start.line] || '';
      return line.substring(range.start.column, range.end.column);
    }

    const lines: string[] = [];
    const startLine = this.lines[range.start.line] || '';
    lines.push(startLine.substring(range.start.column));

    for (let i = range.start.line + 1; i < range.end.line; i++) {
      lines.push(this.lines[i] || '');
    }

    if (range.end.line < this.lines.length) {
      const endLine = this.lines[range.end.line] || '';
      lines.push(endLine.substring(0, range.end.column));
    }

    return lines.join('\n');
  }

  getLine(lineIndex: number): string {
    this.ensureLineExists(lineIndex);
    return this.lines[lineIndex] || '';
  }

  getLineCount(): number {
    return this.lines.length;
  }

  // Navigation helpers
  getPositionFromIndex(index: number): EditorPosition {
    let currentIndex = 0;
    for (let line = 0; line < this.lines.length; line++) {
      const lineContent = this.lines[line] || '';
      const lineLength = lineContent.length + 1; // +1 for newline
      if (currentIndex + lineLength > index) {
        return { line, column: index - currentIndex };
      }
      currentIndex += lineLength;
    }
    const lastLine = this.lines[this.lines.length - 1] || '';
    return { line: this.lines.length - 1, column: lastLine.length };
  }

  getIndexFromPosition(position: EditorPosition): number {
    let index = 0;
    for (let line = 0; line < position.line; line++) {
      const lineContent = this.lines[line] || '';
      index += lineContent.length + 1; // +1 for newline
    }
    return index + position.column;
  }

  // Undo/Redo
  undo(): boolean {
    if (this.undoStack.length > 1) {
      this.redoStack.push(this.createSnapshot());
      const previousState = this.undoStack.pop()!;
      this.lines = [...previousState.lines];
      return true;
    }
    return false;
  }

  redo(): boolean {
    const nextState = this.redoStack.pop();
    if (nextState) {
      this.undoStack.push(this.createSnapshot());
      this.lines = [...nextState.lines];
      return true;
    }
    return false;
  }

  private saveSnapshot(): void {
    this.undoStack.push(this.createSnapshot());

    // Limit undo history
    if (this.undoStack.length > this.maxUndoSteps) {
      this.undoStack.shift();
    }

    // Clear redo stack when new changes are made
    this.redoStack = [];
  }

  private createSnapshot(): BufferSnapshot {
    return {
      lines: [...this.lines],
      timestamp: Date.now()
    };
  }

  private ensureLineExists(lineIndex: number): void {
    while (this.lines.length <= lineIndex) {
      this.lines.push('');
    }
  }
}