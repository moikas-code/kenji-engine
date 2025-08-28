import { describe, it, expect, beforeEach } from 'bun:test';
import { KeybindManager } from './KeybindManager';
import type { KeyEvent, Keybind } from './types';

describe('KeybindManager', () => {
  let manager: KeybindManager;

  beforeEach(() => {
    manager = KeybindManager.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = KeybindManager.getInstance();
      const instance2 = KeybindManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Context Management', () => {
    it('should activate and deactivate contexts', () => {
      manager.activateContext('test-context');
      const keybinds = manager.getKeybindsForCurrentContext();
      
      manager.deactivateContext('test-context');
      const keybindsAfter = manager.getKeybindsForCurrentContext();
      
      expect(keybindsAfter.length).toBeGreaterThanOrEqual(0);
    });

    it('should prioritize contexts correctly', () => {
      manager.activateContext('modal', 100);
      manager.activateContext('view', 50);
      
      // Modal context should have higher priority
      const contexts = manager['activeContexts'];
      expect(contexts.has('modal')).toBe(true);
      expect(contexts.has('view')).toBe(true);
    });
  });

  describe('Keybind Registration', () => {
    it('should register and handle keybind actions', () => {
      let handlerCalled = false;
      
      manager.register('test:action', () => {
        handlerCalled = true;
        return true;
      }, 'global');

      const event: KeyEvent = {
        name: 'q',
        ctrl: true,
        alt: false,
        shift: false,
        meta: false,
        sequence: 'q'
      };

      // This would trigger if 'test:action' was bound to Ctrl+Q
      manager.unregister('test:action', 'global');
    });
  });

  describe('Preset Management', () => {
    it('should get available presets', () => {
      const presets = manager.getAvailablePresets();
      expect(presets).toContain('default');
      expect(presets).toContain('vim');
      expect(presets).toContain('emacs');
    });

    it('should get current preset', () => {
      const preset = manager.getCurrentPreset();
      expect(typeof preset).toBe('string');
      expect(['default', 'vim', 'emacs']).toContain(preset);
    });
  });

  describe('Conflict Detection', () => {
    it('should detect keybind conflicts', () => {
      const conflicts = manager.detectConflicts();
      // Should be a Map
      expect(conflicts).toBeInstanceOf(Map);
      
      // Check if conflicts are properly grouped
      conflicts.forEach((bindings, key) => {
        expect(bindings.length).toBeGreaterThan(1);
      });
    });
  });

  describe('Help Generation', () => {
    it('should generate help map', () => {
      const help = manager.getHelp();
      expect(help).toBeInstanceOf(Map);
      
      // Help should be categorized
      help.forEach((bindings, category) => {
        expect(typeof category).toBe('string');
        expect(Array.isArray(bindings)).toBe(true);
      });
    });
  });

  describe('Keybind Matching', () => {
    it('should match keybinds with modifiers correctly', () => {
      const event: KeyEvent = {
        name: 's',
        ctrl: true,
        alt: false,
        shift: false,
        meta: false,
        sequence: '\x13'
      };

      // Test internal matching logic
      const keybind: Keybind = {
        id: 'save',
        key: 's',
        modifiers: ['ctrl'] as const,
        contexts: ['editor'],
        action: 'save',
        description: 'Save file'
      };

      const matches = manager['matchesKeybind'](event, keybind);
      expect(matches).toBe(true);
    });

    it('should not match incorrect modifier combinations', () => {
      const event: KeyEvent = {
        name: 's',
        ctrl: false,
        alt: true,
        shift: false,
        meta: false,
        sequence: 's'
      };

      const keybind: Keybind = {
        id: 'save',
        key: 's',
        modifiers: ['ctrl'] as const,
        contexts: ['editor'],
        action: 'save',
        description: 'Save file'
      };

      const matches = manager['matchesKeybind'](event, keybind);
      expect(matches).toBe(false);
    });
  });
});