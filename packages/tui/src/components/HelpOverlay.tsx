import React, { useEffect, useMemo } from 'react';
import { KeybindManager } from '../keybinds/KeybindManager';
import { useTerminalDimensionsContext } from '../provider';
import type { Keybind } from '../keybinds/types';

interface HelpOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  context?: string;
}

export const HelpOverlay = ({ isOpen, onClose, context = 'global' }: HelpOverlayProps) => {
  const { width, height } = useTerminalDimensionsContext();
  const manager = KeybindManager.getInstance();
  
  const keybinds = useMemo(() => {
    return manager.getKeybindsForContext(context);
  }, [context]);

  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyPress = (data: Buffer) => {
      const key = data.toString();
      if (key === '\x1B' || key === '?' || key === 'q') {  // ESC, ?, or q
        onClose();
      }
    };

    process.stdin.on('data', handleKeyPress);
    return () => {
      process.stdin.off('data', handleKeyPress);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const groupedKeybinds = keybinds.reduce((acc: Record<string, Keybind[]>, kb: Keybind) => {
    const category = kb.action.split('.')[0] || 'general';
    if (!acc[category]) acc[category] = [];
    acc[category].push(kb);
    return acc;
  }, {});

  const overlayWidth = Math.min(80, width - 10);
  const overlayHeight = Math.min(40, height - 4);
  const marginX = Math.floor((width - overlayWidth) / 2);
  const marginY = Math.floor((height - overlayHeight) / 2);

  return (
    <box
      style={{
        position: 'absolute',
        width,
        height,
        top: 0,
        left: 0,
        backgroundColor: '#000000',
      }}
    >
      <box
        style={{
          flexDirection: 'column',
          borderStyle: 'rounded',
          borderColor: '#00ffff',
          padding: 2,
          width: overlayWidth,
          height: overlayHeight,
          marginLeft: marginX,
          marginTop: marginY,
          backgroundColor: '#1a1a1a',
        }}
      >
        <box style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 }}>
          <text>⌨️  Keyboard Shortcuts</text>
          <text>Press ESC, Q, or ? to close</text>
        </box>
        
        <box style={{ borderStyle: 'single', borderColor: '#808080', marginBottom: 1 }} />
        
        <box style={{ flexDirection: 'column', flexGrow: 1 }}>
          {Object.entries(groupedKeybinds).map(([category, bindings]) => (
            <box key={category} style={{ flexDirection: 'column', marginBottom: 2 }}>
              <text style={{ marginBottom: 1 }}>
                {category.toUpperCase()}
              </text>
              {bindings.map((binding) => (
                <box key={binding.action} style={{ flexDirection: 'row', marginLeft: 2, marginBottom: 0.5 }}>
                  <text style={{ width: 20 }}>
                    {Array.isArray(binding.key) ? binding.key.join(', ') : binding.key}
                  </text>
                  <text>
                    {binding.description || binding.action}
                  </text>
                </box>
              ))}
            </box>
          ))}
        </box>
        
        <box style={{ borderStyle: 'single', borderColor: '#808080', marginTop: 1 }} />
        <box style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 1 }}>
          <text>Context: {context}</text>
        </box>
      </box>
    </box>
  );
};