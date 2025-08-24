import { useThemeColors } from '@/hooks/useTheme';
import { ThemedStyleProp } from '@/types/theme';
import { getPlatformSafeAreaStyle } from '@/utils/themeUtils';
import React from 'react';
import {
  SafeAreaView,
  SafeAreaViewProps,
} from 'react-native-safe-area-context';

export interface ThemedSafeAreaViewProps
  extends Omit<SafeAreaViewProps, 'style'> {
  /**
   * Custom style prop that can be a function receiving theme colors
   * or a regular StyleSheet object
   */
  style?: ThemedStyleProp<SafeAreaViewProps['style']>;

  /**
   * Background color variant to apply
   * Uses theme color tokens for consistent styling
   */
  backgroundColor?:
    | 'background'
    | 'surface'
    | 'surfaceVariant'
    | 'primary'
    | 'secondary';

  /**
   * Whether to apply platform-specific safe area adjustments
   */
  platformAdjustments?: boolean;
}

/**
 * ThemedSafeAreaView component that automatically applies theme colors
 * and platform-specific safe area handling
 *
 * Features:
 * - Automatic theme color integration
 * - Platform-specific safe area handling
 * - Consistent styling across platforms
 * - Function-based dynamic styling
 *
 * @example
 * ```tsx
 * <ThemedSafeAreaView backgroundColor="background">
 *   <View>Content</View>
 * </ThemedSafeAreaView>
 * ```
 */
export function ThemedSafeAreaView({
  style,
  backgroundColor = 'background',
  platformAdjustments = true,
  ...props
}: ThemedSafeAreaViewProps) {
  const colors = useThemeColors();

  // Resolve themed style
  const resolvedStyle = typeof style === 'function' ? style(colors) : style;

  // Build themed styles
  const themedStyle = {
    backgroundColor: colors[backgroundColor],
    ...(platformAdjustments && getPlatformSafeAreaStyle()),
  };

  return <SafeAreaView style={[themedStyle, resolvedStyle]} {...props} />;
}

/**
 * Screen container component with themed safe area
 */
export function ThemedScreen({ children, ...props }: ThemedSafeAreaViewProps) {
  return (
    <ThemedSafeAreaView
      backgroundColor="background"
      style={{ flex: 1 }}
      {...props}
    >
      {children}
    </ThemedSafeAreaView>
  );
}

/**
 * Modal container component with themed safe area
 */
export function ThemedModal({ children, ...props }: ThemedSafeAreaViewProps) {
  return (
    <ThemedSafeAreaView
      backgroundColor="surface"
      style={{ flex: 1 }}
      {...props}
    >
      {children}
    </ThemedSafeAreaView>
  );
}
