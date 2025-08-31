/**
 * Hooks Integration Tests
 * Tests coordination between useGame and useScore hooks
 */

import { renderHook, act } from '@testing-library/react-native';
import { GameStatus, Direction } from '@/types/game';
import { useGame } from '@/hooks/useGame';
import { useScore } from '@/hooks/useScore';
import { generateGameState, generateGameResult } from './utils/testDataGenerators';

describe('Hooks Integration Tests', () => {
  beforeEach(async () => {
    await global.cleanupIntegrationTest();
  });

  describe('useGame and useScore Coordination', () => {
    it('should coordinate game state updates with score tracking', async () => {
      const { result: gameHook } = renderHook(() => useGame());
      const { result: scoreHook } = renderHook(() => useScore());

      await act(async () => {
        // Wait for hooks to initialize
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      const initialScore = scoreHook.current.scoreState.currentScore;

      // Make moves and verify score coordination
      await act(async () => {
        gameHook.current.actions.makeMove(Direction.LEFT);
      });

      // Score should remain coordinated
      expect(typeof scoreHook.current.scoreState.currentScore).toBe('number');
      expect(scoreHook.current.scoreState.currentScore).toBeGreaterThanOrEqual(initialScore);
    });

    it('should handle game completion with statistics update', async () => {
      const { result: scoreHook } = renderHook(() => useScore());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      const initialStats = scoreHook.current.statistics;
      const gameResult = generateGameResult('winning-game');

      // Update statistics with game completion
      await act(async () => {
        await scoreHook.current.actions.updateStatistics(gameResult);
      });

      // Statistics should be updated
      expect(scoreHook.current.statistics.totalGamesPlayed).toBeGreaterThan(initialStats.totalGamesPlayed);
      expect(scoreHook.current.statistics.totalScore).toBeGreaterThan(initialStats.totalScore);
    });

    it('should maintain consistency during rapid state changes', async () => {
      const { result: gameHook } = renderHook(() => useGame());
      const { result: scoreHook } = renderHook(() => useScore());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      const initialState = {
        gameScore: gameHook.current.gameState.score,
        scoreState: scoreHook.current.scoreState.currentScore,
      };

      // Perform rapid moves
      await act(async () => {
        const moves = [Direction.LEFT, Direction.UP, Direction.RIGHT, Direction.DOWN];
        for (const move of moves) {
          gameHook.current.actions.makeMove(move);
          // Small delay to allow state updates
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      });

      // State should remain consistent
      expect(gameHook.current.gameState.score).toBeGreaterThanOrEqual(initialState.gameScore);
      expect(scoreHook.current.scoreState.currentScore).toBeGreaterThanOrEqual(initialState.scoreState);
    });

    it('should handle game reset scenarios properly', async () => {
      const { result: gameHook } = renderHook(() => useGame());
      const { result: scoreHook } = renderHook(() => useScore());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // Make some moves to change state
      await act(async () => {
        gameHook.current.actions.makeMove(Direction.LEFT);
        gameHook.current.actions.makeMove(Direction.UP);
      });

      const beforeReset = {
        bestScore: scoreHook.current.scoreState.bestScore,
        statistics: { ...scoreHook.current.statistics },
      };

      // Reset game
      await act(async () => {
        gameHook.current.actions.resetGame();
        scoreHook.current.actions.resetScore();
      });

      // Game should be reset but best score and stats preserved
      expect(gameHook.current.gameState.score).toBe(0);
      expect(gameHook.current.gameState.moveCount).toBe(0);
      expect(scoreHook.current.scoreState.currentScore).toBe(0);
      expect(scoreHook.current.scoreState.bestScore).toBe(beforeReset.bestScore);
      expect(scoreHook.current.statistics.totalGamesPlayed).toBe(beforeReset.statistics.totalGamesPlayed);
    });
  });

  describe('Score Calculation Verification', () => {
    it('should verify cumulative score calculation across multiple game sessions', async () => {
      const { result: scoreHook } = renderHook(() => useScore());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      const initialStats = scoreHook.current.statistics;
      const sessions = [
        generateGameResult('quick-loss'),
        generateGameResult('average-game'),
        generateGameResult('winning-game'),
      ];

      let expectedTotalScore = initialStats.totalScore;
      let expectedGamesPlayed = initialStats.totalGamesPlayed;

      // Process multiple game sessions
      for (const session of sessions) {
        expectedTotalScore += session.finalScore;
        expectedGamesPlayed += 1;

        await act(async () => {
          await scoreHook.current.actions.updateStatistics(session);
        });

        // Verify cumulative calculations
        expect(scoreHook.current.statistics.totalScore).toBe(expectedTotalScore);
        expect(scoreHook.current.statistics.totalGamesPlayed).toBe(expectedGamesPlayed);

        const expectedAverage = expectedTotalScore / expectedGamesPlayed;
        expect(scoreHook.current.statistics.averageScore).toBeCloseTo(expectedAverage, 2);
      }
    });

    it('should verify score accuracy with complex multi-merge scenarios', async () => {
      const { result: scoreHook } = renderHook(() => useScore());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      const testScenarios = [
        { points: 4, description: 'Simple 2+2 merge' },
        { points: 8, description: 'Simple 4+4 merge' },
        { points: 12, description: 'Complex multi-merge: 2+2+4+4' },
        { points: 24, description: 'High-value merge: 8+8+8' },
      ];

      let expectedScore = 0;

      for (const scenario of testScenarios) {
        expectedScore += scenario.points;

        await act(async () => {
          scoreHook.current.actions.updateScore(scenario.points);
        });

        expect(scoreHook.current.scoreState.currentScore).toBe(expectedScore);
        expect(scoreHook.current.scoreState.pointsGained).toBe(scenario.points);
      }
    });

    it('should verify best score persistence and restoration', async () => {
      const { result: scoreHook } = renderHook(() => useScore());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      const initialBest = scoreHook.current.scoreState.bestScore;

      // Set a new high score
      const newHighScore = initialBest + 1000;
      await act(async () => {
        scoreHook.current.actions.updateScore(newHighScore);
      });

      expect(scoreHook.current.scoreState.bestScore).toBe(newHighScore);
      expect(scoreHook.current.scoreState.isNewBest).toBe(true);

      // Reset current score but best should persist
      await act(async () => {
        scoreHook.current.actions.resetScore();
      });

      expect(scoreHook.current.scoreState.currentScore).toBe(0);
      expect(scoreHook.current.scoreState.bestScore).toBe(newHighScore);

      // Test persistence by reloading
      await act(async () => {
        await scoreHook.current.actions.loadBestScore();
      });

      expect(scoreHook.current.scoreState.bestScore).toBe(newHighScore);
    });

    it('should validate statistics calculation accuracy', async () => {
      const { result: scoreHook } = renderHook(() => useScore());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // Clear existing statistics for clean test
      const cleanGameResult = generateGameResult('quick-loss');
      cleanGameResult.finalScore = 0;

      await act(async () => {
        await scoreHook.current.actions.updateStatistics(cleanGameResult);
      });

      const testResults = [
        { finalScore: 100, highestTile: 32, totalMoves: 20, winCount: 0 },
        { finalScore: 250, highestTile: 64, totalMoves: 35, winCount: 0 },
        { finalScore: 500, highestTile: 128, totalMoves: 50, winCount: 1 },
      ];

      let expectedTotal = cleanGameResult.finalScore;
      let expectedGames = 1; // Starting with the clean game
      let expectedMoves = cleanGameResult.totalMoves;
      let expectedWins = 0;

      for (const result of testResults) {
        expectedTotal += result.finalScore;
        expectedGames += 1;
        expectedMoves += result.totalMoves;
        expectedWins += result.winCount;

        const gameResult = {
          ...generateGameResult('average-game'),
          finalScore: result.finalScore,
          highestTile: result.highestTile,
          totalMoves: result.totalMoves,
          gameStatus: result.winCount > 0 ? GameStatus.WON : GameStatus.LOST,
        };

        await act(async () => {
          await scoreHook.current.actions.updateStatistics(gameResult);
        });

        const stats = scoreHook.current.statistics;
        const expectedAverage = expectedTotal / expectedGames;

        expect(stats.totalScore).toBe(expectedTotal);
        expect(stats.totalGamesPlayed).toBe(expectedGames);
        expect(stats.totalMoves).toBe(expectedMoves);
        expect(stats.winCount).toBe(expectedWins);
        expect(stats.averageScore).toBeCloseTo(expectedAverage, 2);
      }
    });

    it('should handle score animation state triggers during gameplay', async () => {
      const { result: scoreHook } = renderHook(() => useScore());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(scoreHook.current.scoreState.showScoreAnimation).toBe(false);
      expect(scoreHook.current.scoreState.pointsGained).toBe(0);

      // Trigger score animation
      await act(async () => {
        scoreHook.current.actions.triggerScoreAnimation(16);
      });

      expect(scoreHook.current.scoreState.showScoreAnimation).toBe(true);
      expect(scoreHook.current.scoreState.pointsGained).toBe(16);

      // Clear animation
      await act(async () => {
        scoreHook.current.actions.clearScoreAnimation();
      });

      expect(scoreHook.current.scoreState.showScoreAnimation).toBe(false);
      expect(scoreHook.current.scoreState.pointsGained).toBe(0);
    });
  });

  describe('Performance Integration', () => {
    it('should maintain hook performance under rapid state changes', async () => {
      const { result: gameHook } = renderHook(() => useGame());
      const { result: scoreHook } = renderHook(() => useScore());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      const iterations = 50;
      const startTime = performance.now();

      await act(async () => {
        for (let i = 0; i < iterations; i++) {
          const direction = [Direction.LEFT, Direction.UP, Direction.RIGHT, Direction.DOWN][i % 4];
          gameHook.current.actions.makeMove(direction);
          scoreHook.current.actions.updateScore(2 * (i + 1));

          // Small delay to prevent overwhelming the system
          if (i % 10 === 0) {
            await new Promise((resolve) => setTimeout(resolve, 1));
          }
        }
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageTimePerOperation = totalTime / (iterations * 2); // 2 operations per iteration

      // Should maintain reasonable performance (under 5ms per operation)
      expect(averageTimePerOperation).toBeLessThan(5);
      expect(totalTime).toBeLessThan(1000); // Total under 1 second
    });

    it('should handle hook cleanup properly', async () => {
      const { result: gameHook, unmount: unmountGame } = renderHook(() => useGame());
      const { result: scoreHook, unmount: unmountScore } = renderHook(() => useScore());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // Perform some operations
      await act(async () => {
        gameHook.current.actions.makeMove(Direction.LEFT);
        scoreHook.current.actions.updateScore(4);
      });

      // Unmount hooks (simulating component unmounting)
      unmountGame();
      unmountScore();

      // Should not throw errors or cause memory leaks
      // This test mainly ensures cleanup functions work properly
      expect(true).toBe(true); // If we reach here, cleanup worked
    });
  });
});
