import { AnimationTokens, BorderRadiusTokens, ShadowTokens, SpacingTokens, TypographyTokens } from '@/types/theme';

/**
 * 8pt Grid System - Base unit: 8px
 * All spacing follows multiples of 8 for consistent vertical rhythm
 */
export const SPACING_TOKENS: SpacingTokens = {
  xs: 4, // 0.5x - Tight spacing
  sm: 8, // 1x - Base unit
  base: 12, // 1.5x - Default spacing
  md: 16, // 2x - Medium spacing
  lg: 24, // 3x - Large spacing
  xl: 32, // 4x - Extra large spacing
  '2xl': 48, // 6x - Section spacing
  '3xl': 64, // 8x - Page-level spacing
};

/**
 * Typography tokens based on 8pt grid system
 * Font sizes aligned to 8pt baseline for consistency
 */
export const TYPOGRAPHY_TOKENS: TypographyTokens = {
  fontFamily: {
    regular: 'System', // Uses system default
    medium: 'System', // iOS: SF Pro, Android: Roboto
    bold: 'System',
  },
  fontSize: {
    xs: 12, // 1.5x base (caption text)
    sm: 14, // 1.75x base (small text)
    base: 16, // 2x base (body text)
    lg: 18, // 2.25x base (large text)
    xl: 20, // 2.5x base (heading)
    '2xl': 24, // 3x base (large heading)
    '3xl': 30, // 3.75x base (display text)
    '4xl': 36, // 4.5x base (large display)
    '5xl': 48, // 6x base (hero text)
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

/**
 * Border radius tokens for consistent rounded corners
 */
export const BORDER_RADIUS_TOKENS: BorderRadiusTokens = {
  none: 0,
  sm: 4, // Small elements
  base: 8, // Default radius (matches base spacing)
  md: 12, // Medium elements
  lg: 16, // Large elements
  xl: 24, // Extra large elements
  full: 9999, // Fully rounded (pills)
};

/**
 * Shadow tokens for depth and elevation
 * Includes both iOS (shadow) and Android (elevation) styles
 */
export const SHADOW_TOKENS: ShadowTokens = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  base: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

/**
 * Animation tokens for consistent timing and easing
 * Follows Material Design motion guidelines
 */
export const ANIMATION_TOKENS: AnimationTokens = {
  duration: {
    fast: 150, // Quick interactions
    normal: 250, // Standard animations
    slow: 350, // Complex animations
  },
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

/**
 * Game-specific constants
 */
export const GAME_CONSTANTS = {
  BOARD_SIZE: 4,
  TILE_SIZE: 64,
  TILE_MARGIN: 8,
  TILE_BORDER_RADIUS: 6,
  BOARD_PADDING: 16,
  ANIMATION_DURATION: 150,
} as const;

/**
 * Breakpoints for responsive design (mainly for web)
 */
export const BREAKPOINTS = {
  mobile: 320,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

/**
 * Z-index layers for consistent stacking
 */
export const Z_INDEX = {
  base: 0,
  tile: 1,
  overlay: 10,
  modal: 100,
  notification: 1000,
} as const;

/**
 * Common layout constants
 */
export const LAYOUT = {
  HEADER_HEIGHT: 64,
  TAB_BAR_HEIGHT: 80,
  SAFE_AREA_PADDING: 16,
  CARD_PADDING: 16,
  SCREEN_PADDING: 20,
} as const;
