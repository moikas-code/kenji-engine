import { useState, useEffect, memo, useCallback } from "react";
import { useKeyboard } from "@opentui/react";
import { EditorBuffer } from "../components/editor/EditorBuffer";
import { CursorManager } from "../components/editor/CursorManager";
import { themeColors } from "../shared/colors";
import { useKeybinds } from "../keybinds";

interface NativeEditorViewProps {
  filePath: string;
  initialContent?: string;
  onSave?: (content: string) => void;
  onClose?: () => void;
}

const NativeEditorView = (props: NativeEditorViewProps) => {
  // Convert from SolidJS createSignal to React useState
  const [buffer, setBuffer] = useState(() => new EditorBuffer(props.initialContent || ''));
  const [cursor, setCursor] = useState(() => new CursorManager());
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [isModified, setIsModified] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Update cursor manager with buffer info
  const updateCursorBufferInfo = () => {
    cursor.updateBufferInfo(
      buffer.getLineCount(),
      (line) => buffer.getLine(line)
    );
  };

  // Convert from SolidJS onMount to React useEffect
  useEffect(() => {
    updateCursorBufferInfo();
    setStatusMessage(`Opened ${props.filePath}`);
    const timer = setTimeout(() => setStatusMessage(''), 2000);
    return () => clearTimeout(timer);
  }, [props.filePath]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear any pending timers
      const timers = (globalThis as any).__editorTimers || [];
      timers.forEach((timer: NodeJS.Timeout) => clearTimeout(timer));
      (globalThis as any).__editorTimers = [];
    };
  }, []);

  // Handle keyboard input - Convert from SolidJS useKeyHandler to React useKeyboard
  useKeyboard((key) => {
    if (key.name === "escape") {
      if (isModified) {
        setStatusMessage('⚠️ You have unsaved changes. Press Ctrl+S to save or ESC again to discard.');
        setTimeout(() => setStatusMessage(''), 5000);
      } else {
        props.onClose?.();
      }
      return;
    }

    // Handle special keys
    if (key.ctrl) {
      switch (key.name) {
        case "s":
          // Save
          const content = buffer.getText();
          props.onSave?.(content);
          setIsModified(false);
          setStatusMessage('✅ File saved');
          setTimeout(() => setStatusMessage(''), 2000);
          return;
        case "z":
          // Undo
          if (buffer.undo()) {
            setIsModified(true);
            updateCursorBufferInfo();
          }
          return;
        case "y":
          // Redo
          if (buffer.redo()) {
            setIsModified(true);
            updateCursorBufferInfo();
          }
          return;
        case "a":
          // Select all
          cursor.selectAll();
          return;
      }
    }

    // Handle regular input
    if (key.name === "return") {
      // Insert newline
      buffer.insertText(cursor.getPosition(), '\n');
      cursor.moveDown();
      cursor.moveToLineStart();
      setIsModified(true);
    } else if (key.name === "backspace") {
      // Delete character
      const pos = cursor.getPosition();
      if (pos.column > 0 || pos.line > 0) {
        const deletePos = pos.column > 0
          ? { line: pos.line, column: pos.column - 1 }
          : { line: pos.line - 1, column: buffer.getLine(pos.line - 1).length };

        buffer.deleteText({
          start: deletePos,
          end: pos
        });
        cursor.moveToPosition(deletePos);
        setIsModified(true);
      }
    } else if (key.name === "tab") {
      // Insert tab or spaces
      const tabSize = 2;
      const spaces = ' '.repeat(tabSize);
      buffer.insertText(cursor.getPosition(), spaces);
      for (let i = 0; i < tabSize; i++) {
        cursor.moveRight();
      }
      setIsModified(true);
    } else if (key.name === "upArrow") {
      cursor.moveUp();
    } else if (key.name === "downArrow") {
      cursor.moveDown();
    } else if (key.name === "leftArrow") {
      cursor.moveLeft();
    } else if (key.name === "rightArrow") {
      cursor.moveRight();
    } else if (key.name === "home") {
      cursor.moveToLineStart();
    } else if (key.name === "end") {
      cursor.moveToLineEnd();
    } else if (key.name === "pageUp") {
      cursor.movePageUp();
    } else if (key.name === "pageDown") {
      cursor.movePageDown();
    } else if (key.raw && key.raw.length === 1) {
      // Insert regular character
      buffer.insertText(cursor.getPosition(), key.raw);
      cursor.moveRight();
      setIsModified(true);
    }

    updateCursorBufferInfo();
  });

  // Render line with cursor
  const renderLine = (lineIndex: number): string => {
    const line = buffer.getLine(lineIndex);
    const cursorPos = cursor.getPosition();

    if (lineIndex === cursorPos.line) {
      // Line with cursor - we'll use a simple representation
      const before = line.substring(0, cursorPos.column);
      const after = line.substring(cursorPos.column);
      return `${before}█${after}`;
    } else {
      // Regular line
      return line;
    }
  };

  return (
    <group
      style={{
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Header */}
      <group
        style={{
          flexDirection: "column",
          padding: 1,
        }}
      >
        <text
          style={{
            fg: themeColors.hex.accent,
          }}
        >
          ┌─ Native Editor ──────────────────────────────────────────────────────┐
        </text>
        <text
          style={{
            fg: themeColors.hex.muted,
            marginTop: 0,
          }}
        >
          │ {props.filePath} {isModified ? '[Modified]' : ''} │
        </text>
        <text
          style={{
            fg: "#666666",
          }}
        >
          └─────────────────────────────────────────────────────────────────────┘
        </text>
      </group>

      {/* Status Message */}
      {statusMessage && (
        <group
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 1,
            marginBottom: 1,
          }}
        >
          <text
            style={{
              fg: statusMessage.startsWith("✅")
                ? themeColors.hex.success
                : statusMessage.startsWith("❌")
                  ? "#FF453A"
                  : statusMessage.startsWith("⚠️")
                    ? "#FF9F0A"
                    : themeColors.hex.accent,
            }}
          >
            {statusMessage.substring(0, 2)}
          </text>
          <text
            style={{
              fg: "#FFFFFF",
              marginLeft: 1,
            }}
          >
            {statusMessage.substring(2)}
          </text>
        </group>
      )}

      {/* Editor Content */}
      <group
        style={{
          flexDirection: "row",
          padding: 1,
        }}
      >
        {/* Line Numbers */}
        {showLineNumbers && (
          <group
            style={{
              flexDirection: "column",
              width: 4,
              marginRight: 1,
            }}
          >
            {Array.from({ length: buffer.getLineCount() }, (_, i) => (
              <text
                key={i}
                style={{
                  fg: themeColors.hex.muted,
                }}
              >
                {(i + 1).toString().padStart(3, ' ')}
              </text>
            ))}
          </group>
        )}

        {/* Text Area */}
        <group
          style={{
            flexDirection: "column",
          }}
        >
          {Array.from({ length: buffer.getLineCount() }, (_, i) => (
            <group
              key={i}
              style={{
                flexDirection: "row",
              }}
            >
              <text style={{ fg: themeColors.hex.foreground }}>
                {renderLine(i)}
              </text>
            </group>
          ))}
        </group>
      </group>

      {/* Footer */}
      <group
        style={{
          flexDirection: "column",
          padding: 1,
        }}
      >
        <text style={{ fg: themeColors.hex.muted }}>
          Ctrl+S Save • Ctrl+Z Undo • Ctrl+Y Redo • Ctrl+A Select All • ESC Close
        </text>
        <text style={{ fg: themeColors.hex.muted }}>
          Cursor: {cursor.getPosition().line + 1}:{cursor.getPosition().column + 1} • Lines: {buffer.getLineCount()}
        </text>
      </group>
    </group>
  );
};

export default memo(NativeEditorView);
