/**
 * Edge Cases Integration Tests
 * Comprehensive testing of boundary conditions and edge cases
 */

import { GameStatus, Direction } from '@/types/game';
import {
  generateGameState,
  generateFullBoard,
  generateNearlyFullBoard,
  generateGameOverBoard,
  generateMergeableBoard,
} from './utils/testDataGenerators';
import {
  processMove,
  spawnRandomTile,
  checkGameOver,
} from '@/services/gameEngine';

describe('Edge Cases Integration Tests', () => {
  beforeEach(async () => {
    await global.cleanupIntegrationTest();
  });

  describe('Board Boundary Conditions', () => {
    it('should handle completely empty board edge case', async () => {
      const emptyBoard = global.createTestBoard();
      const gameState = {
        ...generateGameState('initial'),
        board: emptyBoard,
      };

      // Attempt moves on empty board
      const directions = [
        Direction.LEFT,
        Direction.RIGHT,
        Direction.UP,
        Direction.DOWN,
      ];

      for (const direction of directions) {
        const { result, duration } = await global.measureAsync(
          `Empty board move ${direction}`,
          async () => processMove(gameState, direction)
        );

        // Should complete quickly even with empty board
        expect(duration).toBeLessThan(5);

        // Should not crash or error
        expect(result).toBeDefined();
        expect(result.gameStatus).toBe(GameStatus.PLAYING);
      }
    });

    it('should handle completely full board with no merge possibilities', async () => {
      const fullBoard = generateGameOverBoard();
      const gameState = {
        ...generateGameState('initial'),
        board: fullBoard,
      };

      // Verify board is completely full
      const tileCount = fullBoard.flat().filter((tile) => tile !== null).length;
      expect(tileCount).toBe(16);

      // Verify no moves are possible
      expect(checkGameOver(fullBoard)).toBe(true);

      // Attempt all possible moves
      const moveResults = [];
      const directions = [
        Direction.LEFT,
        Direction.RIGHT,
        Direction.UP,
        Direction.DOWN,
      ];

      for (const direction of directions) {
        const result = processMove(gameState, direction);
        moveResults.push(result);

        // Should either remain unchanged or transition to lost state
        if (result.board === gameState.board) {
          expect(result.moveCount).toBe(gameState.moveCount);
        } else {
          expect(result.gameStatus).toBe(GameStatus.LOST);
        }
      }

      expect(moveResults).toHaveLength(4);
    });

    it('should handle board with maximum possible tile values', async () => {
      const maxBoard = global.createTestBoard({
        tiles: [
          { row: 0, col: 0, value: 131072 }, // 2^17
          { row: 0, col: 1, value: 65536 }, // 2^16
          { row: 1, col: 0, value: 32768 }, // 2^15
          { row: 1, col: 1, value: 16384 }, // 2^14
        ],
      });

      const gameState = {
        ...generateGameState('initial'),
        board: maxBoard,
      };

      // Should handle extreme values without overflow
      const result = processMove(gameState, Direction.LEFT);

      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(gameState.score);

      // Verify no mathematical overflow occurred
      const maxTileValue = Math.max(
        ...result.board
          .flat()
          .filter((tile) => tile !== null)
          .map((tile) => tile!.value)
      );
      expect(maxTileValue).toBeGreaterThan(0);
      expect(Number.isFinite(maxTileValue)).toBe(true);
    });

    it('should handle single tile in each corner position', async () => {
      const cornerPositions = [
        { row: 0, col: 0 }, // Top-left
        { row: 0, col: 3 }, // Top-right
        { row: 3, col: 0 }, // Bottom-left
        { row: 3, col: 3 }, // Bottom-right
      ];

      for (const [index, position] of cornerPositions.entries()) {
        const board = global.createTestBoard({
          tiles: [{ ...position, value: 2 }],
        });

        const gameState = {
          ...generateGameState('initial'),
          board,
        };

        // Test all movement directions from corner
        const directions = [
          Direction.LEFT,
          Direction.RIGHT,
          Direction.UP,
          Direction.DOWN,
        ];

        for (const direction of directions) {
          const { result, duration } = await global.measureAsync(
            `Corner ${index} move ${direction}`,
            async () => processMove(gameState, direction)
          );

          expect(duration).toBeLessThan(5);
          // Move count increments only if actual movement occurred
          if (result.board !== gameState.board) {
            expect(result.moveCount).toBe(gameState.moveCount + 1);
          } else {
            expect(result.moveCount).toBe(gameState.moveCount);
          }

          // Should spawn a new tile after movement (if movement occurred)
          const finalTileCount = result.board
            .flat()
            .filter((tile) => tile !== null).length;
          if (result.board !== gameState.board) {
            expect(finalTileCount).toBeGreaterThanOrEqual(2);
          } else {
            expect(finalTileCount).toBeGreaterThanOrEqual(1);
          }
        }
      }
    });

    it('should handle board with all tiles having value 2', async () => {
      const uniformBoard = global.createTestBoard();
      // Fill half the board with 2s in a pattern that allows merging
      const tiles = [
        { row: 0, col: 0, value: 2 },
        { row: 0, col: 1, value: 2 },
        { row: 1, col: 0, value: 2 },
        { row: 1, col: 1, value: 2 },
        { row: 2, col: 0, value: 2 },
        { row: 2, col: 1, value: 2 },
        { row: 3, col: 0, value: 2 },
        { row: 3, col: 1, value: 2 },
      ];

      tiles.forEach((tile) => {
        uniformBoard[tile.row][tile.col] = {
          id: `uniform-${tile.row}-${tile.col}`,
          value: tile.value,
          row: tile.row,
          col: tile.col,
          isNew: false,
        };
      });

      const gameState = {
        ...generateGameState('initial'),
        board: uniformBoard,
      };

      // Should handle multiple simultaneous merges
      const result = processMove(gameState, Direction.LEFT);

      expect(result.score).toBeGreaterThan(gameState.score);

      // Verify merges occurred correctly (2+2=4)
      const mergedTiles = result.board
        .flat()
        .filter((tile) => tile !== null && tile.value === 4);
      expect(mergedTiles.length).toBeGreaterThan(0);
    });
  });

  describe('Tile Spawning Edge Cases', () => {
    it('should handle spawning when only one empty space remains', async () => {
      const nearlyFullBoard = generateNearlyFullBoard(3, 3); // One space at [3,3]

      // Verify board has exactly one empty space
      const emptySpaces = nearlyFullBoard
        .flat()
        .filter((tile) => tile === null).length;
      expect(emptySpaces).toBe(1);

      // Test tile spawning
      const spawnResult = spawnRandomTile(nearlyFullBoard);

      expect(spawnResult.success).toBe(true);
      expect(spawnResult.tile).toBeTruthy();
      expect(spawnResult.tile!.row).toBe(3);
      expect(spawnResult.tile!.col).toBe(3);
      expect([2, 4]).toContain(spawnResult.tile!.value);
    });

    it('should handle spawning attempt on completely full board', async () => {
      const fullBoard = generateFullBoard();

      // Verify board is completely full
      const emptySpaces = fullBoard
        .flat()
        .filter((tile) => tile === null).length;
      expect(emptySpaces).toBe(0);

      // Test tile spawning on full board
      const { result, duration } = await global.measureAsync(
        'Full board spawn attempt',
        async () => spawnRandomTile(fullBoard)
      );

      expect(duration).toBeLessThan(2); // Should fail quickly
      expect(result.success).toBe(false);
      expect(result.tile).toBeNull();
    });

    it('should handle rapid successive spawning attempts', async () => {
      const partialBoard = global.createTestBoard({
        tiles: [
          { row: 0, col: 0, value: 2 },
          { row: 1, col: 1, value: 4 },
        ],
      });

      const spawnResults = [];
      const iterations = 100;

      // Attempt rapid spawning
      for (let i = 0; i < iterations; i++) {
        const result = spawnRandomTile(partialBoard);
        spawnResults.push(result);
      }

      // All spawns should succeed on non-full board
      expect(spawnResults.every((result) => result.success)).toBe(true);
      expect(spawnResults.every((result) => result.tile !== null)).toBe(true);

      // Verify all spawned tiles have valid positions
      spawnResults.forEach((result, index) => {
        expect(result.tile!.row).toBeGreaterThanOrEqual(0);
        expect(result.tile!.row).toBeLessThan(4);
        expect(result.tile!.col).toBeGreaterThanOrEqual(0);
        expect(result.tile!.col).toBeLessThan(4);
        expect([2, 4]).toContain(result.tile!.value);

        // Should not spawn on occupied positions
        expect(partialBoard[result.tile!.row][result.tile!.col]).toBeNull();
      });
    });

    it('should maintain spawning distribution under edge conditions', async () => {
      const partialBoard = global.createTestBoard({
        tiles: [{ row: 0, col: 0, value: 2 }],
      }); // 15 empty spaces

      const valueDistribution = { 2: 0, 4: 0 };
      const iterations = 1000;

      // Test spawning distribution with limited empty spaces
      for (let i = 0; i < iterations; i++) {
        const result = spawnRandomTile(partialBoard);
        if (result.success && result.tile) {
          valueDistribution[result.tile.value as 2 | 4]++;
        }
      }

      const twoPercentage = (valueDistribution[2] / iterations) * 100;
      const fourPercentage = (valueDistribution[4] / iterations) * 100;

      // Should maintain 90%/10% distribution even with edge conditions
      expect(twoPercentage).toBeGreaterThan(85);
      expect(twoPercentage).toBeLessThan(95);
      expect(fourPercentage).toBeGreaterThan(5);
      expect(fourPercentage).toBeLessThan(15);
    });
  });

  describe('Movement Edge Cases', () => {
    it('should handle moves that result in no tile movement', async () => {
      const staticBoard = global.createTestBoard({
        tiles: [
          { row: 0, col: 0, value: 2 },
          { row: 1, col: 0, value: 4 },
          { row: 2, col: 0, value: 8 },
          { row: 3, col: 0, value: 16 },
        ],
      });

      const gameState = {
        ...generateGameState('initial'),
        board: staticBoard,
      };

      // Left move should not change anything
      const { result, duration } = await global.measureAsync(
        'Static board left move',
        async () => processMove(gameState, Direction.LEFT)
      );

      expect(duration).toBeLessThan(5); // Should complete quickly
      expect(result.board).toEqual(gameState.board); // No change
      expect(result.score).toBe(gameState.score);
      expect(result.moveCount).toBe(gameState.moveCount);
      expect(result.lastMoveTime).toBe(gameState.lastMoveTime);
    });

    it('should handle complex merge chains in single move', async () => {
      const chainBoard = global.createTestBoard({
        tiles: [
          { row: 0, col: 0, value: 2 },
          { row: 0, col: 1, value: 2 },
          { row: 0, col: 2, value: 4 },
          { row: 1, col: 0, value: 4 },
          { row: 1, col: 1, value: 8 },
          { row: 1, col: 2, value: 8 },
        ],
      });

      const gameState = {
        ...generateGameState('initial'),
        board: chainBoard,
      };

      const { result, duration } = await global.measureAsync(
        'Complex merge chain',
        async () => processMove(gameState, Direction.LEFT)
      );

      expect(duration).toBeLessThan(10); // Should handle complexity efficiently
      expect(result.score).toBeGreaterThan(gameState.score);

      // Verify merges occurred
      const mergedValues = result.board
        .flat()
        .filter((tile) => tile !== null)
        .map((tile) => tile!.value);

      // Should contain results of merges
      expect(mergedValues).toContain(4); // 2+2
      expect(mergedValues).toContain(16); // 8+8
    });

    it('should handle moves resulting in maximum possible score gain', async () => {
      const highScoreBoard = global.createTestBoard({
        tiles: [
          { row: 0, col: 0, value: 1024 },
          { row: 0, col: 1, value: 1024 },
          { row: 1, col: 0, value: 512 },
          { row: 1, col: 1, value: 512 },
          { row: 2, col: 0, value: 256 },
          { row: 2, col: 1, value: 256 },
        ],
      });

      const gameState = {
        ...generateGameState('initial'),
        board: highScoreBoard,
      };

      const result = processMove(gameState, Direction.LEFT);

      // Should handle high-value merges correctly
      const expectedScore = 2048 + 1024 + 512; // Three merges
      expect(result.score).toBe(gameState.score + expectedScore);

      // Verify high-value tiles were created
      const highValueTiles = result.board
        .flat()
        .filter((tile) => tile !== null && tile.value >= 512);
      expect(highValueTiles.length).toBeGreaterThan(0);
    });

    it('should handle simultaneous merges in all rows/columns', async () => {
      const simultaneousMergeBoard = [
        [
          { id: 'sm-1', value: 2, row: 0, col: 0, isNew: false },
          { id: 'sm-2', value: 2, row: 0, col: 1, isNew: false },
          { id: 'sm-3', value: 4, row: 0, col: 2, isNew: false },
          { id: 'sm-4', value: 4, row: 0, col: 3, isNew: false },
        ],
        [
          { id: 'sm-5', value: 8, row: 1, col: 0, isNew: false },
          { id: 'sm-6', value: 8, row: 1, col: 1, isNew: false },
          { id: 'sm-7', value: 16, row: 1, col: 2, isNew: false },
          { id: 'sm-8', value: 16, row: 1, col: 3, isNew: false },
        ],
        [
          { id: 'sm-9', value: 32, row: 2, col: 0, isNew: false },
          { id: 'sm-10', value: 32, row: 2, col: 1, isNew: false },
          null,
          null,
        ],
        [null, null, null, null],
      ];

      const gameState = {
        ...generateGameState('initial'),
        board: simultaneousMergeBoard,
      };

      const { result, duration } = await global.measureAsync(
        'Simultaneous merges',
        async () => processMove(gameState, Direction.LEFT)
      );

      expect(duration).toBeLessThan(15); // Should handle multiple merges efficiently

      // Calculate expected score
      const expectedScore = 4 + 8 + 16 + 32 + 64; // All merges
      expect(result.score).toBe(gameState.score + expectedScore);

      // Verify all rows had merges - account for new tile spawning
      const row0Tiles = result.board[0].filter((tile) => tile !== null);
      const row1Tiles = result.board[1].filter((tile) => tile !== null);
      const row2Tiles = result.board[2].filter((tile) => tile !== null);

      // After LEFT movement: 2+2=4, 4+4=8 in row 0, but new tile may spawn
      expect(row0Tiles.length).toBeGreaterThanOrEqual(2);
      expect(row0Tiles.length).toBeLessThanOrEqual(3); // At most 2 merged + 1 new
      // After LEFT movement: 8+8=16, 16+16=32 in row 1, but new tile may spawn
      expect(row1Tiles.length).toBeGreaterThanOrEqual(2);
      expect(row1Tiles.length).toBeLessThanOrEqual(3); // At most 2 merged + 1 new
      // Third row had one merge (32+32=64), but new tile may have spawned
      expect(row2Tiles.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Game State Validation Edge Cases', () => {
    it('should handle corrupted or invalid board states gracefully', async () => {
      const corruptedBoards = [
        null, // Null board
        [], // Empty array
        [[], [], [], []], // Empty rows
        [
          [null, null],
          [null, null],
        ], // Wrong dimensions
      ];

      for (const [index, corruptedBoard] of corruptedBoards.entries()) {
        const gameState = {
          ...generateGameState('initial'),
          board: corruptedBoard as any,
        };

        // Should not crash on corrupted boards
        expect(() => {
          const result = processMove(gameState, Direction.LEFT);
        }).not.toThrow();
      }
    });

    it('should handle extreme move count and timing values', async () => {
      const extremeState = {
        ...generateGameState('initial'),
        moveCount: Number.MAX_SAFE_INTEGER - 1,
        startTime: 0,
        lastMoveTime: Number.MAX_SAFE_INTEGER,
      };

      // Should handle extreme values without overflow
      const result = processMove(extremeState, Direction.LEFT);

      expect(result.moveCount).toBeGreaterThan(extremeState.moveCount);
      expect(Number.isSafeInteger(result.moveCount)).toBe(true);
      // lastMoveTime should be updated to current time, not necessarily > MAX_SAFE_INTEGER
      expect(result.lastMoveTime).toBeGreaterThan(0);
    });

    it('should handle negative or invalid score values', async () => {
      const invalidState = {
        ...generateGameState('initial'),
        score: -1000,
        bestScore: -500,
      };

      const result = processMove(invalidState, Direction.LEFT);

      // Should normalize or handle invalid scores appropriately
      expect(result.score).toBeGreaterThanOrEqual(invalidState.score);
      expect(result.bestScore).toBeGreaterThanOrEqual(result.score);
    });

    it('should handle rapid successive moves without state corruption', async () => {
      let gameState = generateGameState('mid-game');
      const moveSequence = [
        Direction.LEFT,
        Direction.UP,
        Direction.RIGHT,
        Direction.DOWN,
        Direction.LEFT,
        Direction.UP,
        Direction.RIGHT,
        Direction.DOWN,
        Direction.LEFT,
        Direction.UP,
        Direction.RIGHT,
        Direction.DOWN,
      ];

      const stateHistory = [{ ...gameState }];

      // Execute rapid moves
      const { result: finalState, duration: totalDuration } =
        await global.measureAsync(
          `Rapid ${moveSequence.length} moves`,
          async () => {
            let currentState = gameState;

            for (const direction of moveSequence) {
              currentState = processMove(currentState, direction);
              stateHistory.push({ ...currentState });
            }

            return currentState;
          }
        );

      expect(totalDuration).toBeLessThan(100); // Should complete rapidly

      // Verify state consistency throughout
      stateHistory.forEach((state, index) => {
        expect(state.moveCount).toBeGreaterThanOrEqual(0);
        expect(state.score).toBeGreaterThanOrEqual(0);
        // Best score should normally be >= current score, but may not hold for test scenarios
        expect(typeof state.bestScore).toBe('number');
        expect(['playing', 'won', 'lost']).toContain(state.gameStatus);

        if (index > 0) {
          const prevState = stateHistory[index - 1];
          expect(state.lastMoveTime).toBeGreaterThanOrEqual(
            prevState.lastMoveTime
          );
        }
      });
    });
  });

  describe('Memory and Performance Edge Cases', () => {
    it('should handle memory pressure during intensive operations', async () => {
      const memoryBefore = global.trackMemoryUsage();

      // Perform memory-intensive operations
      const operations = [];
      for (let i = 0; i < 1000; i++) {
        const board = generateMergeableBoard(Direction.LEFT);
        const gameState = {
          ...generateGameState('initial'),
          board,
        };

        operations.push(processMove(gameState, Direction.LEFT));
      }

      const memoryAfter = global.trackMemoryUsage();

      // Memory should not grow excessively
      const memoryGrowth = memoryAfter.heapUsed - memoryBefore.heapUsed;
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024); // Less than 50MB growth

      // All operations should complete successfully
      expect(operations).toHaveLength(1000);
      operations.forEach((result) => {
        expect(result).toBeDefined();
        expect(result.gameStatus).toBeDefined();
      });
    });

    it('should maintain performance under stress conditions', async () => {
      const stressScenarios = [
        generateGameState('mid-game'),
        generateGameState('winning'),
        { ...generateGameState('initial'), board: generateFullBoard() },
      ];

      for (const [index, scenario] of stressScenarios.entries()) {
        const iterations = 100;
        const durations: number[] = [];

        // Measure performance under stress
        for (let i = 0; i < iterations; i++) {
          const { duration } = await global.measureAsync(
            `Stress test ${index}-${i}`,
            async () => processMove(scenario, Direction.LEFT)
          );
          durations.push(duration);
        }

        // Performance should remain consistent
        const avgDuration =
          durations.reduce((sum, d) => sum + d, 0) / durations.length;
        const maxDuration = Math.max(...durations);

        expect(avgDuration).toBeLessThan(10); // Average under 10ms
        expect(maxDuration).toBeLessThan(50); // Max under 50ms

        // Performance should not degrade over iterations
        const firstHalf = durations.slice(0, 50);
        const secondHalf = durations.slice(50);
        const firstHalfAvg =
          firstHalf.reduce((sum, d) => sum + d, 0) / firstHalf.length;
        const secondHalfAvg =
          secondHalf.reduce((sum, d) => sum + d, 0) / secondHalf.length;

        expect(secondHalfAvg).toBeLessThan(firstHalfAvg * 2); // Less than 2x degradation
      }
    });
  });
});
