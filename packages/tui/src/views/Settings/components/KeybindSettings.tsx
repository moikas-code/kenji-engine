import { useState, useCallback, useMemo } from 'react';
import { KeybindManager } from '../../../keybinds/KeybindManager';
import SelectMenu from '../../../components/SelectMenu';
import type { Keybind } from '../../../keybinds/types';

export const KeybindSettings = () => {
  const manager = KeybindManager.getInstance();
  const [currentPreset, setCurrentPreset] = useState(manager.getCurrentPreset());
  const [selectedKeybind, setSelectedKeybind] = useState<Keybind | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const presetOptions = useMemo(() => {
    return manager.getAvailablePresets().map(preset => ({
      name: preset.charAt(0).toUpperCase() + preset.slice(1),
      value: preset,
      description: getPresetDescription(preset)
    }));
  }, []);

  const handlePresetChange = useCallback(async (preset: string) => {
    try {
      await manager.switchPreset(preset as "default" | "vim" | "emacs");
      setCurrentPreset(preset);
      setStatusMessage(`Switched to ${preset} preset`);
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (error) {
      setStatusMessage(`Failed to switch preset: ${error}`);
    }
  }, []);

  const keybinds = useMemo(() => {
    return manager.getKeybindsForCurrentContext();
  }, [currentPreset]);

  const groupedKeybinds = useMemo(() => {
    return keybinds.reduce((acc: Record<string, Keybind[]>, kb: Keybind) => {
      const category = kb.action.split('.')[0] || 'general';
      if (!acc[category]) acc[category] = [];
      acc[category].push(kb);
      return acc;
    }, {});
  }, [keybinds]);

  const handleKeybindEdit = useCallback((keybind: Keybind) => {
    setSelectedKeybind(keybind);
    setIsEditing(true);
    setStatusMessage('Press new key combination...');
  }, []);

  const handleResetToDefaults = useCallback(async () => {
    await manager.saveUserOverrides([]);
    setStatusMessage('Reset all keybinds to defaults');
    setTimeout(() => setStatusMessage(''), 3000);
  }, []);

  function getPresetDescription(preset: string): string {
    switch (preset) {
      case 'vim':
        return 'Vi/Vim style navigation and commands';
      case 'emacs':
        return 'Emacs style keybindings';
      case 'default':
      default:
        return 'Standard keybindings';
    }
  }

  return (
    <box style={{ flexDirection: 'column', padding: 2 }}>
      <text style={{ marginBottom: 2 }}>⌨️  Keyboard Shortcuts</text>
      
      {/* Preset Selection */}
      <box style={{ flexDirection: 'column', marginBottom: 2 }}>
        <text style={{ marginBottom: 1 }}>Preset:</text>
        <SelectMenu
          options={presetOptions}
          onSelect={(value) => handlePresetChange(value)}
        />
      </box>

      {/* Keybind List */}
      <box style={{ flexDirection: 'column', flexGrow: 1, marginTop: 2 }}>
        <text style={{ marginBottom: 1 }}>Current Keybindings:</text>
        <box style={{ flexDirection: 'column', maxHeight: 20 }}>
          {Object.entries(groupedKeybinds).map(([category, bindings]) => (
            <box key={category} style={{ flexDirection: 'column', marginBottom: 1 }}>
              <text style={{ marginBottom: 0.5 }}>{category.toUpperCase()}</text>
              {bindings.map((binding) => (
                <box key={binding.id} style={{ flexDirection: 'row', marginLeft: 2, marginBottom: 0.5 }}>
                  <text style={{ width: 15 }}>
                    {binding.modifiers?.join('+')}{binding.modifiers?.length ? '+' : ''}{binding.key}
                  </text>
                  <text style={{ width: 25 }}>{binding.description || binding.action}</text>
                  <text>[Edit]</text>
                </box>
              ))}
            </box>
          ))}
        </box>
      </box>

      {/* Status Bar */}
      <box style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2, paddingTop: 1, borderStyle: 'single' }}>
        <text>{statusMessage}</text>
        <text>[Reset to Defaults]</text>
      </box>

      {/* Edit Modal (simplified) */}
      {isEditing && selectedKeybind && (
        <box style={{ 
          position: 'absolute',
          top: '40%',
          left: '30%',
          width: '40%',
          padding: 2,
          borderStyle: 'rounded',
          backgroundColor: '#2a2a2a'
        }}>
          <box style={{ flexDirection: 'column' }}>
            <text>Editing: {selectedKeybind.description}</text>
            <text style={{ marginTop: 1 }}>Current: {selectedKeybind.key}</text>
            <text style={{ marginTop: 1 }}>Press new key or ESC to cancel</text>
          </box>
        </box>
      )}
    </box>
  );
};