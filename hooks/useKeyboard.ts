import { Direction } from '@/types';
import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

/**
 * Configuration interface for keyboard input handling
 */
interface KeyboardConfig {
  /** Debounce delay in milliseconds to prevent key repeat */
  debounceDelay: number;
  /** Whether WASD keys are enabled alongside arrow keys */
  enableWASD: boolean;
  /** Whether keyboard controls are enabled (auto-detects web platform) */
  enabled: boolean;
}

/**
 * Default configuration optimized for responsive gameplay
 */
const DEFAULT_CONFIG: KeyboardConfig = {
  debounceDelay: 150,
  enableWASD: true,
  enabled: Platform.OS === 'web' || typeof document !== 'undefined',
};

/**
 * Key mapping for direction controls
 */
const KEY_MAPPINGS: Record<string, Direction> = {
  // Arrow keys
  ArrowUp: Direction.UP,
  ArrowDown: Direction.DOWN,
  ArrowLeft: Direction.LEFT,
  ArrowRight: Direction.RIGHT,
  // WASD keys
  KeyW: Direction.UP,
  KeyS: Direction.DOWN,
  KeyA: Direction.LEFT,
  KeyD: Direction.RIGHT,
  // Alternative lowercase mapping for compatibility
  w: Direction.UP,
  s: Direction.DOWN,
  a: Direction.LEFT,
  d: Direction.RIGHT,
};

/**
 * Props interface for the useKeyboard hook
 */
interface UseKeyboardProps {
  /**
   * Callback function executed when a valid keyboard input is detected
   * @param direction - The direction corresponding to the pressed key
   */
  onKeyPress: (direction: Direction) => void;

  /**
   * Whether keyboard handling is currently disabled (e.g., during animations)
   */
  disabled?: boolean;

  /**
   * Optional custom keyboard configuration to override defaults
   */
  customConfig?: Partial<KeyboardConfig>;
}

/**
 * Hook state interface for tracking active keys and pressed states
 */
interface KeyboardState {
  /** Set of currently active key codes */
  activeKeys: Set<string>;
  /** Timestamp of last key press for visual feedback */
  lastKeyPress: number;
  /** Currently pressed direction for visual feedback */
  pressedDirection: Direction | null;
}

/**
 * Custom hook for handling keyboard input on web platform.
 *
 * Provides comprehensive keyboard controls for the 2048 game with support for
 * both arrow keys and WASD bindings. Includes key repeat prevention, debouncing,
 * platform detection, and visual feedback support.
 *
 * Features:
 * - Arrow key support (ArrowUp, ArrowDown, ArrowLeft, ArrowRight)
 * - WASD key support (W, A, S, D)
 * - Automatic web platform detection
 * - Key repeat prevention with configurable debouncing
 * - Active key state tracking for visual feedback
 * - Proper event cleanup and memory management
 * - Accessibility compliance with keyboard navigation standards
 *
 * @param props Configuration object with onKeyPress callback and options
 * @returns Object with keyboard state and utility functions
 *
 * @example
 * ```typescript
 * const GameBoard = () => {
 *   const { activeKeys, pressedDirection } = useKeyboard({
 *     onKeyPress: (direction) => gameStore.makeMove(direction),
 *     disabled: isAnimating
 *   });
 *
 *   return (
 *     <View tabIndex={0}>
 *       Board content with keyboard support
 *     </View>
 *   );
 * };
 * ```
 */
