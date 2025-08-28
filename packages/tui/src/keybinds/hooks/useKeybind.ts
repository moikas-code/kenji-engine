import { useEffect, useCallback, useRef } from 'react';
import { useKeyboard } from '@opentui/react';
import { KeybindManager } from '../KeybindManager';
import { KeyEvent, KeybindHandler } from '../types';

interface UseKeybindOptions {
  context?: string;
  priority?: number;
  enabled?: boolean;
}

export function useKeybind(
  action: string,
  handler: KeybindHandler,
  options: UseKeybindOptions = {}
): void {
  const { context = 'global', priority = 50, enabled = true } = options;
  const manager = KeybindManager.getInstance();
  const handlerRef = useRef(handler);

  // Update handler ref to avoid stale closures
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  // Register/unregister handler with manager
  useEffect(() => {
    if (enabled) {
      const wrappedHandler = (event: KeyEvent) => handlerRef.current(event);
      manager.register(action, wrappedHandler, context);
      
      return () => {
        manager.unregister(action, context);
      };
    }
  }, [action, context, enabled]);

  // Activate/deactivate context
  useEffect(() => {
    if (context !== 'global' && enabled) {
      manager.activateContext(context, priority);
      
      return () => {
        manager.deactivateContext(context);
      };
    }
  }, [context, priority, enabled]);
}

export function useKeybindHandler(
  context: string = 'global',
  priority: number = 50
): void {
  const manager = KeybindManager.getInstance();

  // Activate context on mount
  useEffect(() => {
    if (context !== 'global') {
      manager.activateContext(context, priority);
      
      return () => {
        manager.deactivateContext(context);
      };
    }
  }, [context, priority]);

  // Set up global keyboard handler
  useKeyboard(useCallback((key: any) => {
    const event: KeyEvent = {
      name: key.name,
      ctrl: key.ctrl,
      alt: key.alt,
      shift: key.shift,
      meta: key.meta,
      sequence: key.sequence,
      full: key.full
    };

    // Let the manager handle the event
    manager.handleKeyEvent(event);
  }, []));
}

export function useKeybinds(
  keybinds: Record<string, KeybindHandler>,
  options: UseKeybindOptions = {}
): void {
  const { context = 'global', priority = 50, enabled = true } = options;

  // Use the handler to set up keyboard listening
  useKeybindHandler(context, priority);

  // Register all keybind handlers
  Object.entries(keybinds).forEach(([action, handler]) => {
    useKeybind(action, handler, { context, enabled });
  });
}