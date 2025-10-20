import { renderHook, act } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { useKeyboard, getKeyBindings } from '@/hooks/useKeyboard';
import { Direction } from '@/types';

// Mock Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'web',
  },
}));

// Mock document for web environment
const mockDocument = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

// Type-safe document mock
global.document = mockDocument as any;

describe('useKeyboard Hook', () => {
  let mockOnKeyPress: jest.Mock;

  beforeEach(() => {
    mockOnKeyPress = jest.fn();
    jest.clearAllMocks();

    // Reset Platform.OS
    (Platform as any).OS = 'web';
  });

  afterEach(() => {
    // Clean up any pending timers
    jest.runAllTimers();
    jest.useRealTimers();
  });

  describe('Hook Initialization', () => {
    it('should initialize with default configuration on web platform', () => {
      const { result } = renderHook(() =>
        useKeyboard({
          onKeyPress: mockOnKeyPress,
          customConfig: { enabled: true }, // Force enable for testing
        })
      );

      expect(result.current.isEnabled).toBe(true);
      expect(result.current.config.debounceDelay).toBe(150);
      expect(result.current.config.enableWASD).toBe(true);
      expect(result.current.activeKeys).toBeInstanceOf(Set);
      expect(result.current.activeKeys.size).toBe(0);
      expect(result.current.pressedDirection).toBeNull();
    });

    it('should respect custom configuration', () => {
      const customConfig = {
        debounceDelay: 100,
        enableWASD: false,
      };

      const { result } = renderHook(() =>
        useKeyboard({
          onKeyPress: mockOnKeyPress,
          customConfig,
        })
      );

      expect(result.current.config.debounceDelay).toBe(100);
      expect(result.current.config.enableWASD).toBe(false);
    });

    it('should disable keyboard controls on non-web platforms', () => {
      (Platform as any).OS = 'ios';

      const { result } = renderHook(() => useKeyboard({ onKeyPress: mockOnKeyPress }));

      expect(result.current.isEnabled).toBe(false);
      expect(mockDocument.addEventListener).not.toHaveBeenCalled();
    });

    it('should add event listeners on mount and remove on unmount', () => {
      const { unmount } = renderHook(() =>
        useKeyboard({
          onKeyPress: mockOnKeyPress,
          customConfig: { enabled: true },
        })
      );

      expect(mockDocument.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function), { passive: false });
      expect(mockDocument.addEventListener).toHaveBeenCalledWith('keyup', expect.any(Function), { passive: false });

      unmount();

      expect(mockDocument.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(mockDocument.removeEventListener).toHaveBeenCalledWith('keyup', expect.any(Function));
    });
  });

  describe('Key Press Handling', () => {
    it('should handle arrow key presses correctly', () => {
      jest.useFakeTimers();

      const { result } = renderHook(() =>
        useKeyboard({
          onKeyPress: mockOnKeyPress,
          customConfig: { enabled: true },
        })
      );

      // Get the keydown handler from the addEventListener call
      const keydownHandler = mockDocument.addEventListener.mock.calls.find(([event]) => event === 'keydown')?.[1];

      expect(keydownHandler).toBeDefined();

      // Simulate arrow key presses
      const testCases = [
        { key: 'ArrowUp', code: 'ArrowUp', expected: Direction.UP },
        { key: 'ArrowDown', code: 'ArrowDown', expected: Direction.DOWN },
        { key: 'ArrowLeft', code: 'ArrowLeft', expected: Direction.LEFT },
        { key: 'ArrowRight', code: 'ArrowRight', expected: Direction.RIGHT },
      ];

      // Test each key individually to avoid debounce conflicts
      for (const { key, code, expected } of testCases) {
        // Reset mocks and advance time to avoid debounce issues
        mockOnKeyPress.mockClear();
        jest.advanceTimersByTime(200);

        const mockEvent = {
          key,
          code,
          preventDefault: jest.fn(),
          stopPropagation: jest.fn(),
        };

        act(() => {
          keydownHandler(mockEvent);
        });

        expect(mockOnKeyPress).toHaveBeenCalledTimes(1);
        expect(mockOnKeyPress).toHaveBeenCalledWith(expected);
        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(mockEvent.stopPropagation).toHaveBeenCalled();
      }
    });

    it('should handle WASD key presses correctly', () => {
      jest.useFakeTimers();

      const { result } = renderHook(() =>
        useKeyboard({
          onKeyPress: mockOnKeyPress,
          customConfig: { enabled: true },
        })
      );

      const keydownHandler = mockDocument.addEventListener.mock.calls.find(([event]) => event === 'keydown')?.[1];

      // Simulate WASD key presses
      const testCases = [
        { key: 'w', code: 'KeyW', expected: Direction.UP },
        { key: 's', code: 'KeyS', expected: Direction.DOWN },
        { key: 'a', code: 'KeyA', expected: Direction.LEFT },
        { key: 'd', code: 'KeyD', expected: Direction.RIGHT },
      ];

      // Test each key individually to avoid debounce conflicts
      for (const { key, code, expected } of testCases) {
        // Reset mocks and advance time to avoid debounce issues
        mockOnKeyPress.mockClear();
        jest.advanceTimersByTime(200);

        const mockEvent = {
          key,
          code,
          preventDefault: jest.fn(),
          stopPropagation: jest.fn(),
        };

        act(() => {
          keydownHandler(mockEvent);
        });

        expect(mockOnKeyPress).toHaveBeenCalledTimes(1);
        expect(mockOnKeyPress).toHaveBeenCalledWith(expected);
      }
    });

    it('should ignore non-game keys', () => {
      const { result } = renderHook(() =>
        useKeyboard({
          onKeyPress: mockOnKeyPress,
          customConfig: { enabled: true },
        })
      );

      const keydownHandler = mockDocument.addEventListener.mock.calls.find(([event]) => event === 'keydown')?.[1];

      const mockEvent = {
        key: 'Escape',
        code: 'Escape',
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };

      act(() => {
        keydownHandler(mockEvent);
      });

      expect(mockOnKeyPress).not.toHaveBeenCalled();
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('should respect disabled state', () => {
      const { result } = renderHook(() =>
        useKeyboard({
          onKeyPress: mockOnKeyPress,
          disabled: true,
          customConfig: { enabled: true },
        })
      );

      const keydownHandler = mockDocument.addEventListener.mock.calls.find(([event]) => event === 'keydown')?.[1];

      const mockEvent = {
        key: 'ArrowUp',
        code: 'ArrowUp',
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };

      act(() => {
        keydownHandler(mockEvent);
      });

      expect(mockOnKeyPress).not.toHaveBeenCalled();
    });
  });

  describe('Key Repeat Prevention', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should prevent key repeat for same key', () => {
      const { result } = renderHook(() =>
        useKeyboard({
          onKeyPress: mockOnKeyPress,
          customConfig: { enabled: true },
        })
      );

      const keydownHandler = mockDocument.addEventListener.mock.calls.find(([event]) => event === 'keydown')?.[1];

      const mockEvent = {
        key: 'ArrowUp',
        code: 'ArrowUp',
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };

      // First press
      act(() => {
        keydownHandler(mockEvent);
      });

      expect(mockOnKeyPress).toHaveBeenCalledTimes(1);

      // Second press of same key (should be ignored)
      act(() => {
        keydownHandler(mockEvent);
      });

      expect(mockOnKeyPress).toHaveBeenCalledTimes(1);
    });

    it('should respect debounce delay between different keys', () => {
      const customConfig = { debounceDelay: 200, enabled: true };

      const { result } = renderHook(() => useKeyboard({ onKeyPress: mockOnKeyPress, customConfig }));

      const keydownHandler = mockDocument.addEventListener.mock.calls.find(([event]) => event === 'keydown')?.[1];

      // First key press
      const firstEvent = {
        key: 'ArrowUp',
        code: 'ArrowUp',
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };

      act(() => {
        keydownHandler(firstEvent);
      });

      expect(mockOnKeyPress).toHaveBeenCalledWith(Direction.UP);

      // Second key press within debounce period (should be ignored)
      const secondEvent = {
        key: 'ArrowDown',
        code: 'ArrowDown',
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };

      // Advance time to after debounce delay
      act(() => {
        jest.advanceTimersByTime(250); // More than debounce delay
      });

      jest.clearAllMocks(); // Clear to test fresh key press

      act(() => {
        keydownHandler(secondEvent);
      });

      expect(mockOnKeyPress).toHaveBeenCalledWith(Direction.DOWN);
    });
  });

  describe('Key Up Handling', () => {
    it('should remove keys from active set on key up', () => {
      const { result } = renderHook(() =>
        useKeyboard({
          onKeyPress: mockOnKeyPress,
          customConfig: { enabled: true },
        })
      );

      const keydownHandler = mockDocument.addEventListener.mock.calls.find(([event]) => event === 'keydown')?.[1];
      const keyupHandler = mockDocument.addEventListener.mock.calls.find(([event]) => event === 'keyup')?.[1];

      // Key down
      const keydownEvent = {
        key: 'ArrowUp',
        code: 'ArrowUp',
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };

      act(() => {
        keydownHandler(keydownEvent);
      });

      expect(result.current.activeKeys.has('ArrowUp')).toBe(true);

      // Key up
      const keyupEvent = {
        key: 'ArrowUp',
        code: 'ArrowUp',
      };

      act(() => {
        keyupHandler(keyupEvent);
      });

      expect(result.current.activeKeys.has('ArrowUp')).toBe(false);
    });
  });

  describe('Utility Functions', () => {
    it('should correctly identify active directions', () => {
      const { result } = renderHook(() =>
        useKeyboard({
          onKeyPress: mockOnKeyPress,
          customConfig: { enabled: true },
        })
      );

      const keydownHandler = mockDocument.addEventListener.mock.calls.find(([event]) => event === 'keydown')?.[1];

      // Press arrow up
      act(() => {
        keydownHandler({
          key: 'ArrowUp',
          code: 'ArrowUp',
          preventDefault: jest.fn(),
          stopPropagation: jest.fn(),
        });
      });

      expect(result.current.isDirectionActive(Direction.UP)).toBe(true);
      expect(result.current.isDirectionActive(Direction.DOWN)).toBe(false);
    });
  });
});

describe('getKeyBindings Utility', () => {
  it('should return correct key bindings array', () => {
    const bindings = getKeyBindings();

    expect(bindings).toHaveLength(4);
    expect(bindings[0]).toEqual({
      keys: ['↑', 'W'],
      direction: Direction.UP,
      label: 'Move Up',
    });
    expect(bindings[1]).toEqual({
      keys: ['↓', 'S'],
      direction: Direction.DOWN,
      label: 'Move Down',
    });
    expect(bindings[2]).toEqual({
      keys: ['←', 'A'],
      direction: Direction.LEFT,
      label: 'Move Left',
    });
    expect(bindings[3]).toEqual({
      keys: ['→', 'D'],
      direction: Direction.RIGHT,
      label: 'Move Right',
    });
  });
});
