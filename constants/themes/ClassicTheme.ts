import { Theme, ThemeColors, DesignTokens } from '@/types/theme';
import {
  TYPOGRAPHY_TOKENS,
  SPACING_TOKENS,
  BORDER_RADIUS_TOKENS,
  SHADOW_TOKENS,
  ANIMATION_TOKENS,
} from '@/constants/DesignTokens';

/**
 * Classic Theme - Inspired by original 2048 game
 * Warm, earthy tones with clear progression from light to vibrant
 * WCAG AA compliant color combinations
 */
const CLASSIC_COLORS: ThemeColors = {
  // Background colors
  background: '#FAF8EF', // Warm off-white
  surface: '#FFFFFF', // Pure white for cards
  surfaceVariant: '#F5F3EA', // Slightly darker variant

  // Text colors
  text: '#5D4E37', // Darker brown-gray for better contrast (was #776E65)
  textSecondary: '#6B5B4C', // Darker brown-gray for secondary text (was #8A8680)
  textOnPrimary: '#FFFFFF', // White text on colored backgrounds

  // UI colors
  primary: '#6B5B4C', // Darker brown for primary actions (was #8F7A66)
  primaryVariant: '#A68B5B', // Lighter brown variant
  secondary: '#BBADA0', // Light brown for secondary elements
  accent: '#ED944C', // Orange accent for highlights

  // Game board colors
  gameBackground: '#6B5B4C', // Use text color for game background to ensure proper contrast (was #8D7F72)
  tilePlaceholder: '#CDC1B4', // Empty tile slots
  tileBackground: '#E8DDD4', // Slightly darker default tile background (was #EEE4DA)

  // Status colors
  success: '#87A96B', // Green for wins
  warning: '#ED944C', // Orange for warnings
  error: '#CC6666', // Red for errors
  info: '#6699CC', // Blue for info

  // Border and shadow colors
  border: '#D6CCC0', // Light brown border
  shadow: '#00000015', // Subtle shadow

  // Tile progression colors - Classic 2048 palette with improved contrast
  tile2: '#E8DDD4', // Darker very light beige for better contrast (was #EEE4DA)
  tile4: '#E6D6BD', // Darker light beige (was #EDE0C8)
  tile8: '#A0541A', // Much darker orange for better contrast (was #B8651E)
  tile16: '#B86600', // Much darker orange (was #E5824A)
  tile32: '#A55500', // Much darker red-orange (was #E2693C)
  tile64: '#924400', // Much darker red for better contrast (was #D4522A)
  tile128: '#8B6914', // Much darker yellow for better contrast (was #C5A83D)
  tile256: '#7A5A12', // Much darker yellow (was #B89F38)
  tile512: '#6B4C10', // Much darker gold for better contrast (was #AB9333)
  tile1024: '#5D3E0E', // Much darker deep gold (was #9D862E)
  tile2048: '#4F300C', // Much darker bright gold for better contrast (was #8F7A29)
  tileSuper: '#9C2A00', // Dark red for super tiles (4096+)
};

/**
 * Classic theme design tokens
 */
const CLASSIC_DESIGN_TOKENS: DesignTokens = {
  colors: CLASSIC_COLORS,
  typography: TYPOGRAPHY_TOKENS,
  spacing: SPACING_TOKENS,
  borderRadius: BORDER_RADIUS_TOKENS,
  shadows: SHADOW_TOKENS,
  animations: ANIMATION_TOKENS,
};

/**
 * Complete Classic Theme configuration
 */
export const ClassicTheme: Theme = {
  type: 'classic',
  name: 'Classic',
  description: 'The original 2048 color scheme with warm, earthy tones',
  tokens: CLASSIC_DESIGN_TOKENS,
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    colorBlindFriendly: true,
  },
};

// Export individual color constants for direct use
export const CLASSIC_TILE_COLORS = {
  2: CLASSIC_COLORS.tile2,
  4: CLASSIC_COLORS.tile4,
  8: CLASSIC_COLORS.tile8,
  16: CLASSIC_COLORS.tile16,
  32: CLASSIC_COLORS.tile32,
  64: CLASSIC_COLORS.tile64,
  128: CLASSIC_COLORS.tile128,
  256: CLASSIC_COLORS.tile256,
  512: CLASSIC_COLORS.tile512,
  1024: CLASSIC_COLORS.tile1024,
  2048: CLASSIC_COLORS.tile2048,
  super: CLASSIC_COLORS.tileSuper,
};

// Tile text colors for optimal contrast
export const CLASSIC_TILE_TEXT_COLORS = {
  2: CLASSIC_COLORS.text, // Dark text on light tiles
  4: CLASSIC_COLORS.text, // Dark text on light tiles
  8: CLASSIC_COLORS.textOnPrimary, // White text on darker orange tiles
  16: CLASSIC_COLORS.textOnPrimary,
  32: CLASSIC_COLORS.textOnPrimary,
  64: CLASSIC_COLORS.textOnPrimary,
  128: CLASSIC_COLORS.textOnPrimary, // White text on darker yellow (was dark text)
  256: CLASSIC_COLORS.textOnPrimary, // White text on darker yellow (was dark text)
  512: CLASSIC_COLORS.textOnPrimary, // White text on darker gold (was dark text)
  1024: CLASSIC_COLORS.textOnPrimary, // White text on darker gold (was dark text)
  2048: CLASSIC_COLORS.textOnPrimary, // White text on darker gold (was dark text)
  super: CLASSIC_COLORS.textOnPrimary, // White text on dark red
};
