import {Tile} from '@/components/game/Tile';
import {ThemedView} from '@/components/themed/ThemedView';
import {useThemeColors} from '@/hooks/useTheme';
import {useGameStore} from '@/stores/gameStore';
import React, {useMemo} from 'react';
import {Dimensions, Platform, StyleSheet, TouchableOpacity, View, ViewStyle} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// Platform-specific touch target sizes (minimum requirements)
const TOUCH_TARGETS = {
  ios: 44, // 44x44pt minimum
  android: 48, // 48x48dp minimum
  web: 32, // 32x32px minimum
} as const;

// Board sizing constants
const MIN_BOARD_SIZE = 320;
const MAX_BOARD_SIZE = 500;
const BOARD_MARGIN = 32; // 16pt on each side
const GRID_GAP = 8; // 8pt grid system

interface GameBoardProps {
  /**
   * Optional custom styling for the board container
   */
  style?: ViewStyle;

  /**
   * Whether touch interactions are disabled (e.g., during animations)
   */
  disabled?: boolean;

  /**
   * Optional callback for tile press events (for testing/debugging)
   */
  onTilePress?: (row: number, col: number) => void;

  /**
   * Test ID for the board container
   */
  testID?: string;
}

/**
 * Calculates optimal board size based on screen dimensions
 * Ensures responsive layout with proper touch targets
 */
function calculateBoardSize(): number {
  const availableSpace = screenWidth - BOARD_MARGIN * 2;
  return Math.min(Math.max(availableSpace, MIN_BOARD_SIZE), MAX_BOARD_SIZE);
}

/**
 * Calculates tile size based on board size and grid layout
 * Ensures minimum touch target requirements are met
 */
function calculateTileSize(boardSize: number): number {
  const availableSpaceForTiles = boardSize - GRID_GAP * 3; // 3 gaps: between 4 tiles (3 internal gaps)
  const baseTileSize = availableSpaceForTiles / 4; // 4x4 grid

  // Ensure minimum touch target size for current platform
  const platformMinSize = TOUCH_TARGETS[Platform.OS as keyof typeof TOUCH_TARGETS] || TOUCH_TARGETS.web;

  return Math.max(baseTileSize, platformMinSize);
}

/**
 * GameBoard Component
 *
 * Responsive 4x4 game board that adapts to different screen sizes.
 * Provides optimal touch targets and visual layout across all devices.
 *
 * Features:
 * - Responsive grid layout (320px - 500px)
 * - Platform-specific touch target optimization
 * - Theme integration with design tokens
 * - Accessibility support for screen readers
 * - Performance optimized with memoization
 */
