import { ColorContrastResult, ThemeColors } from '@/types/theme';
import { Platform, PlatformOSType } from 'react-native';

/**
 * Calculate the relative luminance of a color
 * Used for WCAG color contrast calculations
 * @param color Hex color string (e.g., '#FF0000')
 * @returns Luminance value between 0 and 1
 */
export function calculateLuminance(color: string): number {
  // Remove hash if present
  const hex = color.replace('#', '');

  // Parse RGB values
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  // Apply gamma correction
  const sRGBtoLin = (colorChannel: number) => {
    return colorChannel <= 0.03928
      ? colorChannel / 12.92
      : Math.pow((colorChannel + 0.055) / 1.055, 2.4);
  };

  const rLin = sRGBtoLin(r);
  const gLin = sRGBtoLin(g);
  const bLin = sRGBtoLin(b);

  // Calculate luminance using WCAG formula
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

/**
 * Calculate contrast ratio between two colors
 * @param color1 First color (hex)
 * @param color2 Second color (hex)
 * @returns Contrast ratio between 1 and 21
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const lum1 = calculateLuminance(color1);
  const lum2 = calculateLuminance(color2);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Validate color contrast against WCAG standards
 * @param foreground Foreground color (text)
 * @param background Background color
 * @param large Whether text is large (24px+ regular or 18.66px+ bold)
 * @returns Contrast validation result
 */
export function validateColorContrast(
  foreground: string,
  background: string,
  large: boolean = false
): ColorContrastResult {
  const ratio = calculateContrastRatio(foreground, background);

  // WCAG AA standards
  const minRatio = large ? 3.0 : 4.5;
  const aaaRatio = large ? 4.5 : 7.0;

  const passes = ratio >= minRatio;
  let level: ColorContrastResult['level'];

  if (ratio >= aaaRatio) {
    level = 'AAA';
  } else if (ratio >= minRatio) {
    level = 'AA';
  } else {
    level = 'fail';
  }

  return {
    ratio,
    level,
    passes,
  };
}

/**
 * Validate all text/background combinations in a theme
 * @param colors Theme colors to validate
 * @returns Array of validation results with context
 */
export function validateThemeAccessibility(colors: ThemeColors) {
  const validations: {
    context: string;
    foreground: string;
    background: string;
    result: ColorContrastResult;
  }[] = [];

  // Primary text combinations
  validations.push({
    context: 'Primary text on background',
    foreground: colors.text,
    background: colors.background,
    result: validateColorContrast(colors.text, colors.background),
  });

  validations.push({
    context: 'Secondary text on background',
    foreground: colors.textSecondary,
    background: colors.background,
    result: validateColorContrast(colors.textSecondary, colors.background),
  });

  validations.push({
    context: 'Text on primary surface',
    foreground: colors.textOnPrimary,
    background: colors.primary,
    result: validateColorContrast(colors.textOnPrimary, colors.primary),
  });

  validations.push({
    context: 'Text on surface',
    foreground: colors.text,
    background: colors.surface,
    result: validateColorContrast(colors.text, colors.surface),
  });

  // Game board combinations
  validations.push({
    context: 'Text on game background',
    foreground: colors.text,
    background: colors.gameBackground,
    result: validateColorContrast(colors.text, colors.gameBackground),
  });

  // Tile combinations (check a few key ones)
  const tileChecks = [
    { value: '2', color: colors.tile2 },
    { value: '8', color: colors.tile8 },
    { value: '64', color: colors.tile64 },
    { value: '512', color: colors.tile512 },
    { value: '2048', color: colors.tile2048 },
  ];

  tileChecks.forEach(({ value, color }) => {
    // For small tiles (2, 4), we use dark text
    const textColor = ['2', '4'].includes(value)
      ? colors.text
      : colors.textOnPrimary;

    validations.push({
      context: `Text on tile ${value}`,
      foreground: textColor,
      background: color,
      result: validateColorContrast(textColor, color),
    });
  });

  return validations;
}

/**
 * Generate a color progression for tile values
 * Creates a smooth progression from light to vibrant colors
 * @param baseColor Base color for the progression
 * @param steps Number of steps in the progression
 * @returns Array of hex colors
 */
export function generateTileColorProgression(
  baseColor: string,
  steps: number = 11
): string[] {
  const colors: string[] = [];

  // Parse base color
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // Generate progression from light to vibrant
  for (let i = 0; i < steps; i++) {
    const progress = i / (steps - 1);

    // Start light, get more vibrant and darker
    const saturationMultiplier = 0.3 + progress * 0.7; // 30% to 100%
    const brightnessMultiplier = 0.9 - progress * 0.6; // 90% to 30%

    const newR = Math.round(
      r * saturationMultiplier + (255 - 255 * brightnessMultiplier)
    );
    const newG = Math.round(
      g * saturationMultiplier + (255 - 255 * brightnessMultiplier)
    );
    const newB = Math.round(
      b * saturationMultiplier + (255 - 255 * brightnessMultiplier)
    );

    const clampedR = Math.max(0, Math.min(255, newR));
    const clampedG = Math.max(0, Math.min(255, newG));
    const clampedB = Math.max(0, Math.min(255, newB));

    const hexColor = `#${clampedR.toString(16).padStart(2, '0')}${clampedG
      .toString(16)
      .padStart(2, '0')}${clampedB.toString(16).padStart(2, '0')}`;

    colors.push(hexColor);
  }

  return colors;
}

/**
 * Convert hex color to RGBA with alpha
 * @param hex Hex color string
 * @param alpha Alpha value between 0 and 1
 * @returns RGBA string
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.slice(0, 2), 16);
  const g = parseInt(cleanHex.slice(2, 4), 16);
  const b = parseInt(cleanHex.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Darken a color by a percentage
 * @param color Hex color string
 * @param percentage Percentage to darken (0-100)
 * @returns Darkened hex color
 */
export function darkenColor(color: string, percentage: number): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  const factor = 1 - percentage / 100;

  const newR = Math.round(r * factor);
  const newG = Math.round(g * factor);
  const newB = Math.round(b * factor);

  return `#${newR.toString(16).padStart(2, '0')}${newG
    .toString(16)
    .padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

/**
 * Lighten a color by a percentage
 * @param color Hex color string
 * @param percentage Percentage to lighten (0-100)
 * @returns Lightened hex color
 */
export function lightenColor(color: string, percentage: number): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  const factor = percentage / 100;

  const newR = Math.round(r + (255 - r) * factor);
  const newG = Math.round(g + (255 - g) * factor);
  const newB = Math.round(b + (255 - b) * factor);

  return `#${newR.toString(16).padStart(2, '0')}${newG
    .toString(16)
    .padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

/**
 * Get the appropriate text color (black or white) for a background color
 * @param backgroundColor Background color hex string
 * @returns '#000000' or '#FFFFFF'
 */
export function getContrastTextColor(backgroundColor: string): string {
  const luminance = calculateLuminance(backgroundColor);
  // Use white text on dark backgrounds, black text on light backgrounds
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Check if a color is valid hex format
 * @param color Color string to validate
 * @returns True if valid hex color
 */
export function isValidHexColor(color: string): boolean {
  const hexRegex = /^#[0-9A-Fa-f]{6}$/;
  return hexRegex.test(color);
}

/**
 * Platform-specific styling utilities
 */

/**
 * Get current platform
 * @returns Current platform OS
 */
export function getCurrentPlatform(): PlatformOSType {
  return Platform.OS;
}

/**
 * Check if running on iOS
 * @returns True if iOS platform
 */
export function isIOS(): boolean {
  return Platform.OS === 'ios';
}

/**
 * Check if running on Android
 * @returns True if Android platform
 */
export function isAndroid(): boolean {
  return Platform.OS === 'android';
}

/**
 * Check if running on web
 * @returns True if web platform
 */
export function isWeb(): boolean {
  return Platform.OS === 'web';
}

/**
 * Apply platform-specific shadow styles
 * @param shadowConfig Base shadow configuration
 * @returns Platform-optimized shadow styles
 */
export function getPlatformShadow(shadowConfig: {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}) {
  if (Platform.OS === 'android') {
    // Android uses elevation instead of shadow properties
    return {
      elevation: shadowConfig.elevation,
    };
  } else if (Platform.OS === 'ios') {
    // iOS uses shadow properties
    return {
      shadowColor: shadowConfig.shadowColor,
      shadowOffset: shadowConfig.shadowOffset,
      shadowOpacity: shadowConfig.shadowOpacity,
      shadowRadius: shadowConfig.shadowRadius,
    };
  } else {
    // Web uses CSS box-shadow
    const { shadowColor, shadowOffset, shadowOpacity, shadowRadius } =
      shadowConfig;
    const alpha = shadowOpacity;
    const color = hexToRgba(shadowColor, alpha);

    return {
      boxShadow: `${shadowOffset.width}px ${shadowOffset.height}px ${shadowRadius}px ${color}`,
    };
  }
}

/**
 * Get platform-specific font family
 * @param weight Font weight ('regular' | 'medium' | 'bold')
 * @returns Platform-appropriate font family
 */
export function getPlatformFontFamily(
  weight: 'regular' | 'medium' | 'bold' = 'regular'
): string {
  if (Platform.OS === 'ios') {
    switch (weight) {
      case 'bold':
        return 'San Francisco Display';
      case 'medium':
        return 'San Francisco Display';
      default:
        return 'San Francisco Display';
    }
  } else if (Platform.OS === 'android') {
    switch (weight) {
      case 'bold':
        return 'Roboto';
      case 'medium':
        return 'Roboto';
      default:
        return 'Roboto';
    }
  } else {
    // Web fallback
    return '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  }
}

/**
 * Get platform-specific spacing adjustments
 * Web typically needs slightly more spacing due to different rendering
 * @param baseSpacing Base spacing value
 * @returns Adjusted spacing for platform
 */
export function getPlatformSpacing(baseSpacing: number): number {
  if (Platform.OS === 'web') {
    return Math.round(baseSpacing * 1.1); // 10% more spacing on web
  }
  return baseSpacing;
}

/**
 * Get platform-specific border radius adjustments
 * @param baseRadius Base border radius
 * @returns Adjusted radius for platform
 */
export function getPlatformBorderRadius(baseRadius: number): number {
  if (Platform.OS === 'android') {
    return Math.round(baseRadius * 0.8); // Slightly less rounded on Android
  }
  return baseRadius;
}

/**
 * Create platform-specific style object
 * @param baseStyle Base styles
 * @param platformOverrides Platform-specific overrides
 * @returns Merged styles with platform overrides
 */
export function createPlatformStyle<T>(
  baseStyle: T,
  platformOverrides: Partial<{
    ios: Partial<T>;
    android: Partial<T>;
    web: Partial<T>;
  }> = {}
): T {
  const currentPlatform = Platform.OS as keyof typeof platformOverrides;
  const platformStyle = platformOverrides[currentPlatform] || {};

  return {
    ...baseStyle,
    ...platformStyle,
  };
}

/**
 * Get platform-specific text input styling
 * Different platforms have different default behaviors for text inputs
 * @returns Platform-specific text input styles
 */
export function getPlatformTextInputStyle() {
  return createPlatformStyle(
    {
      fontSize: 16,
      lineHeight: 20,
      padding: 12,
    },
    {
      ios: {
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
      },
      android: {
        borderBottomWidth: 1,
        borderRadius: 4,
        paddingVertical: 8,
      },
      web: {
        borderWidth: 1,
        borderRadius: 6,
        outline: 'none',
      },
    }
  );
}

/**
 * Get platform-specific button styling
 * @param variant Button variant
 * @returns Platform-specific button styles
 */
export function getPlatformButtonStyle(
  variant: 'primary' | 'secondary' = 'primary'
) {
  const baseStyle = {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  if (Platform.OS === 'ios') {
    return {
      ...baseStyle,
      borderRadius: 10,
      paddingVertical: 14,
    };
  } else if (Platform.OS === 'android') {
    return {
      ...baseStyle,
      borderRadius: 6,
      elevation: variant === 'primary' ? 2 : 1,
    };
  } else {
    return {
      ...baseStyle,
      borderRadius: 8,
      cursor: 'pointer',
    };
  }
}

/**
 * Get platform-specific safe area adjustments
 * @returns Safe area style adjustments
 */
export function getPlatformSafeAreaStyle() {
  return createPlatformStyle(
    {
      flex: 1,
    },
    {
      ios: {
        paddingTop: 0, // SafeAreaView handles this
      },
      android: {
        paddingTop: Platform.select({
          android: 25, // Status bar height approximation
          default: 0,
        }),
      },
      web: {
        minHeight: '100vh',
      },
    }
  );
}

/**
 * Check if the platform supports haptic feedback
 * @returns True if haptics are supported
 */
export function supportsHaptics(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

/**
 * Check if the platform supports system-level dark mode detection
 * @returns True if dark mode detection is supported
 */
export function supportsDarkModeDetection(): boolean {
  return (
    Platform.OS === 'ios' || Platform.OS === 'android' || Platform.OS === 'web'
  );
}
