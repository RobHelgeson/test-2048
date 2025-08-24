import { useReducer, useCallback, useEffect, useState } from 'react';
import { GameState, Direction, GameStatus, Tile } from '@/types/game';
import { processMove } from '@/services/gameEngine';
import { storageService } from '@/services/storageService';

/**
 * Game action types for useReducer
 */
export interface GameAction {
  type:
    | 'START_NEW_GAME'
    | 'MAKE_MOVE'
    | 'RESET_GAME'
    | 'CONTINUE_AFTER_WIN'
    | 'SET_ANIMATING'
    | 'LOAD_GAME';
  payload?: {
    direction?: Direction;
    isAnimating?: boolean;
    gameState?: GameState;
  };
}

/**
 * Return type for useGame hook
 */
export interface UseGameReturn {
  gameState: GameState;
  actions: {
    startNewGame: () => void;
    makeMove: (direction: Direction) => void;
    resetGame: () => void;
    continueAfterWin: () => void;
  };
  isLoading: boolean;
  canMove: boolean;
}

/**
 * Creates an empty 4x4 board
 */
function createEmptyBoard(): (Tile | null)[][] {
  return Array(4)
    .fill(null)
    .map(() => Array(4).fill(null));
}

/**
 * Generates a unique tile ID
 */
function generateTileId(): string {
  return `tile-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Creates initial tiles for a new game
 */
function createInitialTiles(): Tile[] {
  const tiles: Tile[] = [];
  const positions = [
    { row: 0, col: 0 },
    { row: 3, col: 3 },
  ];

  for (let i = 0; i < 2; i++) {
    const value = Math.random() < 0.9 ? 2 : 4;
    tiles.push({
      id: generateTileId(),
      value,
      row: positions[i].row,
      col: positions[i].col,
      isNew: true,
    });
  }

  return tiles;
}

/**
 * Creates initial game state
 */
function createInitialGameState(): GameState {
  const board = createEmptyBoard();
  const initialTiles = createInitialTiles();

  // Place initial tiles on board
  for (const tile of initialTiles) {
    board[tile.row][tile.col] = tile;
  }

  return {
    board,
    score: 0,
    bestScore: 0,
    gameStatus: GameStatus.PLAYING,
    moveCount: 0,
    startTime: Date.now(),
    lastMoveTime: Date.now(),
    canUndo: false,
  };
}

/**
 * Game reducer function for managing game state transitions
 */
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_NEW_GAME': {
      const newState = createInitialGameState();
      return {
        ...newState,
        bestScore: state.bestScore, // Preserve best score
      };
    }

    case 'MAKE_MOVE': {
      if (!action.payload?.direction) {
        return state;
      }

      // Validate move before processing
      if (state.gameStatus === GameStatus.LOST) {
        return state;
      }

      // Process the move using game engine
      return processMove(state, action.payload.direction);
    }

    case 'RESET_GAME': {
      const newState = createInitialGameState();
      return {
        ...newState,
        bestScore: state.bestScore, // Preserve best score
      };
    }

    case 'CONTINUE_AFTER_WIN': {
      return {
        ...state,
        gameStatus: GameStatus.PLAYING,
      };
    }

    case 'SET_ANIMATING': {
      // Animation state is handled at component level
      // This action is reserved for future animation state management
      return state;
    }

    case 'LOAD_GAME': {
      if (!action.payload?.gameState) {
        return state;
      }
      return action.payload.gameState;
    }

    default:
      return state;
  }
}

/**
 * Validates if a move is possible
 * Checks game state and move feasibility
 */
function validateMove(gameState: GameState, _direction: Direction): boolean {
  // Prevent moves when game is over
  if (gameState.gameStatus === GameStatus.LOST) {
    return false;
  }

  // Additional validation could be added here to check if move actually changes board
  // For now, allow all moves when game is active to delegate validation to game engine
  return true;
}

/**
 * Custom hook for managing 2048 game state and actions
 * Provides game logic, state persistence, and action dispatchers
 *
 * @returns UseGameReturn object with game state and action functions
 *
 * @example
 * ```typescript
 * const { gameState, actions, isLoading, canMove } = useGame();
 *
 * // Start a new game
 * actions.startNewGame();
 *
 * // Make a move
 * if (canMove) {
 *   actions.makeMove(Direction.LEFT);
 * }
 * ```
 */
export function useGame(): UseGameReturn {
  // Main game state managed by useReducer
  const [gameState, dispatch] = useReducer(
    gameReducer,
    null,
    createInitialGameState
  );

  // Local state for loading operations
  const [isLoading, setIsLoading] = useState(false);

  // Load persisted game state on hook initialization
  useEffect(() => {
    const loadPersistedGame = async () => {
      setIsLoading(true);
      try {
        const persistedState = await storageService.loadGameState();
        if (persistedState) {
          dispatch({
            type: 'LOAD_GAME',
            payload: { gameState: persistedState },
          });
        }
      } catch (error) {
        console.error('Failed to load game state:', error);
        // Continue with initial state if loading fails
      } finally {
        setIsLoading(false);
      }
    };

    loadPersistedGame();
  }, []);

  // Save game state after each update
  useEffect(() => {
    const saveGameState = async () => {
      try {
        await storageService.saveGameState(gameState);
      } catch (error) {
        console.error('Failed to save game state:', error);
        // Continue gameplay gracefully even if persistence fails
      }
    };

    // Only save after actual moves, not on initial state or loading
    if (gameState.moveCount > 0 && !isLoading) {
      saveGameState();
    }
  }, [gameState, isLoading]);

  // Action creators with useCallback for performance
  const startNewGame = useCallback(() => {
    dispatch({ type: 'START_NEW_GAME' });
  }, []);

  const makeMove = useCallback(
    (direction: Direction) => {
      if (!validateMove(gameState, direction)) {
        return;
      }

      dispatch({
        type: 'MAKE_MOVE',
        payload: { direction },
      });
    },
    [gameState]
  );

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const continueAfterWin = useCallback(() => {
    dispatch({ type: 'CONTINUE_AFTER_WIN' });
  }, []);

  // Calculate if moves are currently possible
  const canMove = gameState.gameStatus !== GameStatus.LOST && !isLoading;

  return {
    gameState,
    actions: {
      startNewGame,
      makeMove,
      resetGame,
      continueAfterWin,
    },
    isLoading,
    canMove,
  };
}
