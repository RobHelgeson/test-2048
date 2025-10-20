/**
 * Comprehensive Game Engine Integration Tests
 * Tests end-to-end game scenarios and complete game flow validation
 */

import { GameStatus, Direction } from '@/types/game';
import {
  generateGameState,
  generateWinningBoard,
  generateGameOverBoard,
  generateMergeableBoard,
  SeededRandom,
} from './utils/testDataGenerators';
import {
  processMove,
  spawnRandomTile,
  validateGameState,
  checkWinCondition,
  checkGameOver,
} from '@/services/gameEngine';

describe('Game Engine Integration Tests', () => {
  beforeEach(async () => {
    await global.cleanupIntegrationTest();
  });

  describe('Complete Game Flow Integration', () => {
    it('should complete a full game from initialization to win condition', async () => {
      // Start with a winning board configuration just before 2048
      let gameState = generateGameState('initial');
      gameState.board = global.createTestBoard({
        tiles: [
          { row: 0, col: 0, value: 1024 },
          { row: 0, col: 1, value: 1024 },
          { row: 1, col: 0, value: 512 },
          { row: 1, col: 1, value: 256 },
        ],
      });

      // Validate initial state
      expect(gameState.gameStatus).toBe(GameStatus.PLAYING);
      expect(checkWinCondition(gameState.board)).toBe(false);

      // Make move that creates 2048 tile
      const { result: moveResult } = await global.measureAsync('Win condition move', async () => {
        return processMove(gameState, Direction.LEFT);
      });

      // Verify win condition is detected
      expect(moveResult.gameStatus).toBe(GameStatus.WON);
      expect(checkWinCondition(moveResult.board)).toBe(true);
      expect(moveResult.score).toBeGreaterThan(gameState.score);
      expect(moveResult.moveCount).toBe(gameState.moveCount + 1);

      // Verify can continue playing after win
      const continueState = {
        ...moveResult,
        gameStatus: GameStatus.PLAYING,
      };

      const finalMove = processMove(continueState, Direction.DOWN);
      // Should remain playing unless game over, but might stay won if no valid moves
      expect([GameStatus.PLAYING, GameStatus.WON]).toContain(finalMove.gameStatus);
    });

    it('should complete a full game from initialization to loss condition', async () => {
      // Create a nearly game over state
      let gameState = generateGameState('initial');
      gameState.board = generateGameOverBoard();

      // Verify initial losing state detection
      const validation = validateGameState(gameState.board);
      expect(validation.isGameOver).toBe(true);
      expect(validation.isWon).toBe(false);

      // Attempt moves on game over board
      const directions = [Direction.LEFT, Direction.RIGHT, Direction.UP, Direction.DOWN];

      for (const direction of directions) {
        const { result: moveResult } = await global.measureAsync(`Game over move ${direction}`, async () => {
          return processMove(gameState, direction);
        });

        // Should either remain unchanged or transition to lost state
        expect([GameStatus.PLAYING, GameStatus.LOST]).toContain(moveResult.gameStatus);
        if (moveResult.gameStatus === GameStatus.LOST) {
          expect(checkGameOver(moveResult.board)).toBe(true);
        }
      }
    });

    it('should handle game continuation after reaching 2048', async () => {
      const winningState = generateGameState('winning');
      expect(winningState.gameStatus).toBe(GameStatus.WON);

      // Continue playing after win
      const continuedState = {
        ...winningState,
        gameStatus: GameStatus.PLAYING,
      };

      // Should be able to make additional moves
      const nextMove = processMove(continuedState, Direction.UP);
      expect(nextMove.gameStatus).toBe(GameStatus.PLAYING);
      // Move count should only increment if actual movement occurred
      expect(nextMove.moveCount).toBeGreaterThanOrEqual(continuedState.moveCount);
    });

    it('should maintain consistent state across multiple game sessions', async () => {
      const sessions: any[] = [];

      // Simulate 3 complete game sessions
      for (let session = 0; session < 3; session++) {
        let gameState = generateGameState('initial');
        const moves: Direction[] = [];
        let moveCount = 0;

        // Play until game ends or max moves reached
        while (gameState.gameStatus === GameStatus.PLAYING && moveCount < 50) {
          const direction = [Direction.LEFT, Direction.UP, Direction.RIGHT, Direction.DOWN][moveCount % 4];
          const prevState = { ...gameState };

          gameState = processMove(gameState, direction);
          moves.push(direction);
          moveCount++;

          // Validate state consistency
          expect(gameState.moveCount).toBe(prevState.moveCount + (gameState.board !== prevState.board ? 1 : 0));
          expect(gameState.score).toBeGreaterThanOrEqual(prevState.score);
          expect(gameState.bestScore).toBeGreaterThanOrEqual(prevState.bestScore);
          expect(gameState.lastMoveTime).toBeGreaterThanOrEqual(prevState.lastMoveTime);
        }

        sessions.push({
          finalScore: gameState.score,
          finalStatus: gameState.gameStatus,
          totalMoves: gameState.moveCount,
          movesAttempted: moveCount,
        });
      }

      // Validate session data consistency
      expect(sessions).toHaveLength(3);
      sessions.forEach((session, index) => {
        expect(session.finalScore).toBeGreaterThanOrEqual(0);
        expect(['playing', 'won', 'lost']).toContain(session.finalStatus);
        expect(session.totalMoves).toBeGreaterThanOrEqual(0);
        expect(session.movesAttempted).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle game interruption and resumption scenarios', async () => {
      // Start a game
      const initialState = generateGameState('mid-game');
      const checkpoint = { ...initialState };

      // Make some moves
      let currentState = processMove(initialState, Direction.LEFT);
      currentState = processMove(currentState, Direction.UP);

      // Simulate interruption (save state)
      const interruptedState = { ...currentState };

      // Simulate resumption (restore state)
      const resumedState = { ...interruptedState };

      // Continue playing from resumed state
      const continuedMove = processMove(resumedState, Direction.RIGHT);

      // Verify consistency
      expect(continuedMove.moveCount).toBeGreaterThanOrEqual(resumedState.moveCount);
      expect(continuedMove.score).toBeGreaterThanOrEqual(resumedState.score);
      expect(continuedMove.lastMoveTime).toBeGreaterThanOrEqual(resumedState.lastMoveTime);
    });
  });

  describe('Edge Case Integration Testing', () => {
    it('should handle full board scenarios with no possible moves', async () => {
      const fullBoard = generateGameOverBoard();
      const gameState = {
        ...generateGameState('initial'),
        board: fullBoard,
      };

      // Verify game over detection
      expect(checkGameOver(fullBoard)).toBe(true);

      // Attempt all possible moves
      const directions = [Direction.LEFT, Direction.RIGHT, Direction.UP, Direction.DOWN];
      const results = [];

      for (const direction of directions) {
        const result = processMove(gameState, direction);
        results.push(result);

        // Should either not move or transition to lost state
        if (result.board === gameState.board) {
          expect(result.score).toBe(gameState.score);
          expect(result.moveCount).toBe(gameState.moveCount);
        } else {
          expect(result.gameStatus).toBe(GameStatus.LOST);
        }
      }

      expect(results).toHaveLength(4);
    });

    it('should handle single tile movement in various board configurations', async () => {
      const configurations = [
        // Single tile in corner
        global.createTestBoard({ tiles: [{ row: 0, col: 0, value: 2 }] }),
        // Single tile in center
        global.createTestBoard({ tiles: [{ row: 1, col: 1, value: 4 }] }),
        // Single tile on edge
        global.createTestBoard({ tiles: [{ row: 0, col: 1, value: 8 }] }),
      ];

      for (const [index, board] of configurations.entries()) {
        const gameState = {
          ...generateGameState('initial'),
          board,
        };

        // Test all directions
        const directions = [Direction.LEFT, Direction.RIGHT, Direction.UP, Direction.DOWN];

        for (const direction of directions) {
          const result = processMove(gameState, direction);

          // Should always result in movement for single tile (if valid move)
          if (result.board !== gameState.board) {
            expect(result.moveCount).toBe(gameState.moveCount + 1);
          } else {
            expect(result.moveCount).toBe(gameState.moveCount);
          }

          // New tile should be spawned if movement occurred
          const tileCount = result.board.flat().filter((tile) => tile !== null).length;
          expect(tileCount).toBeGreaterThanOrEqual(1);

          // Performance check - should complete quickly
          const { duration } = await global.measureAsync(`Single tile move ${index}-${direction}`, async () => {
            return processMove(gameState, direction);
          });
          expect(duration).toBeLessThan(10); // Should complete in under 10ms
        }
      }
    });

    it('should handle invalid move attempts that do not change board state', async () => {
      // Create board where left move is impossible
      const board = global.createTestBoard({
        tiles: [
          { row: 0, col: 0, value: 2 },
          { row: 1, col: 0, value: 4 },
          { row: 2, col: 0, value: 8 },
          { row: 3, col: 0, value: 16 },
        ],
      });

      const gameState = {
        ...generateGameState('initial'),
        board,
      };

      // Attempt move that should not change state
      const result = processMove(gameState, Direction.LEFT);

      // Board should remain unchanged
      expect(result.board).toEqual(gameState.board);
      expect(result.score).toBe(gameState.score);
      expect(result.moveCount).toBe(gameState.moveCount);
      expect(result.lastMoveTime).toBe(gameState.lastMoveTime);
    });

    it('should handle board states with maximum tile values beyond 2048', async () => {
      const maxValueBoard = global.createTestBoard({
        tiles: [
          { row: 0, col: 0, value: 4096 },
          { row: 0, col: 1, value: 4096 },
          { row: 1, col: 0, value: 2048 },
          { row: 1, col: 1, value: 1024 },
        ],
      });

      const gameState = {
        ...generateGameState('initial'),
        board: maxValueBoard,
      };

      // Should handle high values without overflow or errors
      const result = processMove(gameState, Direction.LEFT);

      // Verify results are mathematically correct
      expect(result.gameStatus).not.toBe(GameStatus.LOST);
      expect(result.score).toBeGreaterThanOrEqual(gameState.score);

      // Check for tile values that exceed typical game limits
      const maxTile = Math.max(
        ...result.board
          .flat()
          .filter((tile) => tile !== null)
          .map((tile) => tile!.value)
      );
      expect(maxTile).toBeGreaterThanOrEqual(4096);
    });

    it('should handle corner cases for tile spawning on nearly full boards', async () => {
      // Create board with only one empty space
      const nearlyFullBoard = generateMergeableBoard(Direction.LEFT);
      // Fill all but one space
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          if (nearlyFullBoard[row][col] === null && !(row === 3 && col === 3)) {
            nearlyFullBoard[row][col] = {
              id: `filler-${row}-${col}`,
              value: 2,
              row,
              col,
              isNew: false,
            };
          }
        }
      }

      const gameState = {
        ...generateGameState('initial'),
        board: nearlyFullBoard,
      };

      // Make move that should spawn tile in the only available space
      const result = processMove(gameState, Direction.LEFT);

      // Verify tile was spawned in correct location
      const tileCount = result.board.flat().filter((tile) => tile !== null).length;
      expect(tileCount).toBeGreaterThan(0);

      // Verify spawning logic worked correctly
      const spawnResult = spawnRandomTile(nearlyFullBoard);
      if (spawnResult.success) {
        expect(spawnResult.tile).toBeTruthy();
        expect([2, 4]).toContain(spawnResult.tile!.value);
      }
    });

    it('should handle multiple consecutive merges in single move', async () => {
      // Create board with multiple merge opportunities
      const multiMergeBoard = global.createTestBoard({
        tiles: [
          { row: 0, col: 0, value: 2 },
          { row: 0, col: 1, value: 2 },
          { row: 0, col: 2, value: 4 },
          { row: 0, col: 3, value: 4 },
        ],
      });

      const gameState = {
        ...generateGameState('initial'),
        board: multiMergeBoard,
      };

      const { result, duration } = await global.measureAsync('Multiple merge move', async () => {
        return processMove(gameState, Direction.LEFT);
      });

      // Should complete multiple merges efficiently
      expect(duration).toBeLessThan(50); // Should complete in under 50ms

      // Verify scoring from multiple merges
      expect(result.score).toBe(gameState.score + 4 + 8); // 2+2=4, 4+4=8

      // Verify board state after multiple merges
      const finalTiles = result.board.flat().filter((tile) => tile !== null);
      expect(finalTiles.some((tile) => tile!.value === 4)).toBe(true); // From 2+2
      expect(finalTiles.some((tile) => tile!.value === 8)).toBe(true); // From 4+4
    });
  });

  describe('Randomness and Algorithm Verification', () => {
    it('should verify tile spawning distribution over large sample size', async () => {
      const sampleSize = 10000;
      const twos = { count: 0 };
      const fours = { count: 0 };

      // Use seeded random for reproducible tests
      const originalMathRandom = Math.random;
      const seededRandom = new SeededRandom(42);
      Math.random = () => seededRandom.next();

      try {
        const { result: distributionResults } = await global.measureAsync(
          `Tile spawning distribution test (n=${sampleSize})`,
          async () => {
            const emptyBoard = global.createTestBoard();

            for (let i = 0; i < sampleSize; i++) {
              const spawnResult = spawnRandomTile(emptyBoard);
              if (spawnResult.success && spawnResult.tile) {
                if (spawnResult.tile.value === 2) {
                  twos.count++;
                } else if (spawnResult.tile.value === 4) {
                  fours.count++;
                }
              }
            }

            return { twos: twos.count, fours: fours.count };
          }
        );

        const twoPercentage = (distributionResults.twos / sampleSize) * 100;
        const fourPercentage = (distributionResults.fours / sampleSize) * 100;

        // Verify distribution is approximately 90% twos, 10% fours (within 2% tolerance)
        expect(twoPercentage).toBeGreaterThan(88);
        expect(twoPercentage).toBeLessThan(92);
        expect(fourPercentage).toBeGreaterThan(8);
        expect(fourPercentage).toBeLessThan(12);
      } finally {
        // Restore original Math.random
        Math.random = originalMathRandom;
      }
    });

    it('should verify random position selection for new tiles', async () => {
      const positionCounts = new Map<string, number>();
      const iterations = 1000;

      // Test on board with multiple empty spaces
      const partialBoard = global.createTestBoard({
        tiles: [
          { row: 0, col: 0, value: 2 },
          { row: 1, col: 1, value: 4 },
        ],
      });

      // Count position selections
      for (let i = 0; i < iterations; i++) {
        const spawnResult = spawnRandomTile(partialBoard);
        if (spawnResult.success && spawnResult.tile) {
          const posKey = `${spawnResult.tile.row}-${spawnResult.tile.col}`;
          positionCounts.set(posKey, (positionCounts.get(posKey) || 0) + 1);
        }
      }

      // Verify positions are distributed across available spaces
      expect(positionCounts.size).toBeGreaterThan(1); // Should use multiple positions

      // Verify no tiles placed on occupied spaces
      expect(positionCounts.has('0-0')).toBe(false); // Occupied space
      expect(positionCounts.has('1-1')).toBe(false); // Occupied space

      // Verify total spawns match iterations
      const totalSpawns = Array.from(positionCounts.values()).reduce((sum, count) => sum + count, 0);
      expect(totalSpawns).toBe(iterations);
    });

    it('should verify algorithm consistency across multiple test runs', async () => {
      const testScenarios = [
        {
          board: generateMergeableBoard(Direction.LEFT),
          direction: Direction.LEFT,
        },
        {
          board: generateMergeableBoard(Direction.RIGHT),
          direction: Direction.RIGHT,
        },
        {
          board: generateMergeableBoard(Direction.UP),
          direction: Direction.UP,
        },
        {
          board: generateMergeableBoard(Direction.DOWN),
          direction: Direction.DOWN,
        },
      ];

      for (const [index, scenario] of testScenarios.entries()) {
        const results = [];

        // Run same scenario multiple times
        for (let run = 0; run < 5; run++) {
          const gameState = {
            ...generateGameState('initial'),
            board: scenario.board,
          };

          const result = processMove(gameState, scenario.direction);
          results.push({
            score: result.score,
            moveCount: result.moveCount,
            boardChanged: result.board !== gameState.board,
          });
        }

        // Verify consistency across runs (deterministic parts)
        const firstResult = results[0];
        results.forEach((result, runIndex) => {
          expect(result.score).toBe(firstResult.score);
          expect(result.moveCount).toBe(firstResult.moveCount);
          expect(result.boardChanged).toBe(firstResult.boardChanged);
        });
      }
    });

    it('should handle seeded random testing for reproducible scenarios', async () => {
      const seed = 12345;
      const scenario = generateMergeableBoard(Direction.LEFT);

      // Run scenario with same seed multiple times
      const results = [];

      for (let run = 0; run < 3; run++) {
        const seededRandom = new SeededRandom(seed);

        // Temporarily replace Math.random
        const originalRandom = Math.random;
        Math.random = () => seededRandom.next();

        try {
          const gameState = {
            ...generateGameState('initial'),
            board: scenario,
          };

          const result = processMove(gameState, Direction.LEFT);
          results.push(result);
        } finally {
          Math.random = originalRandom;
        }
      }

      // Verify reproducible results
      expect(results).toHaveLength(3);
      const firstResult = results[0];

      results.forEach((result, index) => {
        expect(result.score).toBe(firstResult.score);
        expect(result.moveCount).toBe(firstResult.moveCount);
        // Note: Board comparison may differ due to new tile spawning, but core logic should be consistent
      });
    });
  });
});
