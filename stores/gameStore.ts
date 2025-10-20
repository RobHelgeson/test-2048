import { processMove, spawnRandomTile } from '@/services/gameEngine';
import { Direction, GameState, GameStatus, Tile } from '@/types';
import { create } from 'zustand';

/**
 * Animation state interface for tracking game animations
 */
interface AnimationState {
  isAnimating: boolean;
  activeAnimations: Set<string>;
  pendingAnimations: string[];
}

/**
 * Internal store interface for game state management.
 * This store is designed for internal use by the useGame hook only.
 * All external components should use useGame instead of accessing this store directly.
 *
 * @internal
 */
interface GameStore extends GameState {
  // Animation state
  animationState: AnimationState;

  // Core actions for state management
  makeMove: (direction: Direction) => void;
  resetGame: () => void;
  continueAfterWin: () => void;
  loadGame: (gameState: GameState) => void;

  // Animation management actions
  setAnimating: (animating: boolean) => void;
  startTileAnimation: (tileId: string, animationType: string) => void;
  completeTileAnimation: (tileId: string) => void;
  queueAnimation: (animationId: string) => void;
  clearAnimationQueue: () => void;
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
/**
 * # Game Store - Internal State Management
 *
 * ⚠️  **INTERNAL USE ONLY** - Do not import this directly in components!
 *
 * This Zustand store handles pure state management for the 2048 game.
 * It should only be accessed through the `useGame` hook, which provides
 * the public API with additional features like persistence and validation.
 *
 * ## Architecture Role:
 * - **Pure State Management**: Handles game state updates without side effects
 * - **Internal Implementation**: Components should never import this directly
 * - **Single Responsibility**: Only manages state, no persistence or validation
 *
 * ## Usage Guidelines:
 * ```typescript
 * // ✅ CORRECT - Only useGame hook should access this store
 * // In hooks/useGame.ts:
 * const store = useGameStore();
 *
 * // ❌ WRONG - Components should never import this directly
 * // In components:
 * import { useGameStore } from '../stores/gameStore'; // DON'T DO THIS!
 * ```
 *
 * ## Why This Pattern?
 * By keeping this internal, we ensure:
 * - All persistence logic stays in useGame
 * - Consistent API across all components
 * - Easier testing and refactoring
 * - Clear separation of concerns
 *
 * If you need to modify game behavior, update the public API in useGame.ts instead.
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

  // Initial animation state
  animationState: {
    isAnimating: false,
    activeAnimations: new Set(),
    pendingAnimations: [],
  },

  /**
   * Processes a move in the specified direction using the game engine.
   * Updates the store state with the result from processMove.
   * Now includes animation state management.
   */
  makeMove: (direction: Direction) => {
    const currentState = get();

    // Don't make moves if game is over or won or if animations are running
    if (currentState.gameStatus !== GameStatus.PLAYING || currentState.animationState.isAnimating) {
      return;
    }

    // Process the move using the game engine
    const newState = processMove(currentState, direction);

    // Update the store with the new state, preserving animation state
    set({
      ...newState,
      animationState: currentState.animationState, // Preserve animation state
    });
  },

  /**
   * Resets the game to initial state while preserving best score.
   * Creates a new board with two starting tiles.
   * Also resets animation state.
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
      // Reset animation state
      animationState: {
        isAnimating: false,
        activeAnimations: new Set(),
        pendingAnimations: [],
      },
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
   * Initializes animation state if not present.
   */
  loadGame: (gameState: GameState) => {
    set({
      ...gameState,
      animationState: {
        isAnimating: false,
        activeAnimations: new Set(),
        pendingAnimations: [],
      },
    });
  },

  /**
   * Sets the global animation state
   */
  setAnimating: (animating: boolean) => {
    const currentState = get();
    set({
      ...currentState,
      animationState: {
        ...currentState.animationState,
        isAnimating: animating,
      },
    });
  },

  /**
   * Starts tracking a tile animation
   */
  startTileAnimation: (tileId: string, animationType: string) => {
    const currentState = get();
    const newActiveAnimations = new Set(currentState.animationState.activeAnimations);
    newActiveAnimations.add(tileId);

    set({
      ...currentState,
      animationState: {
        ...currentState.animationState,
        activeAnimations: newActiveAnimations,
        isAnimating: true,
      },
    });
  },

  /**
   * Completes a tile animation and cleans up tracking
   */
  completeTileAnimation: (tileId: string) => {
    const currentState = get();
    const newActiveAnimations = new Set(currentState.animationState.activeAnimations);
    newActiveAnimations.delete(tileId);

    set({
      ...currentState,
      animationState: {
        ...currentState.animationState,
        activeAnimations: newActiveAnimations,
        isAnimating: newActiveAnimations.size > 0, // Only false if no animations left
      },
    });
  },

  /**
   * Queues an animation for later processing
   */
  queueAnimation: (animationId: string) => {
    const currentState = get();
    set({
      ...currentState,
      animationState: {
        ...currentState.animationState,
        pendingAnimations: [...currentState.animationState.pendingAnimations, animationId],
      },
    });
  },

  /**
   * Clears the animation queue
   */
  clearAnimationQueue: () => {
    const currentState = get();
    set({
      ...currentState,
      animationState: {
        ...currentState.animationState,
        pendingAnimations: [],
      },
    });
  },
}));
