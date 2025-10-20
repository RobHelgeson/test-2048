import { storageService } from '@/services/storageService';
import { useGameStore } from '@/stores/gameStore';
import { Direction, GameState, GameStatus } from '@/types/game';
import { useCallback, useEffect, useMemo, useState } from 'react';

// GameAction interface removed - now using useGameStore actions directly

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

// Helper functions and reducer logic moved to useGameStore
// This hook now wraps the store and adds persistence logic

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
/**
 * # Game State Architecture - Public API
 * 
 * This hook serves as the **PUBLIC API** for all game state interactions in components.
 * It implements a layered architecture pattern where:
 * 
 * ## Architecture Layers:
 * 1. **Components** → Only interact with `useGame()` (this hook)
 * 2. **useGame** → Provides persistence, validation, and public API
 * 3. **useGameStore** → Internal pure state management (Zustand store)
 * 4. **gameEngine** → Pure business logic functions
 * 
 * ## Why This Architecture?
 * - **Single Source of Truth**: All components use the same API
 * - **Separation of Concerns**: Persistence logic separate from pure state
 * - **Maintainability**: Clear boundaries between layers
 * - **Testability**: Each layer can be tested independently
 * 
 * ## Component Usage Guidelines:
 * ```typescript
 * // ✅ CORRECT - Components should only use useGame
 * const { gameState, actions, isLoading } = useGame();
 * 
 * // ❌ WRONG - Never import useGameStore directly in components  
 * const store = useGameStore(); // This breaks the architecture!
 * ```
 * 
 * ## Migration Notes:
 * If you need to add new game functionality:
 * 1. Add pure logic to gameEngine.ts
 * 2. Add state management to gameStore.ts (internal)
 * 3. Expose through useGame.ts (public API)
 * 4. Components only import useGame
 * 
 * This ensures consistency and makes future refactoring easier.
 */

export function useGame(): UseGameReturn {
  // Get store state and actions
  const store = useGameStore();

  // Extract state and actions from store
  const gameState: GameState = useMemo<GameState>(
    () => ({
      board: store.board,
      score: store.score,
      bestScore: store.bestScore,
      gameStatus: store.gameStatus,
      moveCount: store.moveCount,
      startTime: store.startTime,
      lastMoveTime: store.lastMoveTime,
      canUndo: store.canUndo,
      previousBoard: store.previousBoard,
      previousScore: store.previousScore,
    }),
    [
      store.board,
      store.score,
      store.bestScore,
      store.gameStatus,
      store.moveCount,
      store.startTime,
      store.lastMoveTime,
      store.canUndo,
      store.previousBoard,
      store.previousScore,
    ]
  );

  // Local state for loading operations
  const [isLoading, setIsLoading] = useState(false);
  // Flag to ensure persistence loading only happens once
  const [hasLoadedPersistence, setHasLoadedPersistence] = useState(false);

  // Load persisted game state on hook initialization - only once
  useEffect(() => {
    if (hasLoadedPersistence) return;

    const loadPersistedGame = async () => {
      setIsLoading(true);
      try {
        const persistedState = await storageService.loadGameState();
        if (persistedState) {
          store.loadGame(persistedState);
        } else {
          // Initialize game with starting tiles if no persisted state
          store.resetGame();
        }
      } catch (error) {
        console.error('Failed to load game state:', error);
        // Initialize game with starting tiles if loading fails
        store.resetGame();
      } finally {
        setIsLoading(false);
        setHasLoadedPersistence(true);
      }
    };

    loadPersistedGame();
  }, [hasLoadedPersistence, store.loadGame, store.resetGame]);

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
    if (gameState.moveCount > 0 && !isLoading && hasLoadedPersistence) {
      saveGameState();
    }
  }, [gameState, isLoading, hasLoadedPersistence]);

  // Action creators with useCallback for performance
  const startNewGame = useCallback(() => {
    store.resetGame();
  }, [store.resetGame]);

  const makeMove = useCallback(
    (direction: Direction) => {
      if (!validateMove(gameState, direction)) {
        return;
      }

      store.makeMove(direction);
    },
    [gameState, store.makeMove]
  );

  const resetGame = useCallback(() => {
    store.resetGame();
  }, [store.resetGame]);

  const continueAfterWin = useCallback(() => {
    store.continueAfterWin();
  }, [store.continueAfterWin]);

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
