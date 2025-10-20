/**
 * Type definition tests for game-related types.
 * Validates interface compliance, enum values, and factory functions.
 */

import {
  GameState,
  Tile,
  Direction,
  GameStatus,
  Board,
  Position,
  BoardSize,
  EmptyPosition,
  PositionArray,
  InitialGameConfig,
  InitialGameStateFactory,
} from '@/types';

describe('Game Type Definitions', () => {
  describe('GameState Interface', () => {
    it('should have all required properties with correct types', () => {
      const mockGameState: GameState = {
        board: [
          [null, null, null, null],
          [null, null, null, null],
          [null, null, null, null],
          [null, null, null, null],
        ],
        score: 1024,
        bestScore: 4096,
        gameStatus: GameStatus.PLAYING,
        moveCount: 42,
        startTime: Date.now(),
        lastMoveTime: Date.now(),
        canUndo: true,
        previousBoard: [
          [null, null, null, null],
          [null, null, null, null],
          [null, null, null, null],
          [null, null, null, null],
        ],
        previousScore: 896,
      };

      expect(typeof mockGameState.board).toBe('object');
      expect(Array.isArray(mockGameState.board)).toBe(true);
      expect(mockGameState.board.length).toBe(4);
      expect(mockGameState.board[0].length).toBe(4);
      expect(typeof mockGameState.score).toBe('number');
      expect(typeof mockGameState.bestScore).toBe('number');
      expect(Object.values(GameStatus)).toContain(mockGameState.gameStatus);
      expect(typeof mockGameState.moveCount).toBe('number');
      expect(typeof mockGameState.startTime).toBe('number');
      expect(typeof mockGameState.lastMoveTime).toBe('number');
      expect(typeof mockGameState.canUndo).toBe('boolean');
    });

    it('should support optional previousBoard and previousScore', () => {
      const gameStateWithoutUndo: GameState = {
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
      };

      expect(gameStateWithoutUndo.previousBoard).toBeUndefined();
      expect(gameStateWithoutUndo.previousScore).toBeUndefined();
    });
  });

  describe('Tile Interface', () => {
    it('should have all required properties with correct types', () => {
      const mockTile: Tile = {
        id: 'tile-123-456',
        value: 2,
        row: 1,
        col: 2,
        isNew: true,
        mergedFrom: ['tile-111', 'tile-222'],
        previousPosition: { row: 0, col: 2 },
      };

      expect(typeof mockTile.id).toBe('string');
      expect(typeof mockTile.value).toBe('number');
      expect(typeof mockTile.row).toBe('number');
      expect(typeof mockTile.col).toBe('number');
      expect(typeof mockTile.isNew).toBe('boolean');
      expect(Array.isArray(mockTile.mergedFrom)).toBe(true);
      expect(typeof mockTile.previousPosition).toBe('object');
      expect(typeof mockTile.previousPosition!.row).toBe('number');
      expect(typeof mockTile.previousPosition!.col).toBe('number');
    });

    it('should support optional mergedFrom and previousPosition', () => {
      const simpleTile: Tile = {
        id: 'tile-simple',
        value: 4,
        row: 0,
        col: 0,
        isNew: false,
      };

      expect(simpleTile.mergedFrom).toBeUndefined();
      expect(simpleTile.previousPosition).toBeUndefined();
    });
  });

  describe('Direction Enum', () => {
    it('should have all four direction values', () => {
      expect(Direction.UP).toBe('up');
      expect(Direction.DOWN).toBe('down');
      expect(Direction.LEFT).toBe('left');
      expect(Direction.RIGHT).toBe('right');
    });

    it('should be usable in switch statements', () => {
      const testDirection: Direction = Direction.UP;
      let result: string = '';

      const processDirection = (dir: Direction): string => {
        switch (dir) {
          case Direction.UP:
          case Direction.DOWN:
            return 'vertical';
          case Direction.LEFT:
          case Direction.RIGHT:
            return 'horizontal';
        }
      };

      result = processDirection(testDirection);
      expect(result).toBe('vertical');

      // Test other directions
      expect(processDirection(Direction.DOWN)).toBe('vertical');
      expect(processDirection(Direction.LEFT)).toBe('horizontal');
      expect(processDirection(Direction.RIGHT)).toBe('horizontal');
    });

    it('should contain exactly 4 values', () => {
      const directionValues = Object.values(Direction);
      expect(directionValues).toHaveLength(4);
      expect(directionValues).toEqual(['up', 'down', 'left', 'right']);
    });
  });

  describe('GameStatus Enum', () => {
    it('should have all three game status values', () => {
      expect(GameStatus.PLAYING).toBe('playing');
      expect(GameStatus.WON).toBe('won');
      expect(GameStatus.LOST).toBe('lost');
    });

    it('should be usable for game state transitions', () => {
      let status = GameStatus.PLAYING;

      // Simulate winning
      status = GameStatus.WON;
      expect(status).toBe('won');

      // Simulate losing
      status = GameStatus.LOST;
      expect(status).toBe('lost');
    });

    it('should contain exactly 3 values', () => {
      const statusValues = Object.values(GameStatus);
      expect(statusValues).toHaveLength(3);
      expect(statusValues).toEqual(['playing', 'won', 'lost']);
    });
  });

  describe('Board Type Alias', () => {
    it('should represent a 4x4 grid of tiles or null', () => {
      const emptyBoard: Board = [
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];

      expect(Array.isArray(emptyBoard)).toBe(true);
      expect(emptyBoard.length).toBe(4);
      expect(emptyBoard.every((row) => Array.isArray(row) && row.length === 4)).toBe(true);
    });

    it('should support mixed tile and null values', () => {
      const mockTile: Tile = {
        id: 'tile-test',
        value: 2,
        row: 0,
        col: 0,
        isNew: false,
      };

      const partialBoard: Board = [
        [mockTile, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];

      expect(partialBoard[0][0]).toBe(mockTile);
      expect(partialBoard[0][1]).toBe(null);
    });
  });

  describe('Position Interface', () => {
    it('should have row and col properties', () => {
      const position: Position = { row: 2, col: 1 };

      expect(typeof position.row).toBe('number');
      expect(typeof position.col).toBe('number');
      expect(position.row).toBe(2);
      expect(position.col).toBe(1);
    });

    it('should work with board indexing', () => {
      const board: Board = [
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];
      const position: Position = { row: 1, col: 2 };

      expect(() => board[position.row][position.col]).not.toThrow();
      expect(board[position.row][position.col]).toBe(null);
    });
  });

  describe('InitialGameConfig Interface', () => {
    it('should have optional configuration properties', () => {
      const config: InitialGameConfig = {
        boardSize: 4,
        initialTileCount: 2,
        startingTileValue: 2,
      };

      expect(typeof config.boardSize).toBe('number');
      expect(typeof config.initialTileCount).toBe('number');
      expect(typeof config.startingTileValue).toBe('number');
    });

    it('should work with partial configuration', () => {
      const partialConfig: InitialGameConfig = {
        initialTileCount: 3,
      };

      expect(partialConfig.initialTileCount).toBe(3);
      expect(partialConfig.boardSize).toBeUndefined();
      expect(partialConfig.startingTileValue).toBeUndefined();
    });

    it('should work with empty configuration', () => {
      const emptyConfig: InitialGameConfig = {};

      expect(emptyConfig.boardSize).toBeUndefined();
      expect(emptyConfig.initialTileCount).toBeUndefined();
      expect(emptyConfig.startingTileValue).toBeUndefined();
    });
  });

  describe('InitialGameStateFactory Interface', () => {
    it('should define correct function signature', () => {
      const mockFactory: InitialGameStateFactory = (config) => {
        return {
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
        };
      };

      expect(typeof mockFactory).toBe('function');
      const result = mockFactory();
      expect(result.score).toBe(0);
      expect(result.gameStatus).toBe(GameStatus.PLAYING);
    });

    it('should work with optional config parameter', () => {
      const mockFactory: InitialGameStateFactory = (config) => {
        const initialTileCount = config?.initialTileCount || 2;
        return {
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
        };
      };

      const resultWithoutConfig = mockFactory();
      const resultWithConfig = mockFactory({ initialTileCount: 3 });

      expect(resultWithoutConfig).toBeDefined();
      expect(resultWithConfig).toBeDefined();
    });
  });

  describe('Utility Types', () => {
    it('should support EmptyPosition type', () => {
      const emptyPos: EmptyPosition = { row: 1, col: 1 };
      expect(typeof emptyPos.row).toBe('number');
      expect(typeof emptyPos.col).toBe('number');
    });

    it('should support PositionArray type', () => {
      const positions: PositionArray = [
        { row: 0, col: 0 },
        { row: 1, col: 1 },
        { row: 2, col: 2 },
      ];

      expect(Array.isArray(positions)).toBe(true);
      expect(positions).toHaveLength(3);
      positions.forEach((pos) => {
        expect(typeof pos.row).toBe('number');
        expect(typeof pos.col).toBe('number');
      });
    });

    it('should support BoardSize type', () => {
      const size: BoardSize = 4;
      expect(size).toBe(4);
    });
  });
});
