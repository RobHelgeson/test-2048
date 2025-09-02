import {
  ANIMATION_OPACITY,
  ANIMATION_SCALES,
  AnimationState,
  AnimationType,
  getSpringConfig,
  getTimingConfig,
} from '@/constants/Animations';
import { useCallback, useMemo } from 'react';
import {
  runOnJS,
  SharedValue,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

/**
 * Position interface for animation coordinates
 */
export interface AnimationPosition {
  x: number;
  y: number;
}

/**
 * Animation configuration interface
 */
export interface AnimationConfig {
  type: AnimationType;
  duration?: number;
  delay?: number;
  onComplete?: () => void;
}

/**
 * Tile animation data interface
 */
export interface TileAnimationData {
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  scale: SharedValue<number>;
  opacity: SharedValue<number>;
  animationState: SharedValue<AnimationState>;
}

/**
 * Animation queue item interface
 */
interface AnimationQueueItem {
  id: string;
  animation: () => void;
  priority: number;
}

/**
 * Central Animation Management Hook for 2048 Game
 *
 * Provides centralized animation management using React Native Reanimated 3.
 * Handles tile sliding, merge effects, spawn animations, and complex multi-tile scenarios.
 *
 * Key Features:
 * - Performance-optimized with worklets for 60fps animations
 * - Animation state management to prevent overlapping animations
 * - Complex animation scenarios (multiple tile movements in single move)
 * - Memory management and proper animation cleanup
 * - Native driver usage for optimal performance
 */
export function useAnimations() {
  // Animation queue for managing multiple animations
  const animationQueue = useSharedValue<AnimationQueueItem[]>([]);
  const isProcessingQueue = useSharedValue(false);

  // Global animation state tracking
  const activeAnimations = useSharedValue<string[]>([]);
  const isAnimating = useSharedValue(false);

  /**
   * Provides the configuration for creating tile animation shared values
   * This should be used with useSharedValue calls at the component level
   */
  const getTileAnimationConfig = useCallback((initialPosition: AnimationPosition) => {
    return {
      translateX: initialPosition.x,
      translateY: initialPosition.y,
      scale: 1,
      opacity: ANIMATION_OPACITY.VISIBLE,
      animationState: AnimationState.IDLE,
    };
  }, []);

  /**
   * Processes the animation queue in order of priority
   */
  const processAnimationQueue = useCallback(() => {
    'worklet';
    if (isProcessingQueue.value || animationQueue.value.length === 0) {
      return;
    }

    isProcessingQueue.value = true;

    // Sort queue by priority (higher priority first)
    const sortedQueue = animationQueue.value.sort((a, b) => b.priority - a.priority);

    // Process all animations in current batch
    sortedQueue.forEach((item) => {
      item.animation();
    });

    // Clear the queue
    animationQueue.value = [];
    isProcessingQueue.value = false;
  }, [animationQueue, isProcessingQueue]);

  /**
   * Adds animation to queue with priority management
   */
  const queueAnimation = useCallback(
    (id: string, animation: () => void, priority: number = 0) => {
      'worklet';
      animationQueue.value = [...animationQueue.value, { id, animation, priority }];
    },
    [animationQueue]
  );

  /**
   * Starts tracking an animation
   */
  const startAnimation = useCallback(
    (tileId: string, animationData: TileAnimationData) => {
      'worklet';
      if (!activeAnimations.value.includes(tileId)) {
        activeAnimations.value = [...activeAnimations.value, tileId];
      }
      animationData.animationState.value = AnimationState.RUNNING;
      isAnimating.value = true;
    },
    [activeAnimations, isAnimating]
  );

  /**
   * Completes and cleans up an animation
   */
  const completeAnimation = useCallback(
    (tileId: string, animationData: TileAnimationData, onComplete?: () => void) => {
      'worklet';
      activeAnimations.value = activeAnimations.value.filter((id) => id !== tileId);

      animationData.animationState.value = AnimationState.COMPLETED;

      // Update global animation state
      if (activeAnimations.value.length === 0) {
        isAnimating.value = false;
      }

      // Call completion callback on JS thread
      if (onComplete) {
        runOnJS(onComplete)();
      }
    },
    [activeAnimations, isAnimating]
  );

  /**
   * Animates tile sliding movement with spring physics
   * @param tileId - Unique identifier for the tile
   * @param animationData - Tile's animation shared values
   * @param fromPosition - Starting position
   * @param toPosition - Target position
   * @param config - Animation configuration
   */
  const animateTileSlide = useCallback(
    (
      tileId: string,
      animationData: TileAnimationData,
      fromPosition: AnimationPosition,
      toPosition: AnimationPosition,
      config: AnimationConfig = { type: AnimationType.SLIDE }
    ) => {
      'worklet';

      startAnimation(tileId, animationData);

      const springConfig = getSpringConfig(config.type);

      // Set initial position
      animationData.translateX.value = fromPosition.x;
      animationData.translateY.value = fromPosition.y;

      // Animate to target position with spring physics
      if (config.delay) {
        // Use withDelay for proper worklet-based delay
        animationData.translateX.value = withDelay(
          config.delay,
          withSpring(toPosition.x, springConfig, (finished) => {
            'worklet';
            if (finished) {
              completeAnimation(tileId, animationData, config.onComplete);
            }
          })
        );

        animationData.translateY.value = withDelay(config.delay, withSpring(toPosition.y, springConfig));
      } else {
        animationData.translateX.value = withSpring(toPosition.x, springConfig, (finished) => {
          'worklet';
          if (finished) {
            completeAnimation(tileId, animationData, config.onComplete);
          }
        });

        animationData.translateY.value = withSpring(toPosition.y, springConfig);
      }
    },
    [startAnimation, completeAnimation]
  );

  /**
   * Animates tile merge effect with scale and opacity changes
   * @param tileId - Unique identifier for the tile
   * @param animationData - Tile's animation shared values
   * @param config - Animation configuration
   */
  const animateTileMerge = useCallback(
    (tileId: string, animationData: TileAnimationData, config: AnimationConfig = { type: AnimationType.MERGE }) => {
      'worklet';

      startAnimation(tileId, animationData);

      const timingConfig = getTimingConfig(config.type);

      // Merge animation sequence: scale up briefly, then settle
      animationData.scale.value = withSequence(
        withTiming(ANIMATION_SCALES.MERGE_SCALE, { duration: timingConfig.duration / 2 }),
        withTiming(1, { duration: timingConfig.duration / 2 }, (finished) => {
          'worklet';
          if (finished) {
            completeAnimation(tileId, animationData, config.onComplete);
          }
        })
      );

      // Subtle opacity animation for merge effect
      animationData.opacity.value = withSequence(
        withTiming(ANIMATION_OPACITY.FADE, { duration: timingConfig.duration / 3 }),
        withTiming(ANIMATION_OPACITY.VISIBLE, { duration: (timingConfig.duration * 2) / 3 })
      );
    },
    [startAnimation, completeAnimation]
  );

  /**
   * Animates new tile spawn with bounce effect
   * @param tileId - Unique identifier for the tile
   * @param animationData - Tile's animation shared values
   * @param config - Animation configuration
   */
  const animateTileSpawn = useCallback(
    (tileId: string, animationData: TileAnimationData, config: AnimationConfig = { type: AnimationType.SPAWN }) => {
      'worklet';

      startAnimation(tileId, animationData);

      const timingConfig = getTimingConfig(config.type);

      // Start from hidden and scaled down
      animationData.opacity.value = ANIMATION_OPACITY.HIDDEN;
      animationData.scale.value = ANIMATION_SCALES.MIN_SCALE;

      // Animate to visible with bounce effect
      animationData.opacity.value = withTiming(
        ANIMATION_OPACITY.VISIBLE,
        { duration: timingConfig.duration },
        (finished) => {
          'worklet';
          if (finished) {
            completeAnimation(tileId, animationData, config.onComplete);
          }
        }
      );

      animationData.scale.value = withSequence(
        withTiming(ANIMATION_SCALES.SPAWN_SCALE, { duration: timingConfig.duration / 2, easing: timingConfig.easing }),
        withTiming(1, { duration: timingConfig.duration / 2 })
      );
    },
    [startAnimation, completeAnimation]
  );

  /**
   * Animates victory tile celebration effect
   * @param tileId - Unique identifier for the tile
   * @param animationData - Tile's animation shared values
   * @param config - Animation configuration
   */
  const animateVictoryTile = useCallback(
    (tileId: string, animationData: TileAnimationData, config: AnimationConfig = { type: AnimationType.VICTORY }) => {
      'worklet';

      startAnimation(tileId, animationData);

      const springConfig = getSpringConfig(config.type);

      // Victory celebration with spring scale animation
      animationData.scale.value = withSequence(
        withSpring(ANIMATION_SCALES.VICTORY_SCALE, springConfig),
        withSpring(1, springConfig, (finished) => {
          'worklet';
          if (finished) {
            completeAnimation(tileId, animationData, config.onComplete);
          }
        })
      );
    },
    [startAnimation, completeAnimation]
  );

  /**
   * Cancels all active animations for cleanup
   */
  const cancelAllAnimations = useCallback(() => {
    'worklet';
    activeAnimations.value = [];
    isAnimating.value = false;
    animationQueue.value = [];
    isProcessingQueue.value = false;
  }, [activeAnimations, isAnimating, animationQueue, isProcessingQueue]);

  /**
   * Batch multiple tile animations with coordination
   * @param animations - Array of animation functions to execute
   * @param onAllComplete - Callback when all animations complete
   */
  const batchAnimations = useCallback(
    (animations: (() => void)[], onAllComplete?: () => void) => {
      'worklet';

      let completedCount = 0;
      const totalAnimations = animations.length;

      const checkCompletion = () => {
        'worklet';
        completedCount++;
        if (completedCount === totalAnimations && onAllComplete) {
          runOnJS(onAllComplete)();
        }
      };

      // Execute all animations with completion tracking
      animations.forEach((animation, index) => {
        queueAnimation(
          `batch-${index}`,
          () => {
            animation();
            checkCompletion();
          },
          1
        );
      });

      processAnimationQueue();
    },
    [queueAnimation, processAnimationQueue]
  );

  /**
   * Creates animated style object for tile rendering
   * Note: This should be called at the component level with proper hooks
   * @param animationData - Tile's animation shared values
   */
  const createAnimatedStyle = useCallback((animationData: TileAnimationData) => {
    // Return a style object that can be used with useAnimatedStyle
    return () => ({
      transform: [
        { translateX: animationData.translateX.value },
        { translateY: animationData.translateY.value },
        { scale: animationData.scale.value },
      ],
      opacity: animationData.opacity.value,
    });
  }, []);

  // Return the hook API
  return useMemo(
    () => ({
      // Animation state
      isAnimating,
      activeAnimations,

      // Core animation functions
      getTileAnimationConfig,
      animateTileSlide,
      animateTileMerge,
      animateTileSpawn,
      animateVictoryTile,

      // Animation management
      batchAnimations,
      queueAnimation,
      processAnimationQueue,
      cancelAllAnimations,

      // Utility functions
      createAnimatedStyle,
    }),
    [
      isAnimating,
      activeAnimations,
      getTileAnimationConfig,
      animateTileSlide,
      animateTileMerge,
      animateTileSpawn,
      animateVictoryTile,
      batchAnimations,
      queueAnimation,
      processAnimationQueue,
      cancelAllAnimations,
      createAnimatedStyle,
    ]
  );
}

export default useAnimations;
