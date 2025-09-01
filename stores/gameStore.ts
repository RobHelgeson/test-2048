import { processMove, spawnRandomTile } from '@/services/gameEngine';
import { Direction, GameState, GameStatus, Tile } from '@/types';
import { create } from 'zustand';

/**
 * Internal store interface for game state management.
 * This store is designed for internal use by the useGame hook only.
 * All external components should use useGame instead of accessing this store directly.
 *
 * @internal
 */
interface GameStore extends GameState {
  // Core actions for state management
  makeMove: (direction: Direction) => void;
  resetGame: () => void;
  continueAfterWin: () => void;
  loadGame: (gameState: GameState) => void;
}

/**
 * Creates an initial 4x4 game board with two random starting tiles.
 * @internal
 */
function createInitialBoard() {
  const emptyBoard: (Tile | null)[][] = [
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
  ];

  // Add first tile
  const firstSpawn = spawnRandomTile(emptyBoard);
  if (firstSpawn.tile) {
    emptyBoard[firstSpawn.tile.row][firstSpawn.tile.col] = firstSpawn.tile;
  }

  // Add second tile
  const secondSpawn = spawnRandomTile(emptyBoard);
  if (secondSpawn.tile) {
    emptyBoard[secondSpawn.tile.row][secondSpawn.tile.col] = secondSpawn.tile;
  }

  return emptyBoard;
}

/**
 * Zustand store for 2048 game state management.
 *
 * @internal This store is intended for internal use by useGame hook only.
 * External components should use useGame hook instead of accessing this store directly.
 *
 * Architecture:
 * - Pure state management without side effects
 * - No persistence logic (handled by useGame)
 * - Optimized for internal use with minimal API surface
 */
export const useGameStore = create<GameStore>((set, get) => ({
  // Initial game state
  board: [
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
  ],
  score: 0,
  bestScore: 0,
  gameStatus: GameStatus.PLAYING,
  moveCount: 0,
  startTime: Date.now(),
  lastMoveTime: Date.now(),
  canUndo: false,
  previousBoard: undefined,
  previousScore: undefined,

  /**
   * Processes a move in the specified direction using the game engine.
   * Updates the store state with the result from processMove.
   */
  makeMove: (direction: Direction) => {
    const currentState = get();

    // Don't make moves if game is over or won
    if (currentState.gameStatus !== GameStatus.PLAYING) {
      return;
    }

    // Process the move using the game engine
    const newState = processMove(currentState, direction);

    // Update the store with the new state
    set(newState);
  },

  /**
   * Resets the game to initial state while preserving best score.
   * Creates a new board with two starting tiles.
   */
  resetGame: () => {
    const currentState = get();
    set({
      board: createInitialBoard(),
      score: 0,
      gameStatus: GameStatus.PLAYING,
      moveCount: 0,
      startTime: Date.now(),
      lastMoveTime: Date.now(),
      canUndo: false,
      bestScore: currentState.bestScore, // Preserve best score
      previousBoard: undefined,
      previousScore: undefined,
    });
  },

  /**
   * Continues the game after reaching 2048 tile.
   * Changes game status from WON back to PLAYING.
   */
  continueAfterWin: () => {
    set({
      gameStatus: GameStatus.PLAYING,
    });
  },

  /**
   * Loads a complete game state from external source (e.g., persistence).
   * Used by useGame hook to restore saved games.
   */
  loadGame: (gameState: GameState) => {
    set(gameState);
  },
}));
