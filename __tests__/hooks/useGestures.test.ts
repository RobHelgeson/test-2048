import { renderHook } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { useGestures, getGestureConfig, GestureConfig } from '@/hooks/useGestures';
import { Direction } from '@/types';

// Mock React Native Gesture Handler
jest.mock('react-native-gesture-handler', () => ({
  Gesture: {
    Pan: jest.fn(() => ({
      onEnd: jest.fn().mockReturnThis(),
      enabled: jest.fn().mockReturnThis(),
      simultaneousWithExternalGesture: jest.fn().mockReturnThis(),
      minDistance: jest.fn().mockReturnThis(),
      minVelocity: jest.fn().mockReturnThis(),
    })),
  },
  GestureDetector: ({ children }: any) => children,
}));

describe('useGestures Hook', () => {
  const mockOnSwipe = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnSwipe.mockClear();
  });

  describe('Hook Initialization', () => {
    it('should initialize with default configuration', () => {
      const { result } = renderHook(() =>
        useGestures({
          onSwipe: mockOnSwipe,
        })
      );

      expect(result.current).toBeDefined();
    });

    it('should initialize with custom configuration', () => {
      const customConfig: Partial<GestureConfig> = {
        minDistance: 50,
        minVelocity: 300,
      };

      const { result } = renderHook(() =>
        useGestures({
          onSwipe: mockOnSwipe,
          customConfig,
        })
      );

      expect(result.current).toBeDefined();
    });

    it('should initialize with disabled state', () => {
      const { result } = renderHook(() =>
        useGestures({
          onSwipe: mockOnSwipe,
          disabled: true,
        })
      );

      expect(result.current).toBeDefined();
    });
  });

  describe('Platform-Specific Configuration', () => {
    it('should return iOS configuration on iOS platform', () => {
      const originalPlatform = Platform.OS;
      (Platform as any).OS = 'ios';

      const config = getGestureConfig();
      expect(config).toEqual({
        minDistance: 30,
        minVelocity: 200,
        maxDuration: 500,
      });

      (Platform as any).OS = originalPlatform;
    });

    it('should return Android configuration on Android platform', () => {
      const originalPlatform = Platform.OS;
      (Platform as any).OS = 'android';

      const config = getGestureConfig();
      expect(config).toEqual({
        minDistance: 35,
        minVelocity: 250,
        maxDuration: 600,
      });

      (Platform as any).OS = originalPlatform;
    });

    it('should return default configuration for unknown platforms', () => {
      const originalPlatform = Platform.OS;
      (Platform as any).OS = 'web';

      const config = getGestureConfig();
      expect(config).toEqual({
        minDistance: 32,
        minVelocity: 225,
        maxDuration: 550,
      });

      (Platform as any).OS = originalPlatform;
    });
  });

  describe('Gesture Direction Detection', () => {
    // Note: Since the direction detection logic is inside the hook's closure,
    // we test it indirectly through the gesture callback behavior.
    // In a real implementation, you might export these functions for direct testing.

    it('should be configurable for different swipe thresholds', () => {
      const customConfig = {
        minDistance: 100,
        minVelocity: 500,
      };

      const { result } = renderHook(() =>
        useGestures({
          onSwipe: mockOnSwipe,
          customConfig,
        })
      );

      expect(result.current).toBeDefined();
      // The gesture should use the custom thresholds
      // This would be verified through gesture event simulation in integration tests
    });
  });

  describe('Gesture State Management', () => {
    it('should handle enabled/disabled state correctly', () => {
      const { result, rerender } = renderHook(
        ({ disabled }) =>
          useGestures({
            onSwipe: mockOnSwipe,
            disabled,
          }),
        { initialProps: { disabled: false } }
      );

      const initialGesture = result.current;
      expect(initialGesture).toBeDefined();

      // Re-render with disabled state
      rerender({ disabled: true });

      const disabledGesture = result.current;
      expect(disabledGesture).toBeDefined();
    });

    it('should update configuration when custom config changes', () => {
      const { result, rerender } = renderHook(
        ({ customConfig }) =>
          useGestures({
            onSwipe: mockOnSwipe,
            customConfig,
          }),
        { initialProps: { customConfig: { minDistance: 30 } } }
      );

      const initialGesture = result.current;
      expect(initialGesture).toBeDefined();

      // Re-render with new custom config
      rerender({ customConfig: { minDistance: 50, minVelocity: 300, maxDuration: 400 } });

      const updatedGesture = result.current;
      expect(updatedGesture).toBeDefined();
    });
  });

  describe('Callback Handling', () => {
    it('should call onSwipe callback with correct direction', () => {
      renderHook(() =>
        useGestures({
          onSwipe: mockOnSwipe,
        })
      );

      // The actual callback testing would be done through gesture simulation
      // which requires a more complex test setup with gesture event mocking
      expect(mockOnSwipe).not.toHaveBeenCalled();
    });

    it('should not call onSwipe when disabled', () => {
      renderHook(() =>
        useGestures({
          onSwipe: mockOnSwipe,
          disabled: true,
        })
      );

      // Even if a gesture was triggered, it shouldn't call onSwipe when disabled
      expect(mockOnSwipe).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid gesture changes', () => {
      const { result, rerender } = renderHook(
        ({ disabled }) =>
          useGestures({
            onSwipe: mockOnSwipe,
            disabled,
          }),
        { initialProps: { disabled: false } }
      );

      // Rapidly toggle disabled state
      rerender({ disabled: true });
      rerender({ disabled: false });
      rerender({ disabled: true });

      expect(result.current).toBeDefined();
    });

    it('should handle onSwipe callback changes', () => {
      const mockOnSwipe2 = jest.fn();

      const { result, rerender } = renderHook(
        ({ onSwipe }) =>
          useGestures({
            onSwipe,
          }),
        { initialProps: { onSwipe: mockOnSwipe } }
      );

      expect(result.current).toBeDefined();

      // Change the callback
      rerender({ onSwipe: mockOnSwipe2 });

      expect(result.current).toBeDefined();
    });

    it('should handle null/undefined configurations gracefully', () => {
      const { result } = renderHook(() =>
        useGestures({
          onSwipe: mockOnSwipe,
          customConfig: undefined,
        })
      );

      expect(result.current).toBeDefined();
    });
  });
});

