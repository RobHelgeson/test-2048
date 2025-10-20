import { ThemedText } from '@/components/themed/ThemedText';
import { ThemedView } from '@/components/themed/ThemedView';
import { useThemeColors } from '@/hooks/useTheme';
import { GameStatus } from '@/types';
import React from 'react';
import { Platform, StyleSheet, TextStyle, ViewStyle } from 'react-native';

interface StatusIndicatorProps {
  /** Current game status */
  status: GameStatus;
  /** Optional custom styling for the container */
  style?: ViewStyle;
  /** Optional custom text styling */
  textStyle?: TextStyle;
  /** Test ID for testing */
  testID?: string;
  /** Whether to show animated status transitions */
  animated?: boolean;
}

/**
 * StatusIndicator Component
 *
 * A visual indicator component that displays the current game status with
 * appropriate styling and colors. Provides clear feedback about game state
 * transitions and supports accessibility features.
 *
 * Key Features:
 * - Status-specific styling and colors (playing, won, lost)
 * - Theme integration with consistent visual design
 * - Accessibility support with live region announcements
 * - Platform-specific visual effects and animations
 * - Responsive text sizing and container adaptation
 * - Support for status transition animations
 *
 * @example
 * ```tsx
 * <StatusIndicator
 *   status={gameStore.gameStatus}
 *   animated={true}
 *   testID="game-status-indicator"
 * />
 * ```
 */
export function StatusIndicator({ status, style, textStyle, testID, animated = true }: StatusIndicatorProps) {
  const colors = useThemeColors();

  // Get status-specific message and styling
  const statusConfig = React.useMemo(() => getStatusConfig(status, colors), [status, colors]);

  // Create dynamic styles based on theme and status
  const dynamicStyles = React.useMemo(() => createStatusStyles(colors, status), [colors, status]);

  // Generate accessibility properties with live region for status changes
  const accessibilityProps = React.useMemo(
    () => ({
      accessibilityRole: 'text' as const, // Use 'text' role for compatibility with ThemedView
      accessibilityLabel: statusConfig.message,
      accessibilityLiveRegion: 'polite' as const,
      accessibilityValue: { text: statusConfig.message },
    }),
    [statusConfig.message]
  );

  return (
    <ThemedView
      style={[dynamicStyles.container, style]}
      testID={testID || 'status-indicator'}
      accessible
      {...accessibilityProps}
    >
      <ThemedView style={[dynamicStyles.badge, { backgroundColor: statusConfig.backgroundColor }]}>
        <ThemedText
          style={[dynamicStyles.text, { color: statusConfig.textColor }, textStyle]}
          testID={testID ? `${testID}-text` : 'status-indicator-text'}
          accessibilityElementsHidden // Hide from accessibility since parent provides context
        >
          {statusConfig.message}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

/**
 * Gets status-specific configuration including messages, colors, and effects
 */
function getStatusConfig(status: GameStatus, colors: any) {
  switch (status) {
    case GameStatus.PLAYING:
      return {
        message: 'Playing',
        backgroundColor: colors.accent,
        textColor: colors.textOnPrimary,
        shadow: 'sm' as const,
      };
    case GameStatus.WON:
      return {
        message: 'You Won!',
        backgroundColor: colors.success || colors.tile2048 || '#10b981', // Victory green
        textColor: colors.textOnPrimary,
        shadow: 'md' as const,
      };
    case GameStatus.LOST:
      return {
        message: 'Game Over',
        backgroundColor: colors.danger || colors.error || '#ef4444', // Error red
        textColor: colors.textOnPrimary,
        shadow: 'sm' as const,
      };
    default:
      return {
        message: 'Playing',
        backgroundColor: colors.accent,
        textColor: colors.textOnPrimary,
        shadow: 'sm' as const,
      };
  }
}

/**
 * Creates dynamic styles based on theme colors and game status
 */
function createStatusStyles(colors: any, status: GameStatus) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    badge: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 80,
      // Platform-specific styling
      ...getPlatformStatusShadow(status),
    } as ViewStyle,

    text: {
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
      letterSpacing: 0.3,
      // Ensure consistent text rendering
      includeFontPadding: false,
      textAlignVertical: 'center',
    } as TextStyle,
  });
}

/**
 * Platform-specific shadow styles for status indicators
 */
function getPlatformStatusShadow(status: GameStatus) {
  // More prominent shadow for victory state
  const intensity = status === GameStatus.WON ? 'medium' : 'small';

  const shadowConfig = {
    small: { opacity: 0.15, radius: 2, offset: { width: 0, height: 1 } },
    medium: { opacity: 0.25, radius: 4, offset: { width: 0, height: 2 } },
  };

  const config = shadowConfig[intensity];

  if (Platform.OS === 'ios') {
    return {
      shadowColor: status === GameStatus.WON ? '#10b981' : '#000',
      shadowOffset: config.offset,
      shadowOpacity: config.opacity,
      shadowRadius: config.radius,
    };
  } else if (Platform.OS === 'android') {
    return {
      elevation: config.radius,
    };
  } else {
    // Web shadow
    const shadowColor = status === GameStatus.WON ? '16, 185, 129' : '0, 0, 0';
    return {
      boxShadow: `${config.offset.width}px ${config.offset.height}px ${config.radius}px rgba(${shadowColor}, ${config.opacity})`,
    };
  }
}

export default StatusIndicator;
