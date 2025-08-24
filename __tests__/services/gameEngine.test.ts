import {
  processMove,
  makeMove,
  spawnRandomTile,
  validateGameState,
  checkWinCondition,
  checkGameOver,
} from '@/services/gameEngine';
import { GameState, Direction, Tile, Board, GameStatus } from '@/types/game';

// Test utilities for creating board configurations
const createTile = (
  value: number,
  row: number,
  col: number,
  id?: string
): Tile => ({
  id: id || `tile-${row}-${col}-${Date.now()}`,
  value,
  row,
  col,
  isNew: false,
});

const createEmptyBoard = (): Board => [
  [null, null, null, null],
  [null, null, null, null],
  [null, null, null, null],
  [null, null, null, null],
];

const createGameState = (board: Board, score = 0): GameState => ({
  board,
  score,
  bestScore: score,
  gameStatus: GameStatus.PLAYING,
  moveCount: 0,
  startTime: Date.now(),
  lastMoveTime: Date.now(),
  canUndo: false,
});

describe('Game Engine Core Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('makeMove - LEFT direction', () => {
    it('should move single tile to leftmost position', () => {
      const board: Board = [
        [null, null, createTile(2, 0, 2, 'tile1'), null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];

      const result = makeMove(board, Direction.LEFT);

      expect(result.moved).toBe(true);
      expect(result.score).toBe(0);
      expect(result.board[0][0]?.value).toBe(2);
      expect(result.board[0][0]?.col).toBe(0);
    });

    it('should merge two identical tiles', () => {
      const board: Board = [
        [
          createTile(2, 0, 0, 'tile1'),
          createTile(2, 0, 1, 'tile2'),
          null,
          null,
        ],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];

      const result = makeMove(board, Direction.LEFT);

      expect(result.moved).toBe(true);
      expect(result.score).toBe(4);
      expect(result.board[0][0]?.value).toBe(4);
      expect(result.mergedTiles).toContain('tile1');
      expect(result.mergedTiles).toContain('tile2');
    });

    it('should handle multiple merges in one row', () => {
      const board: Board = [
        [
          createTile(2, 0, 0),
          createTile(2, 0, 1),
          createTile(4, 0, 2),
          createTile(4, 0, 3),
        ],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];

      const result = makeMove(board, Direction.LEFT);

      expect(result.moved).toBe(true);
      expect(result.score).toBe(12); // 4 + 8 = 12
      expect(result.board[0][0]?.value).toBe(4);
      expect(result.board[0][1]?.value).toBe(8);
      expect(result.board[0][2]).toBe(null);
      expect(result.board[0][3]).toBe(null);
    });

    it('should handle row with gaps', () => {
      const board: Board = [
        [createTile(2, 0, 0), null, createTile(2, 0, 2), null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];

      const result = makeMove(board, Direction.LEFT);

      expect(result.moved).toBe(true);
      expect(result.score).toBe(4);
      expect(result.board[0][0]?.value).toBe(4);
      expect(result.board[0][1]).toBe(null);
    });

    it('should not move tiles that are already at leftmost positions', () => {
      const board: Board = [
        [
          createTile(2, 0, 0),
          createTile(4, 0, 1),
          createTile(8, 0, 2),
          createTile(16, 0, 3),
        ],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];

      const result = makeMove(board, Direction.LEFT);

      expect(result.moved).toBe(false);
      expect(result.score).toBe(0);
    });
  });

  describe('makeMove - RIGHT direction', () => {
    it('should move single tile to rightmost position', () => {
      const board: Board = [
        [null, createTile(2, 0, 1), null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];

      const result = makeMove(board, Direction.RIGHT);

      expect(result.moved).toBe(true);
      expect(result.board[0][3]?.value).toBe(2);
      expect(result.board[0][3]?.col).toBe(3);
    });

    it('should merge tiles moving right', () => {
      const board: Board = [
        [null, null, createTile(2, 0, 2), createTile(2, 0, 3)],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];

      const result = makeMove(board, Direction.RIGHT);

      expect(result.moved).toBe(true);
      expect(result.score).toBe(4);
      expect(result.board[0][3]?.value).toBe(4);
    });
  });

  describe('makeMove - UP direction', () => {
    it('should move tile to top row', () => {
      const board: Board = [
        [null, null, null, null],
        [null, null, null, null],
        [createTile(2, 2, 0), null, null, null],
        [null, null, null, null],
      ];

      const result = makeMove(board, Direction.UP);

      expect(result.moved).toBe(true);
      expect(result.board[0][0]?.value).toBe(2);
      expect(result.board[0][0]?.row).toBe(0);
    });

    it('should merge tiles moving up', () => {
      const board: Board = [
        [createTile(2, 0, 0), null, null, null],
        [createTile(2, 1, 0), null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];

      const result = makeMove(board, Direction.UP);

      expect(result.moved).toBe(true);
      expect(result.score).toBe(4);
      expect(result.board[0][0]?.value).toBe(4);
    });
  });

  describe('makeMove - DOWN direction', () => {
    it('should move tile to bottom row', () => {
      const board: Board = [
        [createTile(2, 0, 0), null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];

      const result = makeMove(board, Direction.DOWN);

      expect(result.moved).toBe(true);
      expect(result.board[3][0]?.value).toBe(2);
      expect(result.board[3][0]?.row).toBe(3);
    });
  });

  describe('spawnRandomTile', () => {
    let mockRandom: jest.SpyInstance;

    beforeEach(() => {
      mockRandom = jest.spyOn(Math, 'random');
    });

    afterEach(() => {
      mockRandom.mockRestore();
    });

    it('should spawn tile with value 2 when random < 0.9', () => {
      mockRandom.mockReturnValueOnce(0.5).mockReturnValueOnce(0.8); // position selection, then value selection

      const board = createEmptyBoard();
      const result = spawnRandomTile(board);

      expect(result.success).toBe(true);
      expect(result.tile?.value).toBe(2);
      expect(result.tile?.isNew).toBe(true);
    });

    it('should spawn tile with value 4 when random >= 0.9', () => {
      mockRandom.mockReturnValueOnce(0.5).mockReturnValueOnce(0.95); // position selection, then value selection

      const board = createEmptyBoard();
      const result = spawnRandomTile(board);

      expect(result.success).toBe(true);
      expect(result.tile?.value).toBe(4);
    });

    it('should return null when board is full', () => {
      const fullBoard: Board = [
        [
          createTile(2, 0, 0),
          createTile(4, 0, 1),
          createTile(8, 0, 2),
          createTile(16, 0, 3),
        ],
        [
          createTile(32, 1, 0),
          createTile(64, 1, 1),
          createTile(128, 1, 2),
          createTile(256, 1, 3),
        ],
        [
          createTile(512, 2, 0),
          createTile(1024, 2, 1),
          createTile(2, 2, 2),
          createTile(4, 2, 3),
        ],
        [
          createTile(8, 3, 0),
          createTile(16, 3, 1),
          createTile(32, 3, 2),
          createTile(64, 3, 3),
        ],
      ];

      const result = spawnRandomTile(fullBoard);

      expect(result.success).toBe(false);
      expect(result.tile).toBe(null);
    });

    it('should spawn in random empty position', () => {
      mockRandom.mockReturnValueOnce(0.0).mockReturnValueOnce(0.5); // select first empty position

      const board: Board = [
        [createTile(2, 0, 0), null, createTile(4, 0, 2), null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];

      const result = spawnRandomTile(board);

      expect(result.success).toBe(true);
      expect(result.tile?.row).toBe(0);
      expect(result.tile?.col).toBe(1);
    });
  });

  describe('checkWinCondition', () => {
    it('should return true when 2048 tile exists', () => {
      const board: Board = [
        [
          createTile(2, 0, 0),
          createTile(4, 0, 1),
          createTile(8, 0, 2),
          createTile(16, 0, 3),
        ],
        [
          createTile(32, 1, 0),
          createTile(2048, 1, 1),
          createTile(128, 1, 2),
          null,
        ],
        [null, null, null, null],
        [null, null, null, null],
      ];

      expect(checkWinCondition(board)).toBe(true);
    });

    it('should return true when tile value > 2048 exists', () => {
      const board: Board = [
        [createTile(4096, 0, 0), null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];

      expect(checkWinCondition(board)).toBe(true);
    });

    it('should return false when no 2048+ tile exists', () => {
      const board: Board = [
        [
          createTile(2, 0, 0),
          createTile(4, 0, 1),
          createTile(8, 0, 2),
          createTile(16, 0, 3),
        ],
        [
          createTile(32, 1, 0),
          createTile(64, 1, 1),
          createTile(128, 1, 2),
          createTile(256, 1, 3),
        ],
        [createTile(512, 2, 0), createTile(1024, 2, 1), null, null],
        [null, null, null, null],
      ];

      expect(checkWinCondition(board)).toBe(false);
    });
  });

  describe('checkGameOver', () => {
    it('should return false when empty cells exist', () => {
      const board: Board = [
        [
          createTile(2, 0, 0),
          createTile(4, 0, 1),
          createTile(8, 0, 2),
          createTile(16, 0, 3),
        ],
        [
          createTile(32, 1, 0),
          createTile(64, 1, 1),
          null,
          createTile(256, 1, 3),
        ],
        [null, null, null, null],
        [null, null, null, null],
      ];

      expect(checkGameOver(board)).toBe(false);
    });

    it('should return false when horizontal merges are possible', () => {
      const board: Board = [
        [
          createTile(2, 0, 0),
          createTile(2, 0, 1),
          createTile(8, 0, 2),
          createTile(16, 0, 3),
        ],
        [
          createTile(32, 1, 0),
          createTile(64, 1, 1),
          createTile(128, 1, 2),
          createTile(256, 1, 3),
        ],
        [
          createTile(512, 2, 0),
          createTile(1024, 2, 1),
          createTile(4, 2, 2),
          createTile(8, 2, 3),
        ],
        [
          createTile(16, 3, 0),
          createTile(32, 3, 1),
          createTile(64, 3, 2),
          createTile(128, 3, 3),
        ],
      ];

      expect(checkGameOver(board)).toBe(false);
    });

    it('should return false when vertical merges are possible', () => {
      const board: Board = [
        [
          createTile(2, 0, 0),
          createTile(4, 0, 1),
          createTile(8, 0, 2),
          createTile(16, 0, 3),
        ],
        [
          createTile(2, 1, 0),
          createTile(64, 1, 1),
          createTile(128, 1, 2),
          createTile(256, 1, 3),
        ],
        [
          createTile(512, 2, 0),
          createTile(1024, 2, 1),
          createTile(4, 2, 2),
          createTile(8, 2, 3),
        ],
        [
          createTile(16, 3, 0),
          createTile(32, 3, 1),
          createTile(64, 3, 2),
          createTile(128, 3, 3),
        ],
      ];

      expect(checkGameOver(board)).toBe(false);
    });

    it('should return true when no moves are possible', () => {
      const board: Board = [
        [
          createTile(2, 0, 0),
          createTile(4, 0, 1),
          createTile(8, 0, 2),
          createTile(16, 0, 3),
        ],
        [
          createTile(32, 1, 0),
          createTile(64, 1, 1),
          createTile(128, 1, 2),
          createTile(256, 1, 3),
        ],
        [
          createTile(512, 2, 0),
          createTile(1024, 2, 1),
          createTile(2048, 2, 2),
          createTile(4, 2, 3),
        ],
        [
          createTile(8, 3, 0),
          createTile(16, 3, 1),
          createTile(32, 3, 2),
          createTile(64, 3, 3),
        ],
      ];

      expect(checkGameOver(board)).toBe(true);
    });
  });

  describe('validateGameState', () => {
    it('should detect win condition', () => {
      const board: Board = [
        [createTile(2048, 0, 0), null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];

      const result = validateGameState(board);
      expect(result.isWon).toBe(true);
      expect(result.isGameOver).toBe(false);
    });

    it('should detect game over condition', () => {
      const board: Board = [
        [
          createTile(2, 0, 0),
          createTile(4, 0, 1),
          createTile(8, 0, 2),
          createTile(16, 0, 3),
        ],
        [
          createTile(32, 1, 0),
          createTile(64, 1, 1),
          createTile(128, 1, 2),
          createTile(256, 1, 3),
        ],
        [
          createTile(512, 2, 0),
          createTile(1024, 2, 1),
          createTile(2, 2, 2),
          createTile(4, 2, 3),
        ],
        [
          createTile(8, 3, 0),
          createTile(16, 3, 1),
          createTile(32, 3, 2),
          createTile(64, 3, 3),
        ],
      ];

      const result = validateGameState(board);
      expect(result.isWon).toBe(false);
      expect(result.isGameOver).toBe(true);
    });
  });

  describe('processMove - Integration Tests', () => {
    let mockRandom: jest.SpyInstance;

    beforeEach(() => {
      mockRandom = jest.spyOn(Math, 'random');
    });

    afterEach(() => {
      mockRandom.mockRestore();
    });

    it('should complete a full move cycle', () => {
      mockRandom.mockReturnValueOnce(0.0).mockReturnValueOnce(0.5); // spawn position and value

      const board: Board = [
        [createTile(2, 0, 0), createTile(2, 0, 1), null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];

      const gameState = createGameState(board, 100);
      const result = processMove(gameState, Direction.LEFT);

      expect(result.score).toBe(104); // 100 + 4 from merge
      expect(result.moveCount).toBe(1);
      expect(result.board[0][0]?.value).toBe(4); // merged tile
      expect(result.canUndo).toBe(true);
      expect(result.previousBoard).toBe(board);
      expect(result.previousScore).toBe(100);
    });

    it('should not change state when no movement occurs', () => {
      const board: Board = [
        [
          createTile(2, 0, 0),
          createTile(4, 0, 1),
          createTile(8, 0, 2),
          createTile(16, 0, 3),
        ],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];

      const gameState = createGameState(board, 100);
      const result = processMove(gameState, Direction.LEFT);

      expect(result.score).toBe(100); // unchanged
      expect(result.moveCount).toBe(0); // unchanged
      expect(result.board).toBe(board); // same board reference
    });

    it('should set game status to WON when 2048 is reached', () => {
      mockRandom.mockReturnValueOnce(0.0).mockReturnValueOnce(0.5);

      const board: Board = [
        [createTile(1024, 0, 0), createTile(1024, 0, 1), null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];

      const gameState = createGameState(board);
      const result = processMove(gameState, Direction.LEFT);

      expect(result.gameStatus).toBe(GameStatus.WON);
      expect(result.board[0][0]?.value).toBe(2048);
    });

    it('should set game status to LOST when no moves remain', () => {
      // Create a board that after the move and spawn will have no valid moves
      const board: Board = [
        [
          createTile(2, 0, 0),
          createTile(4, 0, 1),
          createTile(8, 0, 2),
          createTile(16, 0, 3),
        ],
        [
          createTile(32, 1, 0),
          createTile(64, 1, 1),
          createTile(128, 1, 2),
          createTile(256, 1, 3),
        ],
        [
          createTile(512, 2, 0),
          createTile(1024, 2, 1),
          createTile(8, 2, 2),
          createTile(4, 2, 3),
        ],
        [
          createTile(16, 3, 0),
          createTile(32, 3, 1),
          createTile(64, 3, 2),
          null,
        ], // one empty space
      ];

      // Mock spawn to place a tile that results in no possible moves
      mockRandom.mockReturnValueOnce(0.0).mockReturnValueOnce(0.5); // spawn at [3,3] with value 2

      const gameState = createGameState(board);
      const result = processMove(gameState, Direction.RIGHT); // Move right to trigger spawn

      expect(result.gameStatus).toBe(GameStatus.LOST);
    });

    it('should update best score when current score exceeds it', () => {
      mockRandom.mockReturnValueOnce(0.0).mockReturnValueOnce(0.5);

      const board: Board = [
        [createTile(1024, 0, 0), createTile(1024, 0, 1), null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];

      const gameState = createGameState(board, 1000);
      gameState.bestScore = 2000;

      const result = processMove(gameState, Direction.LEFT);

      expect(result.score).toBe(3048); // 1000 + 2048
      expect(result.bestScore).toBe(3048); // updated
    });
  });

  describe('Performance Tests', () => {
    it('should complete move within 100ms performance requirement', () => {
      const board: Board = [
        [
          createTile(2, 0, 0),
          createTile(4, 0, 1),
          createTile(8, 0, 2),
          createTile(16, 0, 3),
        ],
        [
          createTile(32, 1, 0),
          createTile(64, 1, 1),
          createTile(128, 1, 2),
          createTile(256, 1, 3),
        ],
        [
          createTile(512, 2, 0),
          createTile(1024, 2, 1),
          createTile(2, 2, 2),
          null,
        ],
        [createTile(4, 3, 0), null, null, null],
      ];

      const gameState = createGameState(board);

      const startTime = performance.now();
      processMove(gameState, Direction.LEFT);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Input Validation Tests', () => {
    it('should handle invalid board gracefully in processMove', () => {
      const invalidGameState = createGameState([] as any); // Invalid empty board
      const result = processMove(invalidGameState, Direction.LEFT);

      expect(result).toBe(invalidGameState); // Should return unchanged state
    });

    it('should handle malformed board in makeMove', () => {
      const malformedBoard = [[null, null], [null]] as any; // Wrong dimensions
      const result = makeMove(malformedBoard, Direction.LEFT);

      expect(result.moved).toBe(false);
      expect(result.score).toBe(0);
      expect(result.board).toBe(malformedBoard);
    });

    it('should handle tiles with invalid values', () => {
      const boardWithInvalidTile: Board = [
        [{ ...createTile(0, 0, 0), value: 0 } as any, null, null, null], // Invalid value 0
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];

      const gameState = createGameState(boardWithInvalidTile);
      const result = processMove(gameState, Direction.LEFT);

      expect(result).toBe(gameState); // Should return unchanged
    });
  });
});