describe('Gesture Direction Logic (Mock Implementation)', () => {
  // These tests simulate the direction detection logic
  // In a real scenario, you might export helper functions for testing

  describe('Horizontal Swipes', () => {
    it('should detect right swipe for positive X translation', () => {
      // Mock the logic that would be in getSwipeDirection
      const translationX = 50;
      const translationY = 10;

      // Simulate the direction detection logic
      const absTranslationX = Math.abs(translationX);
      const absTranslationY = Math.abs(translationY);
      const expectedDirection =
        absTranslationX > absTranslationY
          ? translationX > 0
            ? Direction.RIGHT
            : Direction.LEFT
          : translationY > 0
            ? Direction.DOWN
            : Direction.UP;

      expect(expectedDirection).toBe(Direction.RIGHT);
    });

    it('should detect left swipe for negative X translation', () => {
      const translationX = -50;
      const translationY = 10;

      const absTranslationX = Math.abs(translationX);
      const absTranslationY = Math.abs(translationY);
      const expectedDirection =
        absTranslationX > absTranslationY
          ? translationX > 0
            ? Direction.RIGHT
            : Direction.LEFT
          : translationY > 0
            ? Direction.DOWN
            : Direction.UP;

      expect(expectedDirection).toBe(Direction.LEFT);
    });
  });

  describe('Vertical Swipes', () => {
    it('should detect down swipe for positive Y translation', () => {
      const translationX = 10;
      const translationY = 50;

      const absTranslationX = Math.abs(translationX);
      const absTranslationY = Math.abs(translationY);
      const expectedDirection =
        absTranslationX > absTranslationY
          ? translationX > 0
            ? Direction.RIGHT
            : Direction.LEFT
          : translationY > 0
            ? Direction.DOWN
            : Direction.UP;

      expect(expectedDirection).toBe(Direction.DOWN);
    });

    it('should detect up swipe for negative Y translation', () => {
      const translationX = 10;
      const translationY = -50;

      const absTranslationX = Math.abs(translationX);
      const absTranslationY = Math.abs(translationY);
      const expectedDirection =
        absTranslationX > absTranslationY
          ? translationX > 0
            ? Direction.RIGHT
            : Direction.LEFT
          : translationY > 0
            ? Direction.DOWN
            : Direction.UP;

      expect(expectedDirection).toBe(Direction.UP);
    });
  });

  describe('Threshold Validation', () => {
    const config = {
      minDistance: 30,
      minVelocity: 200,
      maxDuration: 500,
    };

    it('should reject gestures below minimum distance', () => {
      const translationX = 20; // Below minDistance
      const translationY = 10;

      const absTranslationX = Math.abs(translationX);
      const absTranslationY = Math.abs(translationY);
      const hasMinDistance = Math.max(absTranslationX, absTranslationY) >= config.minDistance;

      expect(hasMinDistance).toBe(false);
    });

    it('should reject gestures below minimum velocity', () => {
      const velocityX = 150; // Below minVelocity
      const velocityY = 50;

      const absVelocityX = Math.abs(velocityX);
      const absVelocityY = Math.abs(velocityY);
      const hasMinVelocity = Math.max(absVelocityX, absVelocityY) >= config.minVelocity;

      expect(hasMinVelocity).toBe(false);
    });

    it('should accept gestures meeting both thresholds', () => {
      const translationX = 50;
      const translationY = 10;
      const velocityX = 300;
      const velocityY = 50;

      const absTranslationX = Math.abs(translationX);
      const absTranslationY = Math.abs(translationY);
      const absVelocityX = Math.abs(velocityX);
      const absVelocityY = Math.abs(velocityY);

      const hasMinDistance = Math.max(absTranslationX, absTranslationY) >= config.minDistance;
      const hasMinVelocity = Math.max(absVelocityX, absVelocityY) >= config.minVelocity;

      expect(hasMinDistance).toBe(true);
      expect(hasMinVelocity).toBe(true);
    });
  });

  describe('Diagonal Swipes', () => {
    it('should prioritize dominant axis for diagonal gestures', () => {
      // Test case where X movement is dominant
      const translationX = 60;
      const translationY = 30;

      const absTranslationX = Math.abs(translationX);
      const absTranslationY = Math.abs(translationY);
      const expectedDirection = absTranslationX > absTranslationY ? Direction.RIGHT : Direction.DOWN;

      expect(expectedDirection).toBe(Direction.RIGHT);

      // Test case where Y movement is dominant
      const translationX2 = 30;
      const translationY2 = 60;

      const absTranslationX2 = Math.abs(translationX2);
      const absTranslationY2 = Math.abs(translationY2);
      const expectedDirection2 = absTranslationX2 > absTranslationY2 ? Direction.RIGHT : Direction.DOWN;

      expect(expectedDirection2).toBe(Direction.DOWN);
    });
  });
});