export function useKeyboard({ onKeyPress, disabled = false, customConfig }: UseKeyboardProps) {
  // Merge default config with custom overrides
  const config: KeyboardConfig = {
    ...DEFAULT_CONFIG,
    ...customConfig,
  };

  // Ref for tracking keyboard state
  const stateRef = useRef<KeyboardState>({
    activeKeys: new Set(),
    lastKeyPress: 0,
    pressedDirection: null,
  });

  // Ref for debouncing timer
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Maps keyboard event key to game direction
   * Supports both event.key and event.code formats for maximum compatibility
   */
  const getDirectionFromKey = useCallback((key: string, code: string): Direction | null => {
    // First try the code (more reliable for keyboard layouts)
    if (KEY_MAPPINGS[code]) {
      return KEY_MAPPINGS[code];
    }

    // Fallback to key value
    if (KEY_MAPPINGS[key]) {
      return KEY_MAPPINGS[key];
    }

    return null;
  }, []);

  /**
   * Handles keyboard down events with debouncing and validation
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Early return if disabled or not web platform
      if (disabled || !config.enabled) {
        return;
      }

      const { key, code } = event;
      const direction = getDirectionFromKey(key, code);

      // Only handle game control keys
      if (!direction) {
        return;
      }

      // Prevent default browser behavior for game keys
      event.preventDefault();
      event.stopPropagation();

      const now = Date.now();
      const currentState = stateRef.current;

      // Check if key is already being pressed (prevent key repeat)
      if (currentState.activeKeys.has(code) || currentState.activeKeys.has(key)) {
        return;
      }

      // Add key to active keys set
      currentState.activeKeys.add(code);
      currentState.activeKeys.add(key);

      // Check debounce timing
      if (now - currentState.lastKeyPress < config.debounceDelay) {
        return;
      }

      // Update state
      currentState.lastKeyPress = now;
      currentState.pressedDirection = direction;

      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Execute key press callback
      onKeyPress(direction);

      // Set timer to clear pressed direction for visual feedback
      debounceTimerRef.current = setTimeout(() => {
        stateRef.current.pressedDirection = null;
      }, 200);
    },
    [disabled, config.enabled, config.debounceDelay, getDirectionFromKey, onKeyPress]
  );

  /**
   * Handles keyboard up events to track key release
   */
  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (!config.enabled) {
        return;
      }

      const { key, code } = event;
      const direction = getDirectionFromKey(key, code);

      // Only handle game control keys
      if (!direction) {
        return;
      }

      // Remove key from active keys set
      stateRef.current.activeKeys.delete(code);
      stateRef.current.activeKeys.delete(key);
    },
    [config.enabled, getDirectionFromKey]
  );

  /**
   * Effect to set up keyboard event listeners on web platform
   */
  useEffect(() => {
    if (!config.enabled || typeof document === 'undefined') {
      return;
    }

    // Add event listeners to document for global keyboard handling
    document.addEventListener('keydown', handleKeyDown, { passive: false });
    document.addEventListener('keyup', handleKeyUp, { passive: false });

    // Cleanup function to remove event listeners
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);

      // Clear any pending debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      // Clear active keys
      stateRef.current.activeKeys.clear();
      stateRef.current.pressedDirection = null;
    };
  }, [config.enabled, handleKeyDown, handleKeyUp]);

  /**
   * Return keyboard state and utilities
   */
  return {
    /** Set of currently active key codes */
    activeKeys: stateRef.current.activeKeys,
    /** Currently pressed direction for visual feedback */
    pressedDirection: stateRef.current.pressedDirection,
    /** Whether keyboard controls are enabled */
    isEnabled: config.enabled,
    /** Current configuration */
    config,
    /** Utility function to check if a specific direction key is active */
    isDirectionActive: (direction: Direction): boolean => {
      const keys = Object.entries(KEY_MAPPINGS)
        .filter(([, dir]) => dir === direction)
        .map(([key]) => key);

      return keys.some((key) => stateRef.current.activeKeys.has(key));
    },
  };
}

/**
 * Utility function to get supported key bindings for display
 */
export function getKeyBindings(): { keys: string[]; direction: Direction; label: string }[] {
  return [
    { keys: ['↑', 'W'], direction: Direction.UP, label: 'Move Up' },
    { keys: ['↓', 'S'], direction: Direction.DOWN, label: 'Move Down' },
    { keys: ['←', 'A'], direction: Direction.LEFT, label: 'Move Left' },
    { keys: ['→', 'D'], direction: Direction.RIGHT, label: 'Move Right' },
  ];
}

/**
 * Type exports for external usage
 */
export type { KeyboardConfig, UseKeyboardProps };
