// Re-export theme hooks from ThemeProvider for convenience
// This maintains backward compatibility and provides a single import point
import { useTheme as useThemeContext } from '@/components/themed/ThemeProvider';
import { PlatformThemeOverrides, ThemeColors } from '@/types/theme';
import { useMemo } from 'react';
import { Platform } from 'react-native';

// Additional utility hooks for theme management

export {
  useCurrentThemeType,
  useIsThemeLoading,
  useTheme,
  useThemeColors,
  useThemeControls,
} from '@/components/themed/ThemeProvider';

/**
 * Hook to get platform-specific theme colors
 * Applies platform-specific overrides if available
 */
export function usePlatformTheme() {
  const { theme } = useThemeContext();

  const platformTheme = useMemo(() => {
    const baseTokens = theme.tokens;

    // Apply platform-specific overrides if they exist
    const platformOverrides: PlatformThemeOverrides | undefined = (theme as any).platformOverrides;

    if (!platformOverrides) {
      return baseTokens;
    }

    const platformKey = Platform.OS as keyof PlatformThemeOverrides;
    const overrides = platformOverrides[platformKey];

    if (!overrides) {
      return baseTokens;
    }

    // Merge base tokens with platform-specific overrides
    return {
      ...baseTokens,
      ...overrides,
      colors: {
        ...baseTokens.colors,
        ...overrides.colors,
      },
    };
  }, [theme]);

  return platformTheme;
}

/**
 * Hook to get tile color for a specific value
 * Handles the color progression algorithm
 */
export function useTileColor() {
  const { colors } = useThemeContext();

  const getTileColor = useMemo(() => {
    return (value: number): string => {
      // Map tile values to color keys
      const colorMap: Record<number, keyof ThemeColors> = {
        2: 'tile2',
        4: 'tile4',
        8: 'tile8',
        16: 'tile16',
        32: 'tile32',
        64: 'tile64',
        128: 'tile128',
        256: 'tile256',
        512: 'tile512',
        1024: 'tile1024',
        2048: 'tile2048',
      };

      // Get color for specific value or use super tile for higher values
      const colorKey = colorMap[value] || 'tileSuper';
      return colors[colorKey];
    };
  }, [colors]);

  return getTileColor;
}

/**
 * Hook to get text color for tiles based on tile value
 * Returns appropriate text color (light/dark) for optimal contrast
 */
export function useTileTextColor() {
  const { colors } = useThemeContext();

  const getTileTextColor = useMemo(() => {
    return (value: number): string => {
      // For smaller values (2, 4), use dark text
      // For larger values, use light text for better contrast
      if (value <= 4) {
        return colors.text;
      }
      return colors.textOnPrimary;
    };
  }, [colors]);

  return getTileTextColor;
}

/**
 * Hook to detect if the current theme is dark or light
 * Useful for conditional styling
 */
export function useIsDarkTheme(): boolean {
  const { colors } = useThemeContext();

  const isDark = useMemo(() => {
    // Simple heuristic: if background is darker, it's a dark theme
    // Parse hex color and check brightness
    const bgColor = colors.background;
    if (!bgColor.startsWith('#')) return false;

    const hex = bgColor.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    // Calculate brightness using standard formula
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  }, [colors.background]);

  return isDark;
}

/**
 * Hook for theme-aware styling
 * Returns a function that accepts style objects with theme-based values
 */
export function useThemedStyles<T>() {
  const { colors } = useThemeContext();

  const createStyles = useMemo(() => {
    return (styleCreator: (colors: ThemeColors) => T): T => {
      return styleCreator(colors);
    };
  }, [colors]);

  return createStyles;
}
