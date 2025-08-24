/**
 * Serialization tests for game types.
 * Validates JSON serialization/deserialization and SQLite compatibility.
 */

import {
  GameState,
  Tile,
  Direction,
  GameStatus,
  Board,
  Position,
} from '@/types';

describe('Game Type Serialization', () => {
  describe('GameState Serialization', () => {
    const mockGameState: GameState = {
      board: [
        [
          { id: 'tile-1', value: 2, row: 0, col: 0, isNew: false },
          null,
          { id: 'tile-2', value: 4, row: 0, col: 2, isNew: true },
          null,
        ],
        [null, null, null, null],
        [
          null,
          {
            id: 'tile-3',
            value: 8,
            row: 2,
            col: 1,
            isNew: false,
            mergedFrom: ['tile-4', 'tile-5'],
          },
          null,
          null,
        ],
        [null, null, null, null],
      ],
      score: 1024,
      bestScore: 4096,
      gameStatus: GameStatus.PLAYING,
      moveCount: 42,
      startTime: 1692900000000,
      lastMoveTime: 1692900060000,
      canUndo: true,
      previousBoard: [
        [
          { id: 'tile-1', value: 2, row: 0, col: 0, isNew: false },
          null,
          null,
          null,
        ],
        [null, null, null, null],
        [
          null,
          { id: 'tile-4', value: 4, row: 2, col: 1, isNew: false },
          { id: 'tile-5', value: 4, row: 2, col: 2, isNew: false },
          null,
        ],
        [null, null, null, null],
      ],
      previousScore: 896,
    };

    it('should serialize to JSON correctly', () => {
      const serialized = JSON.stringify(mockGameState);
      expect(typeof serialized).toBe('string');
      expect(serialized.length).toBeGreaterThan(0);
    });

    it('should deserialize from JSON correctly', () => {
      const serialized = JSON.stringify(mockGameState);
      const deserialized: GameState = JSON.parse(serialized);

      expect(deserialized.score).toBe(mockGameState.score);
      expect(deserialized.bestScore).toBe(mockGameState.bestScore);
      expect(deserialized.gameStatus).toBe(mockGameState.gameStatus);
      expect(deserialized.moveCount).toBe(mockGameState.moveCount);
      expect(deserialized.startTime).toBe(mockGameState.startTime);
      expect(deserialized.lastMoveTime).toBe(mockGameState.lastMoveTime);
      expect(deserialized.canUndo).toBe(mockGameState.canUndo);
      expect(deserialized.previousScore).toBe(mockGameState.previousScore);
    });

    it('should maintain board structure after serialization', () => {
      const serialized = JSON.stringify(mockGameState);
      const deserialized: GameState = JSON.parse(serialized);

      expect(Array.isArray(deserialized.board)).toBe(true);
      expect(deserialized.board.length).toBe(4);
      expect(deserialized.board[0].length).toBe(4);

      // Check specific tiles
      expect(deserialized.board[0][0]?.id).toBe('tile-1');
      expect(deserialized.board[0][0]?.value).toBe(2);
      expect(deserialized.board[0][2]?.id).toBe('tile-2');
      expect(deserialized.board[0][2]?.isNew).toBe(true);
      expect(deserialized.board[2][1]?.mergedFrom).toEqual([
        'tile-4',
        'tile-5',
      ]);
    });

    it('should handle null values in board', () => {
      const serialized = JSON.stringify(mockGameState);
      const deserialized: GameState = JSON.parse(serialized);

      expect(deserialized.board[0][1]).toBe(null);
      expect(deserialized.board[1][0]).toBe(null);
      expect(deserialized.board[3][3]).toBe(null);
    });

    it('should preserve enum values after serialization', () => {
      const serialized = JSON.stringify(mockGameState);
      const deserialized: GameState = JSON.parse(serialized);

      expect(deserialized.gameStatus).toBe('playing');
      expect(Object.values(GameStatus)).toContain(deserialized.gameStatus);
    });

    it('should handle optional properties correctly', () => {
      const gameStateWithoutOptional: GameState = {
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

      const serialized = JSON.stringify(gameStateWithoutOptional);
      const deserialized: GameState = JSON.parse(serialized);

      expect(deserialized.previousBoard).toBeUndefined();
      expect(deserialized.previousScore).toBeUndefined();
    });
  });

  describe('Tile Serialization', () => {
    const mockTile: Tile = {
      id: 'tile-123-456',
      value: 32,
      row: 1,
      col: 2,
      isNew: true,
      mergedFrom: ['tile-111', 'tile-222'],
      previousPosition: { row: 0, col: 2 },
    };

    it('should serialize tile to JSON correctly', () => {
      const serialized = JSON.stringify(mockTile);
      expect(typeof serialized).toBe('string');
      expect(serialized).toContain('"id":"tile-123-456"');
      expect(serialized).toContain('"value":32');
    });

    it('should deserialize tile from JSON correctly', () => {
      const serialized = JSON.stringify(mockTile);
      const deserialized: Tile = JSON.parse(serialized);

      expect(deserialized.id).toBe(mockTile.id);
      expect(deserialized.value).toBe(mockTile.value);
      expect(deserialized.row).toBe(mockTile.row);
      expect(deserialized.col).toBe(mockTile.col);
      expect(deserialized.isNew).toBe(mockTile.isNew);
      expect(deserialized.mergedFrom).toEqual(mockTile.mergedFrom);
      expect(deserialized.previousPosition).toEqual(mockTile.previousPosition);
    });

    it('should handle tile with optional properties missing', () => {
      const simpleTile: Tile = {
        id: 'tile-simple',
        value: 4,
        row: 0,
        col: 0,
        isNew: false,
      };

      const serialized = JSON.stringify(simpleTile);
      const deserialized: Tile = JSON.parse(serialized);

      expect(deserialized.id).toBe(simpleTile.id);
      expect(deserialized.mergedFrom).toBeUndefined();
      expect(deserialized.previousPosition).toBeUndefined();
    });
  });

  describe('Enum Serialization', () => {
    it('should serialize Direction enum values correctly', () => {
      const directions = [
        Direction.UP,
        Direction.DOWN,
        Direction.LEFT,
        Direction.RIGHT,
      ];
      const serialized = JSON.stringify(directions);
      const deserialized: Direction[] = JSON.parse(serialized);

      expect(deserialized).toEqual(['up', 'down', 'left', 'right']);
      deserialized.forEach((direction) => {
        expect(Object.values(Direction)).toContain(direction);
      });
    });

    it('should serialize GameStatus enum values correctly', () => {
      const statuses = [GameStatus.PLAYING, GameStatus.WON, GameStatus.LOST];
      const serialized = JSON.stringify(statuses);
      const deserialized: GameStatus[] = JSON.parse(serialized);

      expect(deserialized).toEqual(['playing', 'won', 'lost']);
      deserialized.forEach((status) => {
        expect(Object.values(GameStatus)).toContain(status);
      });
    });
  });

  describe('Position Serialization', () => {
    it('should serialize position correctly', () => {
      const position: Position = { row: 3, col: 1 };
      const serialized = JSON.stringify(position);
      const deserialized: Position = JSON.parse(serialized);

      expect(deserialized.row).toBe(position.row);
      expect(deserialized.col).toBe(position.col);
    });

    it('should serialize array of positions correctly', () => {
      const positions: Position[] = [
        { row: 0, col: 0 },
        { row: 1, col: 2 },
        { row: 3, col: 3 },
      ];

      const serialized = JSON.stringify(positions);
      const deserialized: Position[] = JSON.parse(serialized);

      expect(deserialized).toHaveLength(3);
      expect(deserialized[0]).toEqual({ row: 0, col: 0 });
      expect(deserialized[1]).toEqual({ row: 1, col: 2 });
      expect(deserialized[2]).toEqual({ row: 3, col: 3 });
    });
  });

  describe('Board Serialization', () => {
    it('should serialize empty board correctly', () => {
      const emptyBoard: Board = [
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];

      const serialized = JSON.stringify(emptyBoard);
      const deserialized: Board = JSON.parse(serialized);

      expect(deserialized).toHaveLength(4);
      expect(deserialized.every((row) => row.length === 4)).toBe(true);
      expect(
        deserialized.every((row) => row.every((cell) => cell === null))
      ).toBe(true);
    });

    it('should serialize board with tiles correctly', () => {
      const boardWithTiles: Board = [
        [
          { id: 'tile-1', value: 2, row: 0, col: 0, isNew: false },
          null,
          { id: 'tile-2', value: 4, row: 0, col: 2, isNew: true },
          null,
        ],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];

      const serialized = JSON.stringify(boardWithTiles);
      const deserialized: Board = JSON.parse(serialized);

      expect(deserialized[0][0]?.id).toBe('tile-1');
      expect(deserialized[0][0]?.value).toBe(2);
      expect(deserialized[0][2]?.id).toBe('tile-2');
      expect(deserialized[0][2]?.isNew).toBe(true);
      expect(deserialized[0][1]).toBe(null);
    });
  });

  describe('Deep Serialization Round-trip', () => {
    it('should maintain data integrity through multiple serialization cycles', () => {
      const complexGameState: GameState = {
        board: [
          [
            {
              id: 'tile-1',
              value: 2048,
              row: 0,
              col: 0,
              isNew: false,
              mergedFrom: ['tile-a', 'tile-b'],
            },
            null,
            {
              id: 'tile-2',
              value: 1024,
              row: 0,
              col: 2,
              isNew: true,
              previousPosition: { row: 1, col: 2 },
            },
            null,
          ],
          [null, null, null, null],
          [null, null, null, null],
          [null, null, null, null],
        ],
        score: 20480,
        bestScore: 50000,
        gameStatus: GameStatus.WON,
        moveCount: 512,
        startTime: 1692900000000,
        lastMoveTime: 1692900300000,
        canUndo: true,
        previousBoard: [
          [null, null, null, null],
          [
            null,
            { id: 'tile-a', value: 1024, row: 1, col: 1, isNew: false },
            { id: 'tile-b', value: 1024, row: 1, col: 2, isNew: false },
            null,
          ],
          [null, null, null, null],
          [null, null, null, null],
        ],
        previousScore: 18432,
      };

      // First serialization cycle
      const serialized1 = JSON.stringify(complexGameState);
      const deserialized1: GameState = JSON.parse(serialized1);

      // Second serialization cycle
      const serialized2 = JSON.stringify(deserialized1);
      const deserialized2: GameState = JSON.parse(serialized2);

      // Third serialization cycle
      const serialized3 = JSON.stringify(deserialized2);
      const deserialized3: GameState = JSON.parse(serialized3);

      // Verify data integrity after multiple cycles
      expect(deserialized3.board[0][0]?.id).toBe('tile-1');
      expect(deserialized3.board[0][0]?.value).toBe(2048);
      expect(deserialized3.board[0][0]?.mergedFrom).toEqual([
        'tile-a',
        'tile-b',
      ]);
      expect(deserialized3.board[0][2]?.previousPosition).toEqual({
        row: 1,
        col: 2,
      });
      expect(deserialized3.score).toBe(20480);
      expect(deserialized3.gameStatus).toBe(GameStatus.WON);
      expect(deserialized3.previousBoard?.[1][1]?.id).toBe('tile-a');
    });
  });

  describe('SQLite Compatibility', () => {
    it('should create valid SQL-compatible JSON strings', () => {
      const gameState: GameState = {
        board: [
          [
            { id: 'tile-1', value: 2, row: 0, col: 0, isNew: false },
            null,
            null,
            null,
          ],
          [null, null, null, null],
          [null, null, null, null],
          [null, null, null, null],
        ],
        score: 4,
        bestScore: 4,
        gameStatus: GameStatus.PLAYING,
        moveCount: 1,
        startTime: Date.now(),
        lastMoveTime: Date.now(),
        canUndo: false,
      };

      const serialized = JSON.stringify(gameState);

      // Verify string doesn't contain problematic characters for SQL
      expect(serialized).not.toContain("'");
      expect(serialized).not.toContain('\n');
      expect(serialized).not.toContain('\r');

      // Verify it's valid JSON
      expect(() => JSON.parse(serialized)).not.toThrow();
    });

    it('should handle special characters in tile IDs', () => {
      const tileWithSpecialId: Tile = {
        id: 'tile-123_abc-def',
        value: 16,
        row: 1,
        col: 1,
        isNew: false,
      };

      const serialized = JSON.stringify(tileWithSpecialId);
      const deserialized: Tile = JSON.parse(serialized);

      expect(deserialized.id).toBe('tile-123_abc-def');
    });
  });
});
