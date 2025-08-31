import { ThemedText } from '@/components/themed/ThemedText';
import { ThemedView } from '@/components/themed/ThemedView';
import { useThemeColors } from '@/hooks/useTheme';
import { formatScore } from '@/utils/helpers';
import React from 'react';
import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

interface ScoreDisplayProps {
  /** Label text for the score (e.g., "Score", "Best") */
  label: string;
  /** Numeric score value to display */
  value: number;
  /** Whether this score display should be highlighted (e.g., for new best score) */
  highlighted?: boolean;
  /** Optional custom styling for the container */
  style?: ViewStyle;
  /** Test ID for testing purposes */
  testID?: string;
}

/**
 * ScoreDisplay Component
 *
 * A reusable component for displaying score values with labels.
 * Features theme integration, responsive design, and accessibility support.
 *
 * Used by GameHeader to display current score and best score consistently.
 *
 * Key Features:
 * - Theme-aware styling with surface colors
 * - Number formatting using locale-aware formatScore utility
 * - Highlighted state for special emphasis (new best scores)
 * - Comprehensive accessibility support
 * - Responsive typography and spacing
 */
export function ScoreDisplay({ label, value, highlighted = false, style, testID }: ScoreDisplayProps) {
  const colors = useThemeColors();

  // Create dynamic styles based on theme and highlighted state
  const dynamicStyles = React.useMemo(() => createScoreDisplayStyles(colors, highlighted), [colors, highlighted]);

  // Format the score value for display
  const formattedScore = formatScore(value);

  // Generate accessibility properties
  const accessibilityProps = React.useMemo(
    () => ({
      accessibilityRole: 'text' as const,
      accessibilityLabel: `${label}: ${formattedScore}`,
      accessibilityHint: `Current ${label.toLowerCase()} is ${formattedScore}`,
      accessibilityValue: { text: formattedScore },
    }),
    [label, formattedScore]
  );

  return (
    <ThemedView
      style={[dynamicStyles.container, style]}
      backgroundColor="surface"
      borderRadius="md"
      shadow="sm"
      padding="md"
      testID={testID || `score-display-${label.toLowerCase()}`}
      accessible
      {...accessibilityProps}
    >
      {/* Score Label */}
      <ThemedText
        style={dynamicStyles.label}
        testID={testID ? `${testID}-label` : `score-label-${label.toLowerCase()}`}
        accessibilityElementsHidden // Hide from accessibility since parent provides full context
      >
        {label.toUpperCase()}
      </ThemedText>

      {/* Score Value */}
      <ThemedText
        style={dynamicStyles.value}
        testID={testID ? `${testID}-value` : `score-value-${label.toLowerCase()}`}
        accessibilityElementsHidden // Hide from accessibility since parent provides full context
      >
        {formattedScore}
      </ThemedText>
    </ThemedView>
  );
}

/**
 * Creates dynamic styles based on theme colors and highlighted state
 */
function createScoreDisplayStyles(colors: any, highlighted: boolean) {
  return StyleSheet.create({
    container: {
      minWidth: 80,
      alignItems: 'center',
      justifyContent: 'center',
      // Highlighted state styling
      ...(highlighted && {
        borderWidth: 2,
        borderColor: colors.accent,
        shadowColor: colors.accent,
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      }),
    } as ViewStyle,

    label: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0.5,
      marginBottom: 4,
      textAlign: 'center',
    } as TextStyle,

    value: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
      textAlign: 'center',
      // Ensure consistent height for layout stability
      lineHeight: 22,
      // Prevent text scaling issues on some devices
      includeFontPadding: false,
      textAlignVertical: 'center',
    } as TextStyle,
  });
}

export default ScoreDisplay;
