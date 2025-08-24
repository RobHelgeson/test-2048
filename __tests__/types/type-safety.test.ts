/**
 * TypeScript compilation and type safety tests.
 * Validates strict mode compliance and proper enum usage.
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

describe('Type Safety and Compilation Tests', () => {
  describe('Strict Type Checking', () => {
    it('should enforce required properties in GameState', () => {
      // This test verifies that all required properties must be provided
      const validGameState: GameState = {
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

      expect(validGameState).toBeDefined();

      // Type checking - these would fail compilation if types are wrong
      const board: Board = validGameState.board;
      const score: number = validGameState.score;
      const status: GameStatus = validGameState.gameStatus;

      expect(board).toBeDefined();
      expect(typeof score).toBe('number');
      expect(typeof status).toBe('string');
    });

    it('should enforce required properties in Tile', () => {
      const validTile: Tile = {
        id: 'tile-test',
        value: 2,
        row: 0,
        col: 0,
        isNew: false,
      };

      expect(validTile).toBeDefined();

      // Type checking - these would fail compilation if types are wrong
      const id: string = validTile.id;
      const value: number = validTile.value;
      const row: number = validTile.row;
      const col: number = validTile.col;
      const isNew: boolean = validTile.isNew;

      expect(typeof id).toBe('string');
      expect(typeof value).toBe('number');
      expect(typeof row).toBe('number');
      expect(typeof col).toBe('number');
      expect(typeof isNew).toBe('boolean');
    });

    it('should enforce Position interface properties', () => {
      const position: Position = { row: 1, col: 2 };

      // Type checking
      const row: number = position.row;
      const col: number = position.col;

      expect(typeof row).toBe('number');
      expect(typeof col).toBe('number');
    });
  });

  describe('Enum Type Safety', () => {
    it('should prevent invalid Direction values', () => {
      // These are valid
      const up: Direction = Direction.UP;
      const down: Direction = Direction.DOWN;
      const left: Direction = Direction.LEFT;
      const right: Direction = Direction.RIGHT;

      expect(up).toBe('up');
      expect(down).toBe('down');
      expect(left).toBe('left');
      expect(right).toBe('right');

      // Test enum contains only expected values
      const allDirections = Object.values(Direction);
      expect(allDirections).toHaveLength(4);
      expect(allDirections.every((dir) => typeof dir === 'string')).toBe(true);
    });

    it('should prevent invalid GameStatus values', () => {
      // These are valid
      const playing: GameStatus = GameStatus.PLAYING;
      const won: GameStatus = GameStatus.WON;
      const lost: GameStatus = GameStatus.LOST;

      expect(playing).toBe('playing');
      expect(won).toBe('won');
      expect(lost).toBe('lost');

      // Test enum contains only expected values
      const allStatuses = Object.values(GameStatus);
      expect(allStatuses).toHaveLength(3);
      expect(allStatuses.every((status) => typeof status === 'string')).toBe(
        true
      );
    });

    it('should work with switch statements without default case', () => {
      const testAllDirections = (direction: Direction): string => {
        switch (direction) {
          case Direction.UP:
            return 'up';
          case Direction.DOWN:
            return 'down';
          case Direction.LEFT:
            return 'left';
          case Direction.RIGHT:
            return 'right';
          // No default case needed - TypeScript ensures exhaustive checking
        }
      };

      expect(testAllDirections(Direction.UP)).toBe('up');
      expect(testAllDirections(Direction.DOWN)).toBe('down');
      expect(testAllDirections(Direction.LEFT)).toBe('left');
      expect(testAllDirections(Direction.RIGHT)).toBe('right');
    });

    it('should work with GameStatus switch statements', () => {
      const testAllStatuses = (status: GameStatus): string => {
        switch (status) {
          case GameStatus.PLAYING:
            return 'game in progress';
          case GameStatus.WON:
            return 'game won';
          case GameStatus.LOST:
            return 'game over';
        }
      };

      expect(testAllStatuses(GameStatus.PLAYING)).toBe('game in progress');
      expect(testAllStatuses(GameStatus.WON)).toBe('game won');
      expect(testAllStatuses(GameStatus.LOST)).toBe('game over');
    });
  });

  describe('Array Type Safety', () => {
    it('should enforce Board type as 2D array', () => {
      const board: Board = [
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];

      // Type checking - accessing elements should be type-safe
      const cell: Tile | null = board[0][0];
      expect(cell).toBe(null);

      // Setting tiles should be type-safe
      const tile: Tile = {
        id: 'test-tile',
        value: 2,
        row: 0,
        col: 0,
        isNew: true,
      };
      board[0][0] = tile;
      expect(board[0][0]).toBe(tile);
    });

    it('should enforce PositionArray type safety', () => {
      const positions: PositionArray = [
        { row: 0, col: 0 },
        { row: 1, col: 1 },
      ];

      // Type checking
      positions.forEach((position: Position) => {
        expect(typeof position.row).toBe('number');
        expect(typeof position.col).toBe('number');
      });

      // Array methods should work
      const firstPosition = positions[0];
      expect(firstPosition.row).toBe(0);
      expect(firstPosition.col).toBe(0);
    });
  });

  describe('Optional Property Type Safety', () => {
    it('should handle optional Tile properties correctly', () => {
      const tileWithOptionals: Tile = {
        id: 'tile-with-optionals',
        value: 4,
        row: 1,
        col: 1,
        isNew: false,
        mergedFrom: ['tile-1', 'tile-2'],
        previousPosition: { row: 0, col: 1 },
      };

      // Optional properties should be accessible with proper types
      const mergedFrom: string[] | undefined = tileWithOptionals.mergedFrom;
      const previousPosition: Position | undefined =
        tileWithOptionals.previousPosition;

      expect(Array.isArray(mergedFrom)).toBe(true);
      expect(typeof previousPosition).toBe('object');
      expect(previousPosition?.row).toBe(0);
      expect(previousPosition?.col).toBe(1);
    });

    it('should handle optional GameState properties correctly', () => {
      const gameStateWithOptionals: GameState = {
        board: [
          [null, null, null, null],
          [null, null, null, null],
          [null, null, null, null],
          [null, null, null, null],
        ],
        score: 100,
        bestScore: 200,
        gameStatus: GameStatus.PLAYING,
        moveCount: 5,
        startTime: Date.now(),
        lastMoveTime: Date.now(),
        canUndo: true,
        previousBoard: [
          [null, null, null, null],
          [null, null, null, null],
          [null, null, null, null],
          [null, null, null, null],
        ],
        previousScore: 50,
      };

      // Optional properties should be accessible with proper types
      const previousBoard: Board | undefined =
        gameStateWithOptionals.previousBoard;
      const previousScore: number | undefined =
        gameStateWithOptionals.previousScore;

      expect(Array.isArray(previousBoard)).toBe(true);
      expect(typeof previousScore).toBe('number');
    });

    it('should handle missing optional properties', () => {
      const tileWithoutOptionals: Tile = {
        id: 'tile-minimal',
        value: 8,
        row: 2,
        col: 2,
        isNew: true,
      };

      expect(tileWithoutOptionals.mergedFrom).toBeUndefined();
      expect(tileWithoutOptionals.previousPosition).toBeUndefined();
    });
  });

  describe('Function Type Safety', () => {
    it('should enforce InitialGameStateFactory type signature', () => {
      const factory: InitialGameStateFactory = (
        config?: InitialGameConfig
      ): GameState => {
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

      // Function should accept optional config
      const stateWithoutConfig = factory();
      const stateWithConfig = factory({ initialTileCount: 2 });

      expect(stateWithoutConfig.score).toBe(0);
      expect(stateWithConfig.score).toBe(0);

      // Return type should be GameState
      expect(stateWithoutConfig.gameStatus).toBe(GameStatus.PLAYING);
      expect(Array.isArray(stateWithoutConfig.board)).toBe(true);
    });

    it('should enforce InitialGameConfig type safety', () => {
      const fullConfig: InitialGameConfig = {
        boardSize: 4,
        initialTileCount: 2,
        startingTileValue: 2,
      };

      const partialConfig: InitialGameConfig = {
        initialTileCount: 3,
      };

      const emptyConfig: InitialGameConfig = {};

      // All configs should be valid
      expect(fullConfig.boardSize).toBe(4);
      expect(partialConfig.initialTileCount).toBe(3);
      expect(partialConfig.boardSize).toBeUndefined();
      expect(Object.keys(emptyConfig)).toHaveLength(0);
    });
  });

  describe('Type Alias Safety', () => {
    it('should enforce BoardSize type constraint', () => {
      const boardSize: BoardSize = 4;
      expect(boardSize).toBe(4);
    });

    it('should enforce EmptyPosition type aliasing', () => {
      const emptyPos: EmptyPosition = { row: 1, col: 1 };
      const position: Position = emptyPos; // Should be assignable

      expect(position.row).toBe(1);
      expect(position.col).toBe(1);
    });
  });

  describe('Import/Export Type Safety', () => {
    it('should properly import all types from barrel export', () => {
      // This test verifies that all imports work correctly
      // GameState is an interface, not a runtime value, so we can't check typeof
      // We verify it exists by importing and using it in type annotations
      expect(typeof Direction).toBe('object'); // Enum, has runtime value
      expect(typeof GameStatus).toBe('object'); // Enum, has runtime value

      // Enums should have expected properties
      expect(Direction.UP).toBe('up');
      expect(GameStatus.PLAYING).toBe('playing');
    });

    it('should maintain type safety across module boundaries', () => {
      // Test that types imported from @/types work correctly
      const createMockGameState = (): GameState => {
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

      const gameState = createMockGameState();
      expect(gameState.gameStatus).toBe(GameStatus.PLAYING);
    });
  });

  describe('Generic Type Constraints', () => {
    it('should work with generic functions using game types', () => {
      const processPosition = <T extends Position>(pos: T): T => {
        // This function should work with Position and any type that extends it
        return pos;
      };

      const basicPosition: Position = { row: 1, col: 2 };
      const emptyPosition: EmptyPosition = { row: 3, col: 4 };

      const result1 = processPosition(basicPosition);
      const result2 = processPosition(emptyPosition);

      expect(result1).toEqual(basicPosition);
      expect(result2).toEqual(emptyPosition);
    });

    it('should work with array operations on typed arrays', () => {
      const positions: PositionArray = [
        { row: 0, col: 0 },
        { row: 1, col: 1 },
        { row: 2, col: 2 },
      ];

      // Filter should maintain type safety
      const filteredPositions = positions.filter((pos) => pos.row > 0);
      expect(filteredPositions).toHaveLength(2);

      // Map should work with type inference
      const rowNumbers = positions.map((pos) => pos.row);
      expect(rowNumbers).toEqual([0, 1, 2]);

      // Find should maintain type safety
      const foundPosition = positions.find((pos) => pos.row === 1);
      expect(foundPosition?.col).toBe(1);
    });
  });
});
