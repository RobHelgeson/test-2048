import { ThemedText } from '@/components/themed/ThemedText';
import { ThemedView } from '@/components/themed/ThemedView';
import { getKeyBindings } from '@/hooks/useKeyboard';
import { useThemeColors } from '@/hooks/useTheme';
import { Direction } from '@/types';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

/**
 * Key binding configuration for display
 */
interface KeyBinding {
  keys: string[];
  direction: Direction;
  label: string;
}

/**
 * Props for the KeyboardIndicator component
 */
interface KeyboardIndicatorProps {
  /** Currently active key directions */
  activeDirections?: Set<Direction>;
  /** Currently pressed direction for highlight feedback */
  pressedDirection?: Direction | null;
  /** Whether to show the keyboard indicator */
  visible?: boolean;
  /** Whether to show only icons or full labels */
  compact?: boolean;
  /** Custom styling for the indicator container */
  style?: ViewStyle;
  /** Test ID for testing purposes */
  testID?: string;
}

/**
 * KeyboardIndicator Component
 *
 * Provides visual feedback for keyboard controls on web platform.
 * Displays available key bindings and highlights active key presses
 * for better user experience and accessibility.
 *
 * Features:
 * - Visual representation of arrow keys and WASD bindings
 * - Real-time feedback for active key presses
 * - Compact and full display modes
 * - Theme integration with proper contrast
 * - Accessibility support with proper labeling
 * - Responsive layout for different screen sizes
 *
 * @param props Configuration object with state and display options
 * @returns JSX element showing keyboard controls indicator
 *
 * @example
 * ```tsx
 * const GameControls = () => {
 *   const { activeKeys, pressedDirection } = useKeyboard({
 *     onKeyPress: handleMove
 *   });
 *
 *   return (
 *     <KeyboardIndicator
 *       activeDirections={new Set([Direction.UP])}
 *       pressedDirection={pressedDirection}
 *       visible={true}
 *       compact={false}
 *     />
 *   );
 * };
 * ```
 */
export function KeyboardIndicator({
  activeDirections = new Set(),
  pressedDirection = null,
  visible = true,
  compact = false,
  style,
  testID = 'keyboard-indicator',
}: KeyboardIndicatorProps) {
  const colors = useThemeColors();
  const keyBindings = getKeyBindings();

  // Dynamic styles based on theme
  const dynamicStyles = React.useMemo(() => createKeyboardIndicatorStyles(colors, compact), [colors, compact]);

  const containerAccessibilityProps = React.useMemo(
    () => ({
      accessibilityRole: 'group' as const,
      accessibilityLabel: 'Keyboard controls indicator',
      accessibilityHint: compact
        ? 'Shows available keyboard controls'
        : 'Shows available keyboard controls with current state',
    }),
    [compact]
  );

  // Don't render if not visible
  if (!visible) {
    return null;
  }

  /**
   * Renders a single key binding with visual feedback
   */
  const renderKeyBinding = (binding: KeyBinding, index: number) => {
    const { keys, direction, label } = binding;
    const isActive = activeDirections.has(direction);
    const isPressed = pressedDirection === direction;

    // Determine visual state
    const keyState = isPressed ? 'pressed' : isActive ? 'active' : 'default';

    const keyStateStyleName =
      `keyState${keyState.charAt(0).toUpperCase() + keyState.slice(1)}` as keyof typeof dynamicStyles;
    const textStateStyleName =
      `keyText${keyState.charAt(0).toUpperCase() + keyState.slice(1)}` as keyof typeof dynamicStyles;

    const keyStyle = [dynamicStyles.keyContainer, dynamicStyles[keyStateStyleName]];

    const textStyle = [dynamicStyles[textStateStyleName]];

    return (
      <ThemedView
        key={`${direction}-${index}`}
        style={keyStyle as any}
        testID={`${testID}-key-${direction}`}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`${label} - Keys: ${keys.join(' or ')}`}
        accessibilityState={{
          selected: isActive,
        }}
      >
        {/* Key symbols */}
        <View style={dynamicStyles.keysRow}>
          {keys.map((key, keyIndex) => (
            <View key={`${key}-${keyIndex}`} style={dynamicStyles.individualKey}>
              <ThemedText style={[dynamicStyles.keySymbol, textStyle]}>{key}</ThemedText>
            </View>
          ))}
        </View>

        {/* Direction label (only in non-compact mode) */}
        {!compact && (
          <ThemedText style={[dynamicStyles.keyLabel, textStyle]}>{getDirectionLabel(direction)}</ThemedText>
        )}
      </ThemedView>
    );
  };

  /**
   * Renders keyboard layout in directional arrangement
   */
  const renderDirectionalLayout = () => {
    const upBinding = keyBindings.find((b) => b.direction === Direction.UP);
    const downBinding = keyBindings.find((b) => b.direction === Direction.DOWN);
    const leftBinding = keyBindings.find((b) => b.direction === Direction.LEFT);
    const rightBinding = keyBindings.find((b) => b.direction === Direction.RIGHT);

    return (
      <View style={dynamicStyles.directionalLayout}>
        {/* Top row - Up key */}
        <View style={dynamicStyles.topRow}>{upBinding && renderKeyBinding(upBinding, 0)}</View>

        {/* Middle row - Left, Down, Right keys */}
        <View style={dynamicStyles.middleRow}>
          {leftBinding && renderKeyBinding(leftBinding, 1)}
          {downBinding && renderKeyBinding(downBinding, 2)}
          {rightBinding && renderKeyBinding(rightBinding, 3)}
        </View>
      </View>
    );
  };

  /**
   * Renders keyboard layout in horizontal row
   */
  const renderLinearLayout = () => {
    return <View style={dynamicStyles.linearLayout}>{keyBindings.map(renderKeyBinding)}</View>;
  };

  return (
    <View style={[dynamicStyles.container, style]} testID={testID} accessible {...containerAccessibilityProps}>
      {compact ? renderLinearLayout() : renderDirectionalLayout()}

      {/* Optional help text for web users */}
      {!compact && <ThemedText style={dynamicStyles.helpText}>Use arrow keys or WASD to move</ThemedText>}
    </View>
  );
}

