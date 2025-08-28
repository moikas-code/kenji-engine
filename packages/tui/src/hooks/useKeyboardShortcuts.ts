import { useCallback } from "react";
import { useKeyboard } from "@opentui/react";

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  const handleKeyPress = useCallback((key: any) => {
    shortcuts.forEach(shortcut => {
      const matchesKey = key.name === shortcut.key;
      const matchesCtrl = shortcut.ctrl ? key.ctrl : true;
      const matchesAlt = shortcut.alt ? key.alt : true;
      const matchesShift = shortcut.shift ? key.shift : true;
      
      if (matchesKey && matchesCtrl && matchesAlt && matchesShift) {
        shortcut.action();
      }
    });
  }, [shortcuts]);

  useKeyboard(handleKeyPress);
};

export const useGlobalShortcuts = () => {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: "q",
      ctrl: true,
      action: () => process.exit(0)
    },
    {
      key: "`",
      action: () => console.log("Debug console toggle")
    }
  ];
  
  useKeyboardShortcuts(shortcuts);
};