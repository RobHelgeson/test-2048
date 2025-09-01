import { ThemedText } from '@/components/themed/ThemedText';
import { useThemeColors, useTileColor, useTileTextColor } from '@/hooks/useTheme';
import { Tile as TileData } from '@/types/game';
import React from 'react';
import { Platform, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';

interface TileProps {
  /** Tile data containing value, position, and metadata */
  tile: TileData;
  /** Size of the tile in points/pixels */
  size: number;
  /** Optional press handler for tile interactions */
  onPress?: () => void;
  /** Optional additional styling for the tile container */
  style?: ViewStyle;
  /** Test ID for testing purposes */
  testID?: string;
}

/**
 * Calculate font size based on tile value and tile size
 * Ensures numbers remain readable as they get larger
 */
function calculateFontSize(value: number, tileSize: number): number {
  const baseSize = tileSize * 0.35; // 35% of tile size for base font

  // Scale down font size for larger numbers to maintain readability
  if (value < 100) return Math.round(baseSize);
  if (value < 1000) return Math.round(baseSize * 0.85);
  if (value < 10000) return Math.round(baseSize * 0.75);
  return Math.round(baseSize * 0.65); // For very large numbers like 16384+
}

/**
 * Get accessibility properties for the tile
 */
function getTileAccessibility(tile: TileData) {
  return {
    accessibilityRole: 'button' as const,
    accessibilityLabel: `Tile with value ${tile.value}`,
    accessibilityHint: `Located at row ${tile.row + 1}, column ${tile.col + 1}`,
    accessibilityState: {
      disabled: false,
      selected: false,
    },
  };
}

/**
 * Tile Component
 *
 * Renders individual game tiles with value-based styling and visual hierarchy.
 * Features responsive typography, theme integration, and accessibility support.
 *
 * Key Features:
 * - Value-based color progression using theme system
 * - Responsive typography scaling for readability
 * - Platform-specific touch target optimization
 * - High contrast text colors for accessibility
 * - Special styling for victory tile (2048)
 * - Comprehensive accessibility support
 */
export function Tile({ tile, size, onPress, style, testID }: TileProps) {
  const colors = useThemeColors();
  const getTileColor = useTileColor();
  const getTileTextColor = useTileTextColor();

  // Get tile colors based on value
  const tileBackgroundColor = getTileColor(tile.value);
  const textColor = getTileTextColor(tile.value);
  const fontSize = calculateFontSize(tile.value, size);

  // Check if this is the victory tile (2048)
  const isVictoryTile = tile.value === 2048;

  // Create dynamic styles based on tile properties
  const dynamicStyles = StyleSheet.create({
    container: {
      width: size,
      height: size,
      backgroundColor: tileBackgroundColor,
      borderRadius: 6, // Consistent with GameBoard tile placeholder
      justifyContent: 'center',
      alignItems: 'center',
      // Victory tile special styling
      ...(isVictoryTile && {
        borderWidth: 2,
        borderColor: colors.accent,
      }),
      // Platform-specific shadows for depth
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
        },
        android: {
          elevation: 3,
        },
        web: {
          boxShadow: `0px 2px 6px ${colors.shadow}40`,
        },
      }),
    } as ViewStyle,
    text: {
      color: textColor,
      fontSize: fontSize,
      fontWeight: '700', // Bold weight for better readability
      textAlign: 'center',
      // Platform-specific text properties to prevent truncation
      ...Platform.select({
        ios: {
          lineHeight: fontSize * 1.2, // Explicit line height for iOS
        },
        android: {
          includeFontPadding: false,
          textAlignVertical: 'center',
        },
        web: {
          lineHeight: fontSize * 1.2,
        },
      }),
    } as TextStyle,
  });

  // Accessibility properties
  const accessibilityProps = getTileAccessibility(tile);

  return (
    <View
      style={[dynamicStyles.container, style]}
      testID={testID || `tile-${tile.id}`}
      accessible
      {...accessibilityProps}
      onTouchEnd={onPress} // Using onTouchEnd for better responsiveness
    >
      <ThemedText
        style={dynamicStyles.text}
        testID={testID ? `${testID}-text` : `tile-text-${tile.id}`}
        accessibilityElementsHidden // Hide from accessibility since parent provides label
      >
        {tile.value}
      </ThemedText>
    </View>
  );
}

export default Tile;
