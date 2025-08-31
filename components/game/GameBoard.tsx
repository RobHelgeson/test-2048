import { Tile } from '@/components/game/Tile';
import { useThemeColors } from '@/hooks/useTheme';
import { useGameStore } from '@/stores/gameStore';
import { useGestures } from '@/hooks/useGestures';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, useWindowDimensions, View, ViewStyle } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { Direction } from '@/types';

// Simple constants
const MAX_BOARD_SIZE = 640;
const BOARD_MARGIN = 32;
const GRID_GAP = 8;

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
 * GameBoard Component
 *
 * Simple 4x4 game board using flexbox layout.
 *
 * Features:
 * - Responsive flexbox layout (max 640px)
 * - Theme integration
 * - Accessibility support
 */
export function GameBoard({ style, disabled = false, onTilePress, testID = 'game-board' }: GameBoardProps) {
  const { width } = useWindowDimensions();

  const [boardSize, setBoardSize] = useState<number>(Math.max(Math.min(width - BOARD_MARGIN, MAX_BOARD_SIZE), 224));
  const [tileSize, setTileSize] = useState<number>((boardSize - GRID_GAP * 6) / 4);
  const [styles, setStyles] = useState(createStyles(useThemeColors(), boardSize, tileSize));

  const board = useGameStore((state) => state.board) || [
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
  ];
  const makeMove = useGameStore((state) => state.makeMove);
  const initGame = useGameStore((state) => state.initGame);

  const isAnimating = false;
  const colors = useThemeColors();

  useEffect(() => {
    setTileSize((boardSize - GRID_GAP * 6) / 4);
  }, [boardSize]);

  useEffect(() => {
    setBoardSize(Math.max(Math.min(width - BOARD_MARGIN, MAX_BOARD_SIZE), 224));
  }, [width]);

  useEffect(() => {
    setStyles(createStyles(colors, boardSize, tileSize));
  }, [colors, boardSize, tileSize]);

  // Initialize game on component mount
  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleTilePress = (row: number, col: number) => {
    if (disabled || isAnimating) return;
    onTilePress?.(row, col);
  };

  // Gesture handling callback
  const handleSwipe = useCallback(
    (direction: Direction) => {
      if (disabled || isAnimating) return;
      makeMove(direction);
    },
    [disabled, isAnimating, makeMove]
  );

  // Create gesture detector
  const gesture = useGestures({
    onSwipe: handleSwipe,
    disabled: disabled || isAnimating,
  });

  const tileCount = board.flat().filter((tile) => tile !== null).length;
  const accessibilityLabel = `Game board with 4 by 4 grid, ${tileCount} tiles currently placed`;

  return (
    <GestureDetector gesture={gesture}>
      <View
        style={[styles.gridContainer, style]}
        testID={testID}
        accessible
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Swipe in any direction to move tiles and merge numbers"
      >
        {board.map((row, rowIndex) =>
          row.map((tile, colIndex) => (
            <TouchableOpacity
              key={`cell-${rowIndex}-${colIndex}`}
              style={styles.gridCell}
              onPress={() => handleTilePress(rowIndex, colIndex)}
              disabled={disabled || isAnimating}
              testID={`${testID}-cell-${rowIndex}-${colIndex}`}
              accessible
              accessibilityRole="button"
              accessibilityLabel={
                tile
                  ? `Tile with value ${tile.value} at row ${rowIndex + 1}, column ${colIndex + 1}`
                  : `Empty space at row ${rowIndex + 1}, column ${colIndex + 1}`
              }
            >
              {tile && (
                <Tile
                  tile={tile}
                  size={tileSize}
                  onPress={() => handleTilePress(rowIndex, colIndex)}
                  testID={`${testID}-tile-${tile.id}`}
                />
              )}
            </TouchableOpacity>
          ))
        )}
      </View>
    </GestureDetector>
  );
}

function createStyles(colors: any, boardSize: number, tileSize: number) {
  return StyleSheet.create({
    gridContainer: {
      alignSelf: 'center',
      width: boardSize,
      height: boardSize,
      backgroundColor: colors.gameBackground,
      borderRadius: 16,
      padding: 12,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignContent: 'space-between',
      gap: GRID_GAP,
    },

    gridCell: {
      width: tileSize,
      height: tileSize,
      backgroundColor: colors.tilePlaceholder,
      borderRadius: 6,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
}

export default GameBoard;
