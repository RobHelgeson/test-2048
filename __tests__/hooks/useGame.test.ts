import { renderHook, act } from '@testing-library/react-native';
import { useGame } from '@/hooks/useGame';
import { Direction, GameStatus, GameState } from '@/types/game';
import { storageService } from '@/services/storageService';
import * as gameEngine from '@/services/gameEngine';

// Mock the storage service
jest.mock('@/services/storageService', () => ({
  storageService: {
    saveGameState: jest.fn(),
    loadGameState: jest.fn(),
    clearGameState: jest.fn(),
  },
}));

// Mock the game engine
jest.mock('@/services/gameEngine', () => ({
  processMove: jest.fn(),
}));

const mockStorageService = storageService as jest.Mocked<typeof storageService>;
const mockGameEngine = gameEngine as jest.Mocked<typeof gameEngine>;

describe('useGame Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorageService.loadGameState.mockResolvedValue(null);
    mockStorageService.saveGameState.mockResolvedValue();
  });

  describe('Hook Initialization', () => {
    it('should initialize with default game state', async () => {
      const { result } = renderHook(() => useGame());

      await act(async () => {
        // Wait for initial loading to complete
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.gameState.score).toBe(0);
      expect(result.current.gameState.bestScore).toBe(0);
      expect(result.current.gameState.gameStatus).toBe(GameStatus.PLAYING);
      expect(result.current.gameState.moveCount).toBe(0);
      expect(result.current.gameState.canUndo).toBe(false);
      expect(result.current.gameState.board).toBeDefined();
      expect(result.current.gameState.board).toHaveLength(4);
      expect(result.current.gameState.board[0]).toHaveLength(4);
    });

    it('should create initial board with 2 tiles', async () => {
      const { result } = renderHook(() => useGame());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const board = result.current.gameState.board;
      let tileCount = 0;

      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          if (board[row][col] !== null) {
            tileCount++;
            expect(board[row][col]?.value).toBeGreaterThan(0);
            expect([2, 4]).toContain(board[row][col]?.value);
          }
        }
      }

      expect(tileCount).toBe(2);
    });

    it('should restore game state from persisted data', async () => {
      const mockPersistedState = {
        board: Array(4)
          .fill(null)
          .map(() => Array(4).fill(null)),
        score: 1024,
        bestScore: 2048,
        gameStatus: GameStatus.PLAYING,
        moveCount: 42,
        startTime: Date.now() - 1000,
        lastMoveTime: Date.now(),
        canUndo: true,
        previousBoard: Array(4)
          .fill(null)
          .map(() => Array(4).fill(null)),
        previousScore: 896,
      };

      mockStorageService.loadGameState.mockResolvedValue(mockPersistedState);

      const { result } = renderHook(() => useGame());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(result.current.gameState.score).toBe(1024);
      expect(result.current.gameState.bestScore).toBe(2048);
      expect(result.current.gameState.moveCount).toBe(42);
      expect(mockStorageService.loadGameState).toHaveBeenCalledTimes(1);
    });

    it('should handle persistence errors gracefully during initialization', async () => {
      mockStorageService.loadGameState.mockRejectedValue(
        new Error('Storage error')
      );

      const { result } = renderHook(() => useGame());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // Should continue with default state despite error
      expect(result.current.gameState.score).toBe(0);
      expect(result.current.isLoading).toBe(false);
    });

    it('should set loading state during initialization', async () => {
      let resolveLoadGame: (value: GameState | null) => void;
      const loadGamePromise = new Promise<GameState | null>((resolve) => {
        resolveLoadGame = resolve;
      });
      mockStorageService.loadGameState.mockReturnValue(loadGamePromise);

      const { result } = renderHook(() => useGame());

      // Initially should be loading
      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolveLoadGame!(null);
        await loadGamePromise;
      });

      // Loading should be false after completion
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Game Actions', () => {
    describe('startNewGame', () => {
      it('should start a new game with fresh state', async () => {
        const { result } = renderHook(() => useGame());

        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        // Modify state first
        const initialBestScore = result.current.gameState.bestScore;

        await act(async () => {
          result.current.actions.startNewGame();
        });

        expect(result.current.gameState.score).toBe(0);
        expect(result.current.gameState.gameStatus).toBe(GameStatus.PLAYING);
        expect(result.current.gameState.moveCount).toBe(0);
        expect(result.current.gameState.canUndo).toBe(false);
        expect(result.current.gameState.bestScore).toBe(initialBestScore); // Should preserve best score
      });
    });

    describe('makeMove', () => {
      beforeEach(() => {
        const mockMoveResult = {
          board: Array(4)
            .fill(null)
            .map(() => Array(4).fill(null)),
          score: 100,
          bestScore: 100,
          gameStatus: GameStatus.PLAYING,
          moveCount: 1,
          startTime: Date.now(),
          lastMoveTime: Date.now(),
          canUndo: true,
          previousBoard: Array(4)
            .fill(null)
            .map(() => Array(4).fill(null)),
          previousScore: 0,
        };
        mockGameEngine.processMove.mockReturnValue(mockMoveResult);
      });

      it('should process valid moves', async () => {
        const { result } = renderHook(() => useGame());

        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        await act(async () => {
          result.current.actions.makeMove(Direction.LEFT);
        });

        expect(mockGameEngine.processMove).toHaveBeenCalledWith(
          expect.any(Object),
          Direction.LEFT
        );
      });

      it('should test all four directions', async () => {
        const { result } = renderHook(() => useGame());

        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        const directions = [
          Direction.UP,
          Direction.DOWN,
          Direction.LEFT,
          Direction.RIGHT,
        ];

        for (const direction of directions) {
          await act(async () => {
            result.current.actions.makeMove(direction);
          });

          expect(mockGameEngine.processMove).toHaveBeenCalledWith(
            expect.any(Object),
            direction
          );
        }

        expect(mockGameEngine.processMove).toHaveBeenCalledTimes(4);
      });

      it('should prevent moves when game is lost', async () => {
        // Set up initial state with lost game
        const lostGameState = {
          board: Array(4)
            .fill(null)
            .map(() => Array(4).fill(null)),
          score: 1000,
          bestScore: 1000,
          gameStatus: GameStatus.LOST,
          moveCount: 100,
          startTime: Date.now() - 10000,
          lastMoveTime: Date.now(),
          canUndo: false,
        };

        mockStorageService.loadGameState.mockResolvedValue(lostGameState);

        const { result } = renderHook(() => useGame());

        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
        });

        await act(async () => {
          result.current.actions.makeMove(Direction.LEFT);
        });

        expect(mockGameEngine.processMove).not.toHaveBeenCalled();
      });
    });

    describe('resetGame', () => {
      it('should reset game while preserving best score', async () => {
        // Set up initial state with some progress
        const gameState = {
          board: Array(4)
            .fill(null)
            .map(() => Array(4).fill(null)),
          score: 1000,
          bestScore: 2000,
          gameStatus: GameStatus.PLAYING,
          moveCount: 50,
          startTime: Date.now() - 10000,
          lastMoveTime: Date.now(),
          canUndo: true,
          previousBoard: Array(4)
            .fill(null)
            .map(() => Array(4).fill(null)),
          previousScore: 900,
        };

        mockStorageService.loadGameState.mockResolvedValue(gameState);

        const { result } = renderHook(() => useGame());

        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
        });

        await act(async () => {
          result.current.actions.resetGame();
        });

        expect(result.current.gameState.score).toBe(0);
        expect(result.current.gameState.moveCount).toBe(0);
        expect(result.current.gameState.canUndo).toBe(false);
        expect(result.current.gameState.bestScore).toBe(2000); // Should preserve best score
        expect(result.current.gameState.gameStatus).toBe(GameStatus.PLAYING);
      });
    });

    describe('continueAfterWin', () => {
      it('should allow continuing gameplay after win', async () => {
        // Set up won game state
        const wonGameState = {
          board: Array(4)
            .fill(null)
            .map(() => Array(4).fill(null)),
          score: 2048,
          bestScore: 2048,
          gameStatus: GameStatus.WON,
          moveCount: 100,
          startTime: Date.now() - 10000,
          lastMoveTime: Date.now(),
          canUndo: true,
        };

        mockStorageService.loadGameState.mockResolvedValue(wonGameState);

        const { result } = renderHook(() => useGame());

        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
        });

        expect(result.current.gameState.gameStatus).toBe(GameStatus.WON);

        await act(async () => {
          result.current.actions.continueAfterWin();
        });

        expect(result.current.gameState.gameStatus).toBe(GameStatus.PLAYING);
        expect(result.current.gameState.score).toBe(2048); // Should preserve other state
      });
    });
  });

  describe('Move Validation', () => {
    it('should prevent moves during loading', async () => {
      let resolveLoadGame: (value: GameState | null) => void;
      const loadGamePromise = new Promise<GameState | null>((resolve) => {
        resolveLoadGame = resolve;
      });
      mockStorageService.loadGameState.mockReturnValue(loadGamePromise);

      const { result } = renderHook(() => useGame());

      expect(result.current.canMove).toBe(false);

      await act(async () => {
        resolveLoadGame!(null);
        await loadGamePromise;
      });

      expect(result.current.canMove).toBe(true);
    });

    it('should return false for canMove when game is lost', async () => {
      const lostGameState = {
        board: Array(4)
          .fill(null)
          .map(() => Array(4).fill(null)),
        score: 1000,
        bestScore: 1000,
        gameStatus: GameStatus.LOST,
        moveCount: 100,
        startTime: Date.now() - 10000,
        lastMoveTime: Date.now(),
        canUndo: false,
      };

      mockStorageService.loadGameState.mockResolvedValue(lostGameState);

      const { result } = renderHook(() => useGame());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(result.current.canMove).toBe(false);
    });

    it('should return true for canMove during normal gameplay', async () => {
      const { result } = renderHook(() => useGame());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.canMove).toBe(true);
    });
  });

  describe('State Persistence', () => {
    it('should save game state after moves', async () => {
      const mockMoveResult = {
        board: Array(4)
          .fill(null)
          .map(() => Array(4).fill(null)),
        score: 100,
        bestScore: 100,
        gameStatus: GameStatus.PLAYING,
        moveCount: 1,
        startTime: Date.now(),
        lastMoveTime: Date.now(),
        canUndo: true,
        previousBoard: Array(4)
          .fill(null)
          .map(() => Array(4).fill(null)),
        previousScore: 0,
      };
      mockGameEngine.processMove.mockReturnValue(mockMoveResult);

      const { result } = renderHook(() => useGame());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      await act(async () => {
        result.current.actions.makeMove(Direction.LEFT);
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockStorageService.saveGameState).toHaveBeenCalledWith(
        expect.objectContaining({
          score: 100,
          moveCount: 1,
        })
      );
    });

    it('should handle save errors gracefully', async () => {
      mockStorageService.saveGameState.mockRejectedValue(
        new Error('Save error')
      );

      const mockMoveResult = {
        board: Array(4)
          .fill(null)
          .map(() => Array(4).fill(null)),
        score: 100,
        bestScore: 100,
        gameStatus: GameStatus.PLAYING,
        moveCount: 1,
        startTime: Date.now(),
        lastMoveTime: Date.now(),
        canUndo: true,
        previousBoard: Array(4)
          .fill(null)
          .map(() => Array(4).fill(null)),
        previousScore: 0,
      };
      mockGameEngine.processMove.mockReturnValue(mockMoveResult);

      const { result } = renderHook(() => useGame());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Should not throw error when save fails
      await act(async () => {
        result.current.actions.makeMove(Direction.LEFT);
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.gameState.score).toBe(100);
    });

    it('should not save initial state immediately', async () => {
      renderHook(() => useGame());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // Should only be called for loading, not saving initial state
      expect(mockStorageService.saveGameState).not.toHaveBeenCalled();
    });
  });

  describe('Game State Transitions', () => {
    it('should handle PLAYING -> WON transition', async () => {
      const wonMoveResult = {
        board: Array(4)
          .fill(null)
          .map(() => Array(4).fill(null)),
        score: 2048,
        bestScore: 2048,
        gameStatus: GameStatus.WON,
        moveCount: 1,
        startTime: Date.now(),
        lastMoveTime: Date.now(),
        canUndo: true,
        previousBoard: Array(4)
          .fill(null)
          .map(() => Array(4).fill(null)),
        previousScore: 0,
      };
      mockGameEngine.processMove.mockReturnValue(wonMoveResult);

      const { result } = renderHook(() => useGame());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.gameState.gameStatus).toBe(GameStatus.PLAYING);

      await act(async () => {
        result.current.actions.makeMove(Direction.LEFT);
      });

      expect(result.current.gameState.gameStatus).toBe(GameStatus.WON);
    });

    it('should handle PLAYING -> LOST transition', async () => {
      const lostMoveResult = {
        board: Array(4)
          .fill(null)
          .map(() => Array(4).fill(null)),
        score: 1000,
        bestScore: 1000,
        gameStatus: GameStatus.LOST,
        moveCount: 1,
        startTime: Date.now(),
        lastMoveTime: Date.now(),
        canUndo: true,
        previousBoard: Array(4)
          .fill(null)
          .map(() => Array(4).fill(null)),
        previousScore: 900,
      };
      mockGameEngine.processMove.mockReturnValue(lostMoveResult);

      const { result } = renderHook(() => useGame());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.gameState.gameStatus).toBe(GameStatus.PLAYING);

      await act(async () => {
        result.current.actions.makeMove(Direction.LEFT);
      });

      expect(result.current.gameState.gameStatus).toBe(GameStatus.LOST);
    });

    it('should handle WON -> PLAYING transition for continue-after-win', async () => {
      const wonGameState = {
        board: Array(4)
          .fill(null)
          .map(() => Array(4).fill(null)),
        score: 2048,
        bestScore: 2048,
        gameStatus: GameStatus.WON,
        moveCount: 100,
        startTime: Date.now() - 10000,
        lastMoveTime: Date.now(),
        canUndo: true,
      };

      mockStorageService.loadGameState.mockResolvedValue(wonGameState);

      const { result } = renderHook(() => useGame());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(result.current.gameState.gameStatus).toBe(GameStatus.WON);

      await act(async () => {
        result.current.actions.continueAfterWin();
      });

      expect(result.current.gameState.gameStatus).toBe(GameStatus.PLAYING);
    });
  });

  describe('Integration with Game Engine', () => {
    it('should call processMove with correct parameters', async () => {
      const { result } = renderHook(() => useGame());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const initialState = result.current.gameState;

      await act(async () => {
        result.current.actions.makeMove(Direction.UP);
      });

      expect(mockGameEngine.processMove).toHaveBeenCalledWith(
        initialState,
        Direction.UP
      );
    });

    it('should handle game engine results correctly', async () => {
      const mockMoveResult = {
        board: Array(4)
          .fill(null)
          .map(() => Array(4).fill(null)),
        score: 500,
        bestScore: 500,
        gameStatus: GameStatus.PLAYING,
        moveCount: 25,
        startTime: Date.now() - 5000,
        lastMoveTime: Date.now(),
        canUndo: true,
        previousBoard: Array(4)
          .fill(null)
          .map(() => Array(4).fill(null)),
        previousScore: 400,
      };
      mockGameEngine.processMove.mockReturnValue(mockMoveResult);

      const { result } = renderHook(() => useGame());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      await act(async () => {
        result.current.actions.makeMove(Direction.RIGHT);
      });

      expect(result.current.gameState.score).toBe(500);
      expect(result.current.gameState.moveCount).toBe(25);
      expect(result.current.gameState.canUndo).toBe(true);
    });
  });

  describe('Performance and Memory', () => {
    it('should memoize action functions', () => {
      const { result, rerender } = renderHook(() => useGame());

      const initialActions = result.current.actions;

      rerender({});

      // Actions should be the same reference due to useCallback
      expect(result.current.actions.startNewGame).toBe(
        initialActions.startNewGame
      );
      expect(result.current.actions.resetGame).toBe(initialActions.resetGame);
      expect(result.current.actions.continueAfterWin).toBe(
        initialActions.continueAfterWin
      );
    });

    it('should handle multiple rapid moves without issues', async () => {
      const mockMoveResult = {
        board: Array(4)
          .fill(null)
          .map(() => Array(4).fill(null)),
        score: 100,
        bestScore: 100,
        gameStatus: GameStatus.PLAYING,
        moveCount: 1,
        startTime: Date.now(),
        lastMoveTime: Date.now(),
        canUndo: true,
        previousBoard: Array(4)
          .fill(null)
          .map(() => Array(4).fill(null)),
        previousScore: 0,
      };
      mockGameEngine.processMove.mockReturnValue(mockMoveResult);

      const { result } = renderHook(() => useGame());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Make multiple rapid moves
      await act(async () => {
        result.current.actions.makeMove(Direction.LEFT);
        result.current.actions.makeMove(Direction.RIGHT);
        result.current.actions.makeMove(Direction.UP);
        result.current.actions.makeMove(Direction.DOWN);
      });

      expect(mockGameEngine.processMove).toHaveBeenCalledTimes(4);
    });
  });
});
