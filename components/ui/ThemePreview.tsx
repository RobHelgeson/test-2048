import { ClassicTheme } from '@/constants/themes/ClassicTheme';
import { CoolTheme } from '@/constants/themes/CoolTheme';
import { useTheme, useThemeControls } from '@/hooks/useTheme';
import { ThemeType } from '@/types/theme';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface ThemePreviewProps {
  themeType: ThemeType;
  onSelect?: (theme: ThemeType) => void;
  isSelected?: boolean;
  compact?: boolean;
}

/**
 * Theme preview component showing a miniature representation of the theme
 * Displays theme colors and sample tiles for quick selection
 */
export function ThemePreview({ themeType, onSelect, isSelected = false, compact = false }: ThemePreviewProps) {
  const { currentTheme } = useTheme();
  const theme = themeType === 'classic' ? ClassicTheme : CoolTheme;
  const colors = theme.tokens.colors;

  const handlePress = () => {
    onSelect?.(themeType);
  };

  const sampleTiles = [
    { value: 2, color: colors.tile2 },
    { value: 4, color: colors.tile4 },
    { value: 8, color: colors.tile8 },
    { value: 16, color: colors.tile16 },
  ];

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.container,
        compact && styles.containerCompact,
        { backgroundColor: colors.surface },
        { borderColor: isSelected ? colors.primary : colors.border },
        isSelected && styles.selected,
      ]}
    >
      {/* Theme name and description */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{theme.name}</Text>
        {!compact && <Text style={[styles.description, { color: colors.textSecondary }]}>{theme.description}</Text>}
      </View>

      {/* Color palette preview */}
      <View style={styles.colorPalette}>
        <View style={[styles.colorSwatch, { backgroundColor: colors.background }, { borderColor: colors.border }]} />
        <View style={[styles.colorSwatch, { backgroundColor: colors.primary }]} />
        <View style={[styles.colorSwatch, { backgroundColor: colors.accent }]} />
        <View style={[styles.colorSwatch, { backgroundColor: colors.gameBackground }]} />
      </View>

      {/* Sample tiles preview */}
      <View style={styles.tilesPreview}>
        {sampleTiles.map((tile, index) => (
          <View
            key={index}
            style={[
              styles.previewTile,
              compact ? styles.previewTileCompact : styles.previewTileRegular,
              { backgroundColor: tile.color },
              { borderColor: colors.border },
            ]}
          >
            <Text
              style={[
                styles.tileText,
                compact ? styles.tileTextCompact : styles.tileTextRegular,
                {
                  color: tile.value <= 4 ? colors.text : colors.textOnPrimary,
                },
              ]}
            >
              {tile.value}
            </Text>
          </View>
        ))}
      </View>

      {/* Current theme indicator */}
      {currentTheme === themeType && (
        <View style={[styles.currentIndicator, { backgroundColor: colors.success }]}>
          <Text style={[styles.currentText, { color: colors.textOnPrimary }]}>Current</Text>
        </View>
      )}
    </Pressable>
  );
}

/**
 * Theme comparison component showing multiple themes side by side
 */
interface ThemeComparisonProps {
  themes: ThemeType[];
  onThemeSelect: (theme: ThemeType) => void;
  selectedTheme?: ThemeType;
  compact?: boolean;
}

export function ThemeComparison({ themes, onThemeSelect, selectedTheme, compact = false }: ThemeComparisonProps) {
  return (
    <View style={compact ? styles.comparisonCompact : styles.comparison}>
      {themes.map((themeType) => (
        <ThemePreview
          key={themeType}
          themeType={themeType}
          onSelect={onThemeSelect}
          isSelected={selectedTheme === themeType}
          compact={compact}
        />
      ))}
    </View>
  );
}

/**
 * Live theme preview showing real-time changes
 */
interface LiveThemePreviewProps {
  themeType: ThemeType;
}

export function LiveThemePreview({ themeType }: LiveThemePreviewProps) {
  const { setTheme } = useThemeControls();
  const theme = themeType === 'classic' ? ClassicTheme : CoolTheme;
  const colors = theme.tokens.colors;

  // Demo game board state
  const demoBoard = [
    [2, 4, 8, 16],
    [32, 64, 128, 256],
    [512, 1024, 2048, 0],
    [0, 0, 0, 0],
  ];

  const getTileColor = (value: number) => {
    const colorMap: Record<number, string> = {
      2: colors.tile2,
      4: colors.tile4,
      8: colors.tile8,
      16: colors.tile16,
      32: colors.tile32,
      64: colors.tile64,
      128: colors.tile128,
      256: colors.tile256,
      512: colors.tile512,
      1024: colors.tile1024,
      2048: colors.tile2048,
    };
    return value === 0 ? colors.tilePlaceholder : colorMap[value] || colors.tileSuper;
  };

  const getTileTextColor = (value: number) => {
    return value <= 4 ? colors.text : colors.textOnPrimary;
  };

  return (
    <View style={[styles.livePreview, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.liveHeader, { backgroundColor: colors.surface }]}>
        <Text style={[styles.liveTitle, { color: colors.text }]}>{theme.name} Theme Preview</Text>
        <Text style={[styles.liveScore, { color: colors.primary }]}>Score: 12,345</Text>
      </View>

      {/* Game board */}
      <View style={[styles.liveBoard, { backgroundColor: colors.gameBackground }]}>
        {demoBoard.map((row, rowIndex) =>
          row.map((value, colIndex) => (
            <View
              key={`${rowIndex}-${colIndex}`}
              style={[styles.liveTile, { backgroundColor: getTileColor(value) }, { borderColor: colors.border }]}
            >
              {value > 0 && <Text style={[styles.liveTileText, { color: getTileTextColor(value) }]}>{value}</Text>}
            </View>
          ))
        )}
      </View>

      {/* Action button */}
      <Pressable onPress={() => setTheme(themeType)} style={[styles.applyButton, { backgroundColor: colors.primary }]}>
        <Text style={[styles.applyButtonText, { color: colors.textOnPrimary }]}>Apply {theme.name} Theme</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  containerCompact: {
    padding: 12,
    marginBottom: 8,
  },
  selected: {
    borderWidth: 3,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  colorPalette: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  tilesPreview: {
    flexDirection: 'row',
    gap: 6,
  },
  previewTile: {
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewTileRegular: {
    width: 40,
    height: 40,
  },
  previewTileCompact: {
    width: 28,
    height: 28,
  },
  tileText: {
    fontWeight: '600',
  },
  tileTextRegular: {
    fontSize: 12,
  },
  tileTextCompact: {
    fontSize: 10,
  },
  currentIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentText: {
    fontSize: 10,
    fontWeight: '600',
  },
  comparison: {
    gap: 16,
  },
  comparisonCompact: {
    flexDirection: 'row',
    gap: 12,
  },
  livePreview: {
    padding: 20,
    borderRadius: 16,
    minHeight: 300,
  },
  liveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  liveTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  liveScore: {
    fontSize: 16,
    fontWeight: '700',
  },
  liveBoard: {
    width: 200,
    height: 200,
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'center',
    marginBottom: 20,
  },
  liveTile: {
    width: 42,
    height: 42,
    margin: 2,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveTileText: {
    fontSize: 12,
    fontWeight: '600',
  },
  applyButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 160,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