export function GameBoard({ style, disabled = false, onTilePress, testID = 'game-board' }: GameBoardProps) {
  // Subscribe to game state
  const storeBoard = useGameStore((state) => state.board);

  // Provide a fallback empty board if no board from store
  const defaultBoard = useMemo(
    () => [
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ],
    []
  );

  const board = storeBoard || defaultBoard;
  // TODO: Replace with actual animation state when implemented
  const isAnimating = false; // Placeholder for animation state

  // Theme integration
  const colors = useThemeColors();

  // Memoized board calculations for performance
  const boardDimensions = useMemo(() => {
    const boardSize = calculateBoardSize();
    const tileSize = calculateTileSize(boardSize);

    return {
      boardSize,
      tileSize,
      containerSize: boardSize + GRID_GAP * 2, // Add padding
    };
  }, []); // screenWidth is captured at module load, doesn't need to be a dependency

  // Memoized styles for performance
  const styles = useMemo(() => createStyles(colors, boardDimensions), [colors, boardDimensions]);

  // Handle tile press events
  const handleTilePress = (row: number, col: number) => {
    if (disabled || isAnimating) return;
    onTilePress?.(row, col);
  };

  // Generate accessibility label for the board
  const boardAccessibilityLabel = useMemo(() => {
    if (!board) {
      return 'Game board with 4 by 4 grid, 0 tiles currently placed';
    }
    const tileCount = board.flat().filter((tile) => tile !== null).length;
    return `Game board with 4 by 4 grid, ${tileCount} tiles currently placed`;
  }, [board]);

  return (
    <ThemedView
      style={[styles.container, style]}
      testID={testID}
      backgroundColor="gameBackground"
      borderRadius="lg"
      shadow="base"
      accessible
      accessibilityRole="button" // Using button role for React Native compatibility
      accessibilityLabel={boardAccessibilityLabel}
      accessibilityHint="Swipe in any direction to move tiles and merge numbers"
    >
      <View style={styles.gridContainer} testID={`${testID}-grid`}>
        {board.map((row, rowIndex) =>
          row.map((tile, colIndex) => (
            <TouchableOpacity
              key={`cell-${rowIndex}-${colIndex}`}
              style={styles.gridCell}
              onPress={() => handleTilePress(rowIndex, colIndex)}
              disabled={disabled || isAnimating}
              testID={`${testID}-cell-${rowIndex}-${colIndex}`}
              accessible
              accessibilityRole="button" // Using button role for React Native compatibility
              accessibilityLabel={
                tile
                  ? `Tile with value ${tile.value} at row ${rowIndex + 1}, column ${colIndex + 1}`
                  : `Empty space at row ${rowIndex + 1}, column ${colIndex + 1}`
              }
              accessibilityState={{
                disabled: disabled || isAnimating,
              }}
            >
              <View style={styles.tilePlaceholder}>
                {tile ? (
                  <Tile
                    tile={tile}
                    size={boardDimensions.tileSize}
                    onPress={() => handleTilePress(rowIndex, colIndex)}
                    testID={`${testID}-tile-${tile.id}`}
                  />
                ) : null}
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ThemedView>
  );
}

/**
 * Creates dynamic styles based on theme colors and board dimensions
 */
function createStyles(colors: any, dimensions: { boardSize: number; tileSize: number; containerSize: number }) {
  const { boardSize, tileSize, containerSize } = dimensions;

  return StyleSheet.create({
    container: {
      alignSelf: 'center',
      width: containerSize,
      height: containerSize,
      justifyContent: 'center',
      alignItems: 'center',
      // Platform-specific enhancements
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        },
        android: {
          elevation: 6,
        },
        web: {
          boxShadow: `0 4px 8px ${colors.shadow}30`,
        },
      }),
    },

    gridContainer: {
      width: boardSize,
      height: boardSize,
      position: 'relative',
      display: Platform.OS === 'web' ? 'grid' : 'flex',
      // CSS Grid for web
      ...(Platform.OS === 'web' && {
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(4, 1fr)',
        gap: GRID_GAP,
      }),
      // Flexbox fallback for native platforms
      ...(Platform.OS !== 'web' && {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly',
        alignContent: 'space-evenly',
      }),
    },

    gridCell: {
      width: tileSize,
      height: tileSize,
      // Remove margin on web (handled by CSS Grid gap)
      ...(Platform.OS !== 'web' && {
        margin: GRID_GAP / 4, // Smaller margin for native
      }),
      borderRadius: 6, // Slightly rounded corners for visual appeal
      // Ensure minimum touch target is met
      minWidth: TOUCH_TARGETS[Platform.OS as keyof typeof TOUCH_TARGETS] || TOUCH_TARGETS.web,
      minHeight: TOUCH_TARGETS[Platform.OS as keyof typeof TOUCH_TARGETS] || TOUCH_TARGETS.web,
    },

    tilePlaceholder: {
      flex: 1,
      backgroundColor: colors.tilePlaceholder,
      borderRadius: 4,
      justifyContent: 'center',
      alignItems: 'center',
      // Subtle border for empty tiles
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border + '40', // 25% opacity
      // Ensure proper positioning on web
      ...(Platform.OS === 'web' && {
        width: '100%',
        height: '100%',
        position: 'relative',
      }),
    },
  });
}

export default GameBoard;
