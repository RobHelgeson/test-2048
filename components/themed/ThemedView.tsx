import { useThemeColors } from '@/hooks/useTheme';
import { ThemedStyleProp } from '@/types/theme';
import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

export interface ThemedViewProps extends Omit<ViewProps, 'style'> {
  /**
   * Custom style prop that can be a function receiving theme colors
   * or a regular StyleSheet object
   */
  style?: ThemedStyleProp<ViewProps['style']>;

  /**
   * Background color variant to apply
   * Uses theme color tokens for consistent styling
   */
  backgroundColor?: 'background' | 'surface' | 'surfaceVariant' | 'primary' | 'secondary' | 'gameBackground';

  /**
   * Border color variant to apply
   * Uses theme color tokens for consistent styling
   */
  borderColor?: 'border' | 'primary' | 'secondary' | 'accent';

  /**
   * Whether to apply platform-specific shadows
   */
  shadow?: 'none' | 'sm' | 'base' | 'lg';

  /**
   * Whether to apply theme-aware border radius
   */
  borderRadius?: 'none' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | 'full';

  /**
   * Padding using design tokens
   */
  padding?: 'xs' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

  /**
   * Margin using design tokens
   */
  margin?: 'xs' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

/**
 * ThemedView component that automatically applies theme colors and design tokens
 *
 * Features:
 * - Automatic theme color integration
 * - Design token support for spacing, borders, shadows
 * - Platform-specific styling
 * - Function-based dynamic styling
 *
 * @example
 * ```tsx
 * <ThemedView
 *   backgroundColor="surface"
 *   shadow="base"
 *   borderRadius="md"
 *   padding="lg"
 * >
 *   <Text>Content</Text>
 * </ThemedView>
 * ```
 */
export function ThemedView({
  style,
  backgroundColor,
  borderColor,
  shadow = 'none',
  borderRadius,
  padding,
  margin,
  ...props
}: ThemedViewProps) {
  const colors = useThemeColors();

  // Resolve themed style
  const resolvedStyle = typeof style === 'function' ? style(colors) : style;

  // Build themed styles
  const themedStyles = StyleSheet.create({
    container: {
      // Background color
      ...(backgroundColor && {
        backgroundColor: colors[backgroundColor],
      }),

      // Border color
      ...(borderColor && {
        borderColor: colors[borderColor],
        borderWidth: borderColor ? 1 : 0,
      }),

      // Border radius using design tokens
      ...(borderRadius && {
        borderRadius: getBorderRadiusValue(borderRadius),
      }),

      // Padding using design tokens
      ...(padding && {
        padding: getSpacingValue(padding),
      }),

      // Margin using design tokens
      ...(margin && {
        margin: getSpacingValue(margin),
      }),

      // Shadow using design tokens
      ...getShadowStyle(shadow),
    },
  });

  return <View style={[themedStyles.container, resolvedStyle]} {...props} />;
}

// Helper functions to get design token values
function getSpacingValue(spacing: string): number {
  const spacingMap: Record<string, number> = {
    xs: 4,
    sm: 8,
    base: 12,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  };
  return spacingMap[spacing] || 0;
}

function getBorderRadiusValue(radius: string): number {
  const radiusMap: Record<string, number> = {
    none: 0,
    sm: 4,
    base: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  };
  return radiusMap[radius] || 0;
}

function getShadowStyle(shadow: string) {
  if (shadow === 'none') return {};

  // Platform-specific shadow implementation
  const shadowMap: Record<string, any> = {
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

  return shadowMap[shadow] || {};
}

// Convenience wrapper components for common use cases

/**
 * Card component with default theming for content containers
 */
export function ThemedCard({ children, ...props }: ThemedViewProps) {
  return (
    <ThemedView backgroundColor="surface" borderRadius="md" shadow="base" padding="md" borderColor="border" {...props}>
      {children}
    </ThemedView>
  );
}

/**
 * Surface component for elevated content areas
 */
export function ThemedSurface({ children, ...props }: ThemedViewProps) {
  return (
    <ThemedView backgroundColor="surface" borderRadius="lg" shadow="sm" {...props}>
      {children}
    </ThemedView>
  );
}

/**
 * Game board background component
 */
export function ThemedGameBackground({ children, ...props }: ThemedViewProps) {
  return (
    <ThemedView backgroundColor="gameBackground" borderRadius="lg" shadow="base" padding="md" {...props}>
      {children}
    </ThemedView>
  );
}
