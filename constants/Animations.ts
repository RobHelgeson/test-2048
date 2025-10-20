import { Easing } from 'react-native-reanimated';

/**
 * Animation Configuration System for 2048 Tile Animations
 *
 * Provides centralized configuration for all game animations using React Native Reanimated 3.
 * All animations use native driver for 60fps performance optimization.
 *
 * Key Requirements:
 * - Tile sliding animations: ~200ms duration for snappy feel
 * - Tile merge animations: ~100ms duration with visual effects
 * - Animation timing functions provide satisfying, natural movement
 * - Performance optimization ensures 60fps during animations per NFR1
 */

/**
 * Animation duration constants in milliseconds
 * Based on UX requirements for snappy, satisfying game feel
 */
export const ANIMATION_DURATIONS = {
  /** Tile sliding animation duration for movement - 200ms for snappy feel */
  SLIDE: 200,
  /** Tile merge animation duration - 100ms for quick visual feedback */
  MERGE: 100,
  /** New tile spawn animation duration - 150ms for smooth appearance */
  SPAWN: 150,
  /** Victory tile special animation duration */
  VICTORY: 250,
} as const;

/**
 * Spring physics configuration for natural movement feel
 * Optimized for mobile performance and satisfying user interaction
 */
export const SPRING_CONFIG = {
  /** Default spring configuration for tile sliding */
  slide: {
    damping: 15,
    stiffness: 300,
    mass: 1,
  },
  /** Spring configuration for merge effects - slightly more bouncy */
  merge: {
    damping: 12,
    stiffness: 400,
    mass: 0.8,
  },
  /** Spring configuration for new tile spawn - more dramatic bounce */
  spawn: {
    damping: 10,
    stiffness: 500,
    mass: 0.6,
  },
  /** Victory tile special spring effect */
  victory: {
    damping: 8,
    stiffness: 350,
    mass: 1.2,
  },
} as const;

/**
 * Easing curve configurations for different animation types
 * Provides natural, satisfying movement timing functions
 */
export const EASING_CURVES = {
  /** Smooth deceleration for tile sliding movements */
  slide: Easing.out(Easing.quad),
  /** Quick in-out for merge effects */
  merge: Easing.inOut(Easing.quad),
  /** Bounce effect for new tile spawning */
  spawn: Easing.out(Easing.back(1.7)),
  /** Special victory animation easing */
  victory: Easing.out(Easing.elastic(1.2)),
  /** Linear easing for opacity changes */
  fade: Easing.inOut(Easing.ease),
} as const;

/**
 * Animation scale factors for various effects
 */
export const ANIMATION_SCALES = {
  /** Scale factor for tile merge effect (briefly scales up before settling) */
  MERGE_SCALE: 1.1,
  /** Scale factor for new tile spawn effect */
  SPAWN_SCALE: 1.15,
  /** Scale factor for victory tile celebration */
  VICTORY_SCALE: 1.05,
  /** Minimum scale during animations (for subtle effects) */
  MIN_SCALE: 0.95,
} as const;

/**
 * Opacity values for fade animations
 */
export const ANIMATION_OPACITY = {
  /** Fully visible */
  VISIBLE: 1,
  /** Fully transparent */
  HIDDEN: 0,
  /** Semi-transparent for fade effects */
  FADE: 0.7,
} as const;

/**
 * Performance-optimized animation configurations
 * All configurations use native driver for 60fps performance
 */
export const PERFORMANCE_CONFIG = {
  /** Use native driver for all animations (required for 60fps) */
  useNativeDriver: true,
  /** Reduce motion for accessibility preferences */
  reduceMotion: false,
  /** Maximum concurrent animations to maintain performance */
  maxConcurrentAnimations: 8,
} as const;

/**
 * Worklet-based animation timing configurations
 * Pre-configured objects for use with Reanimated 3 withTiming() calls
 */
export const TIMING_CONFIGS = {
  /** Fast timing for merge animations */
  fast: {
    duration: ANIMATION_DURATIONS.MERGE,
    easing: EASING_CURVES.merge,
  },
  /** Standard timing for slide animations */
  standard: {
    duration: ANIMATION_DURATIONS.SLIDE,
    easing: EASING_CURVES.slide,
  },
  /** Slow timing for spawn animations */
  slow: {
    duration: ANIMATION_DURATIONS.SPAWN,
    easing: EASING_CURVES.spawn,
  },
  /** Victory timing for special effects */
  victory: {
    duration: ANIMATION_DURATIONS.VICTORY,
    easing: EASING_CURVES.victory,
  },
} as const;

/**
 * Animation type enumeration for type safety
 */
export enum AnimationType {
  SLIDE = 'slide',
  MERGE = 'merge',
  SPAWN = 'spawn',
  VICTORY = 'victory',
  FADE = 'fade',
}

/**
 * Animation state enumeration for tracking
 */
export enum AnimationState {
  IDLE = 'idle',
  RUNNING = 'running',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * Helper function to get spring configuration by animation type
 */
export function getSpringConfig(type: AnimationType) {
  'worklet';
  switch (type) {
    case AnimationType.SLIDE:
      return SPRING_CONFIG.slide;
    case AnimationType.MERGE:
      return SPRING_CONFIG.merge;
    case AnimationType.SPAWN:
      return SPRING_CONFIG.spawn;
    case AnimationType.VICTORY:
      return SPRING_CONFIG.victory;
    default:
      return SPRING_CONFIG.slide;
  }
}

/**
 * Helper function to get timing configuration by animation type
 */
export function getTimingConfig(type: AnimationType) {
  'worklet';
  switch (type) {
    case AnimationType.MERGE:
      return TIMING_CONFIGS.fast;
    case AnimationType.SLIDE:
      return TIMING_CONFIGS.standard;
    case AnimationType.SPAWN:
      return TIMING_CONFIGS.slow;
    case AnimationType.VICTORY:
      return TIMING_CONFIGS.victory;
    default:
      return TIMING_CONFIGS.standard;
  }
}
