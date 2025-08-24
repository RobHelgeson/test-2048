import { Theme, ThemeColors, DesignTokens } from '@/types/theme';
import {
  TYPOGRAPHY_TOKENS,
  SPACING_TOKENS,
  BORDER_RADIUS_TOKENS,
  SHADOW_TOKENS,
  ANIMATION_TOKENS,
} from '@/constants/DesignTokens';

/**
 * Cool Theme - Modern blue/teal color scheme
 * Clean, cool tones with vibrant progression
 * WCAG AA compliant color combinations
 */
const COOL_COLORS: ThemeColors = {
  // Background colors
  background: '#F0F8FF', // Light blue-white (Alice Blue)
  surface: '#FFFFFF', // Pure white for cards
  surfaceVariant: '#E6F3FF', // Light blue variant

  // Text colors
  text: '#2C3E50', // Dark blue-gray for primary text
  textSecondary: '#5A6C7D', // Medium blue-gray for secondary text
  textOnPrimary: '#FFFFFF', // White text on colored backgrounds

  // UI colors
  primary: '#1B4F72', // Much darker blue for better contrast (was #2E86AB)
  primaryVariant: '#2E6DA4', // Much darker light blue variant (was #4A9BC1)
  secondary: '#85C1E9', // Light blue for secondary elements
  accent: '#E74C3C', // Red accent for highlights

  // Game board colors
  gameBackground: '#85C1E9', // Light blue board background
  tilePlaceholder: '#AED6F1', // Light blue-gray empty slots
  tileBackground: '#EBF5FB', // Very light blue default tile

  // Status colors
  success: '#27AE60', // Green for wins
  warning: '#F39C12', // Orange for warnings
  error: '#E74C3C', // Red for errors
  info: '#3498DB', // Blue for info

  // Border and shadow colors
  border: '#D5DBDB', // Light gray border
  shadow: '#00000020', // Slightly stronger shadow

  // Tile progression colors - Cool blue to vibrant spectrum with improved contrast
  tile2: '#E3F2FD', // Slightly darker very light blue (was #EBF5FB)
  tile4: '#BBDEFB', // Darker light blue (was #D6EAF8)
  tile8: '#1976D2', // Much darker medium blue for better contrast (was #42A5F5)
  tile16: '#2196F3', // Darker bright blue (was #5DADE2)
  tile32: '#1976D2', // Darker strong blue (was #3498DB)
  tile64: '#0D47A1', // Much darker deep blue for better contrast (was #2E86AB)
  tile128: '#7B1FA2', // Darker light purple for better contrast (was #A569BD)
  tile256: '#6A1B9A', // Darker purple (was #8E44AD)
  tile512: '#4A148C', // Much darker deep purple for better contrast (was #7D3C98)
  tile1024: '#38006B', // Much darker dark purple (was #6C3483)
  tile2048: '#D32F2F', // Darker vibrant red for better contrast (was #FF6B6B)
  tileSuper: '#B71C1C', // Even darker red for super tiles (was #C0392B)
};

/**
 * Cool theme design tokens
 */
const COOL_DESIGN_TOKENS: DesignTokens = {
  colors: COOL_COLORS,
  typography: TYPOGRAPHY_TOKENS,
  spacing: SPACING_TOKENS,
  borderRadius: BORDER_RADIUS_TOKENS,
  shadows: SHADOW_TOKENS,
  animations: ANIMATION_TOKENS,
};

/**
 * Complete Cool Theme configuration
 */
export const CoolTheme: Theme = {
  type: 'cool',
  name: 'Cool',
  description: 'Modern blue and teal color scheme with vibrant accents',
  tokens: COOL_DESIGN_TOKENS,
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    colorBlindFriendly: true,
  },
};

// Export individual color constants for direct use
export const COOL_TILE_COLORS = {
  2: COOL_COLORS.tile2,
  4: COOL_COLORS.tile4,
  8: COOL_COLORS.tile8,
  16: COOL_COLORS.tile16,
  32: COOL_COLORS.tile32,
  64: COOL_COLORS.tile64,
  128: COOL_COLORS.tile128,
  256: COOL_COLORS.tile256,
  512: COOL_COLORS.tile512,
  1024: COOL_COLORS.tile1024,
  2048: COOL_COLORS.tile2048,
  super: COOL_COLORS.tileSuper,
};

// Tile text colors for optimal contrast
export const COOL_TILE_TEXT_COLORS = {
  2: COOL_COLORS.text, // Dark text on light tiles
  4: COOL_COLORS.text, // Dark text on light tiles (was white)
  8: COOL_COLORS.textOnPrimary, // White text on darker blue
  16: COOL_COLORS.textOnPrimary, // White text on darker bright blue
  32: COOL_COLORS.textOnPrimary, // White text on darker strong blue
  64: COOL_COLORS.textOnPrimary, // White text on much darker deep blue
  128: COOL_COLORS.textOnPrimary, // White text on darker purple
  256: COOL_COLORS.textOnPrimary, // White text on darker purple
  512: COOL_COLORS.textOnPrimary, // White text on much darker deep purple
  1024: COOL_COLORS.textOnPrimary, // White text on much darker purple
  2048: COOL_COLORS.textOnPrimary, // White text on darker red
  super: COOL_COLORS.textOnPrimary, // White text on darker red
};