/**
 * Helper function to get readable direction labels
 */
function getDirectionLabel(direction: Direction): string {
  switch (direction) {
    case Direction.UP:
      return 'Up';
    case Direction.DOWN:
      return 'Down';
    case Direction.LEFT:
      return 'Left';
    case Direction.RIGHT:
      return 'Right';
    default:
      return '';
  }
}

/**
 * Creates dynamic styles based on theme and display mode
 */
function createKeyboardIndicatorStyles(colors: any, compact: boolean) {
  const baseKeySize = compact ? 32 : 40;
  const spacing = compact ? 4 : 8;

  return StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingVertical: compact ? 4 : 8,
      paddingHorizontal: compact ? 8 : 12,
    },

    // Layout styles
    directionalLayout: {
      alignItems: 'center',
      gap: spacing,
    },

    linearLayout: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing,
      flexWrap: 'wrap',
      justifyContent: 'center',
    },

    topRow: {
      alignItems: 'center',
    },

    middleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing * 2,
    },

    // Key container styles
    keyContainer: {
      alignItems: 'center',
      paddingVertical: spacing / 2,
      paddingHorizontal: spacing,
      borderRadius: compact ? 6 : 8,
      borderWidth: 1,
      minWidth: baseKeySize,
      minHeight: baseKeySize,
      gap: compact ? 2 : 4,
    },

    // Key states
    keyStateDefault: {
      backgroundColor: colors.tilePlaceholder,
      borderColor: colors.textSecondary + '40', // 25% opacity
    },

    keyStateActive: {
      backgroundColor: colors.primary + '20', // 12% opacity
      borderColor: colors.primary + '60', // 37% opacity
    },

    keyStatePressed: {
      backgroundColor: colors.primary + '30', // 18% opacity
      borderColor: colors.primary,
      transform: [{ scale: 0.95 }],
    },

    // Individual key styles
    keysRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },

    individualKey: {
      paddingHorizontal: 2,
    },

    // Text styles
    keySymbol: {
      fontSize: compact ? 12 : 14,
      fontWeight: '600',
      textAlign: 'center',
    },

    keyLabel: {
      fontSize: compact ? 10 : 12,
      textAlign: 'center',
      opacity: 0.8,
    },

    keyTextDefault: {
      color: colors.textSecondary,
    },

    keyTextActive: {
      color: colors.primary,
    },

    keyTextPressed: {
      color: colors.primary,
      fontWeight: 'bold',
    },

    // Help text
    helpText: {
      fontSize: 11,
      marginTop: spacing,
      textAlign: 'center',
      opacity: 0.7,
      color: colors.textSecondary,
    },
  });
}

export default KeyboardIndicator;
