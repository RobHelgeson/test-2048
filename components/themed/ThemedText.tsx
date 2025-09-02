import { useTheme, useThemeColors } from '@/hooks/useTheme';
import { ThemedStyleProp } from '@/types/theme';
import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';

export interface ThemedTextProps extends Omit<TextProps, 'style'> {
  /**
   * Custom style prop that can be a function receiving theme colors
   * or a regular StyleSheet object
   */
  style?: ThemedStyleProp<TextProps['style']>;

  /**
   * Text color variant to apply
   * Uses theme color tokens for consistent styling
   */
  color?:
    | 'text'
    | 'textSecondary'
    | 'textOnPrimary'
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'success'
    | 'warning'
    | 'error'
    | 'info';

  /**
   * Typography scale variant
   * Uses design token font sizes
   */
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';

  /**
   * Font weight variant
   * Uses design token font weights
   */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';

  /**
   * Line height variant
   * Uses design token line heights
   */
  lineHeight?: 'tight' | 'normal' | 'relaxed';

  /**
   * Text alignment
   */
  align?: 'left' | 'center' | 'right' | 'justify';

  /**
   * Text decoration
   */
  decoration?: 'none' | 'underline' | 'line-through';

  /**
   * Text transform
   */
  transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

/**
 * ThemedText component that automatically applies theme colors and typography tokens
 *
 * Features:
 * - Automatic theme color integration
 * - Typography design tokens
 * - Platform-specific font families
 * - Function-based dynamic styling
 *
 * @example
 * ```tsx
 * <ThemedText
 *   color="primary"
 *   size="lg"
 *   weight="bold"
 *   align="center"
 * >
 *   Welcome to 2048
 * </ThemedText>
 * ```
 */
export function ThemedText({
  style,
  color = 'text',
  size = 'base',
  weight = 'normal',
  lineHeight = 'normal',
  align = 'left',
  decoration = 'none',
  transform = 'none',
  ...props
}: ThemedTextProps) {
  const colors = useThemeColors();
  const { theme } = useTheme();

  // Resolve themed style
  const resolvedStyle = typeof style === 'function' ? style(colors) : style;

  // Build themed styles
  const themedStyles = StyleSheet.create({
    text: {
      // Color from theme tokens
      color: colors[color],

      // Font size from design tokens
      fontSize: getFontSize(size),

      // Font weight from design tokens
      fontWeight: getFontWeight(weight),

      // Line height from design tokens
      lineHeight: getLineHeight(lineHeight, getFontSize(size)),

      // Text alignment
      textAlign: align,

      // Text decoration
      textDecorationLine: decoration,

      // Text transform
      textTransform: transform,

      // Platform-specific font family
      fontFamily:
        theme.tokens.typography.fontFamily[weight === 'bold' ? 'bold' : weight === 'medium' ? 'medium' : 'regular'],
    },
  });

  return <Text style={[themedStyles.text, resolvedStyle]} {...props} />;
}

// Helper functions to get design token values
function getFontSize(size: string): number {
  const fontSizeMap: Record<string, number> = {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  };
  return fontSizeMap[size] || 16;
}

function getFontWeight(weight: string): any {
  const fontWeightMap: Record<string, any> = {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  };
  return fontWeightMap[weight] || '400';
}

function getLineHeight(lineHeight: string, fontSize: number): number {
  const lineHeightMap: Record<string, number> = {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  };
  const multiplier = lineHeightMap[lineHeight] || 1.5;
  return fontSize * multiplier;
}

// Convenience components for common text variants

/**
 * Heading component for titles and headers
 */
export function ThemedHeading({ children, size = '2xl', weight = 'bold', ...props }: ThemedTextProps) {
  return (
    <ThemedText size={size} weight={weight} lineHeight="tight" {...props}>
      {children}
    </ThemedText>
  );
}

/**
 * Subheading component for section titles
 */
export function ThemedSubheading({ children, size = 'lg', weight = 'semibold', ...props }: ThemedTextProps) {
  return (
    <ThemedText size={size} weight={weight} color="textSecondary" {...props}>
      {children}
    </ThemedText>
  );
}

/**
 * Body text component for regular content
 */
export function ThemedBody({ children, ...props }: ThemedTextProps) {
  return (
    <ThemedText size="base" weight="normal" lineHeight="normal" {...props}>
      {children}
    </ThemedText>
  );
}

/**
 * Caption text component for small supplementary text
 */
export function ThemedCaption({ children, size = 'sm', ...props }: ThemedTextProps) {
  return (
    <ThemedText size={size} color="textSecondary" {...props}>
      {children}
    </ThemedText>
  );
}

/**
 * Score text component for game scores
 */
export function ThemedScore({ children, size = 'xl', weight = 'bold', ...props }: ThemedTextProps) {
  return (
    <ThemedText size={size} weight={weight} color="primary" align="center" {...props}>
      {children}
    </ThemedText>
  );
}

/**
 * Tile text component for game tile values
 */
export function ThemedTileText({
  children,
  tileValue,
  size = 'lg',
  weight = 'bold',
  ...props
}: ThemedTextProps & { tileValue?: number }) {
  // const colors = useThemeColors(); // Available for future theme customization

  // Determine text color based on tile value
  const textColor = tileValue && tileValue <= 4 ? 'text' : 'textOnPrimary';

  return (
    <ThemedText size={size} weight={weight} color={textColor} align="center" {...props}>
      {children}
    </ThemedText>
  );
}

/**
 * Button text component for button labels
 */
export function ThemedButtonText({ children, ...props }: ThemedTextProps) {
  return (
    <ThemedText size="base" weight="semibold" color="textOnPrimary" align="center" {...props}>
      {children}
    </ThemedText>
  );
}

/**
 * Link text component for clickable text
 */
export function ThemedLink({ children, ...props }: ThemedTextProps) {
  return (
    <ThemedText color="primary" decoration="underline" {...props}>
      {children}
    </ThemedText>
  );
}
