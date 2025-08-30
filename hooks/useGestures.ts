import { Platform } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { Direction } from '@/types';

/**
 * Configuration interface for gesture thresholds and platform-specific tuning
 */
interface GestureConfig {
  /** Minimum distance in points for a swipe to be recognized */
  minDistance: number;
  /** Minimum velocity in points/second for a swipe to be recognized */
  minVelocity: number;
  /** Maximum time in milliseconds for a gesture to be considered a swipe */
  maxDuration: number;
}

/**
 * Platform-specific gesture configurations optimized for iOS and Android feel
 */
const GESTURE_CONFIG: Record<string, GestureConfig> = {
  ios: {
    minDistance: 30,
    minVelocity: 200,
    maxDuration: 500,
  },
  android: {
    minDistance: 35,
    minVelocity: 250,
    maxDuration: 600,
  },
  default: {
    minDistance: 32,
    minVelocity: 225,
    maxDuration: 550,
  },
};

/**
 * Props interface for the useGestures hook
 */
interface UseGesturesProps {
  /**
   * Callback function that will be called when a valid swipe gesture is detected
   * @param direction - The direction of the swipe (up, down, left, right)
   */
  onSwipe: (direction: Direction) => void;

  /**
   * Whether gesture handling is currently disabled (e.g., during animations)
   */
  disabled?: boolean;

  /**
   * Optional custom gesture configuration to override platform defaults
   */
  customConfig?: Partial<GestureConfig>;
}

/**
 * Custom hook for handling four-directional swipe gestures on the game board.
 *
 * Provides platform-optimized gesture recognition with proper thresholds for
 * reliable swipe detection while preventing accidental moves. Integrates with
 * React Native Gesture Handler for native-level gesture recognition.
 *
 * Features:
 * - Four-directional swipe recognition (up, down, left, right)
 * - Platform-specific tuning for iOS and Android
 * - Configurable distance and velocity thresholds
 * - Gesture validation to prevent accidental moves
 * - Proper gesture state handling and cleanup
 *
 * @param props Configuration object with onSwipe callback and options
 * @returns Gesture object ready to be attached to a component
 *
 * @example
 * ```typescript
 * const GameBoard = () => {
 *   const gesture = useGestures({
 *     onSwipe: (direction) => gameStore.makeMove(direction),
 *     disabled: isAnimating
 *   });
 *
 *   return (
 *     <GestureDetector gesture={gesture}>
 *       <View>Board content</View>
 *     </GestureDetector>
 *   );
 * };
 * ```
 */
export function useGestures({ onSwipe, disabled = false, customConfig }: UseGesturesProps) {
  // Get platform-specific configuration
  const config = {
    ...(GESTURE_CONFIG[Platform.OS] || GESTURE_CONFIG.default),
    ...customConfig,
  };

  // Gesture validation logic has been moved inline to the worklet for performance

  /**
   * Create the pan gesture with proper configuration and handling
   */
  const panGesture = Gesture.Pan()
    .onEnd((event) => {
      'worklet';
      const { translationX, translationY, velocityX, velocityY } = event;

      // Validate gesture state
      if (disabled) {
        return;
      }

      // Calculate absolute values for comparison
      const absTranslationX = Math.abs(translationX);
      const absTranslationY = Math.abs(translationY);
      const absVelocityX = Math.abs(velocityX);
      const absVelocityY = Math.abs(velocityY);

      // Determine if gesture meets minimum distance requirements
      const hasMinDistance = Math.max(absTranslationX, absTranslationY) >= config.minDistance;

      // Determine if gesture meets minimum velocity requirements
      const hasMinVelocity = Math.max(absVelocityX, absVelocityY) >= config.minVelocity;

      if (!hasMinDistance || !hasMinVelocity) {
        return;
      }

      // Determine primary direction based on which axis has greater movement
      let direction: Direction;
      if (absTranslationX > absTranslationY) {
        // Horizontal swipe
        direction = translationX > 0 ? Direction.RIGHT : Direction.LEFT;
      } else {
        // Vertical swipe
        direction = translationY > 0 ? Direction.DOWN : Direction.UP;
      }

      // Execute the swipe callback on JS thread
      runOnJS(onSwipe)(direction);
    })
    .enabled(!disabled)
    .simultaneousWithExternalGesture()
    .minDistance(config.minDistance)
    .minVelocity(config.minVelocity);

  return panGesture;
}

/**
 * Utility function to get current gesture configuration for debugging/testing
 * @returns Current platform-specific gesture configuration
 */
export function getGestureConfig(): GestureConfig {
  return GESTURE_CONFIG[Platform.OS] || GESTURE_CONFIG.default;
}

/**
 * Type export for external usage
 */
export type { GestureConfig, UseGesturesProps };
