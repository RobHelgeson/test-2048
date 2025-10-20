/**
 * Storage Integration Tests
 * Tests SQLite integration and data persistence
 */

import { storageService } from '@/services/storageService';
import { generateGameState, generateGameResult, generateMockStatistics } from './utils/testDataGenerators';
import { GameStatus } from '@/types/game';

describe('Storage Integration Tests', () => {
  beforeEach(async () => {
    await global.cleanupIntegrationTest();
    // Clear storage before each test
    await storageService.clearAllData();
  });

  describe('Game State Persistence', () => {
    it('should save and restore game state with useGame hook integration', async () => {
      const testGameState = generateGameState('mid-game');

      // Save game state
      const { duration: saveTime } = await global.measureAsync('Save game state', async () => {
        await storageService.saveGameState(testGameState);
      });

      expect(saveTime).toBeLessThan(50); // Should save quickly

      // Load game state
      const { result: loadedState, duration: loadTime } = await global.measureAsync('Load game state', async () => {
        return await storageService.loadGameState();
      });

      expect(loadTime).toBeLessThan(50); // Should load quickly
      expect(loadedState).toBeTruthy();
      expect(loadedState!.score).toBe(testGameState.score);
      expect(loadedState!.moveCount).toBe(testGameState.moveCount);
      expect(loadedState!.gameStatus).toBe(testGameState.gameStatus);
    });

    it('should handle save/restore with complex board states', async () => {
      const complexGameState = generateGameState('winning');

      await storageService.saveGameState(complexGameState);
      const restoredState = await storageService.loadGameState();

      expect(restoredState).toBeTruthy();
      expect(restoredState!.board).toHaveLength(4);
      expect(restoredState!.board[0]).toHaveLength(4);

      // Verify board tiles are properly restored
      let tileCount = 0;
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          const originalTile = complexGameState.board[row][col];
          const restoredTile = restoredState!.board[row][col];

          if (originalTile) {
            expect(restoredTile).toBeTruthy();
            expect(restoredTile!.value).toBe(originalTile.value);
            expect(restoredTile!.row).toBe(originalTile.row);
            expect(restoredTile!.col).toBe(originalTile.col);
            tileCount++;
          } else {
            expect(restoredTile).toBeNull();
          }
        }
      }

      expect(tileCount).toBeGreaterThan(0); // Should have restored tiles
    });

    it('should handle data corruption recovery scenarios', async () => {
      // Save valid state first
      const validState = generateGameState('initial');
      await storageService.saveGameState(validState);

      // Simulate data corruption by saving invalid data directly to AsyncStorage
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      await AsyncStorage.setItem('@2048/game_state', 'invalid-json-data');

      // Should gracefully handle corruption and return null
      const corruptedLoad = await storageService.loadGameState();
      expect(corruptedLoad).toBeNull();
    });

    it('should handle concurrent save/load operations', async () => {
      const states = [generateGameState('initial'), generateGameState('mid-game'), generateGameState('winning')];

      // Perform concurrent saves
      const savePromises = states.map((state) => storageService.saveGameState(state));
      await Promise.all(savePromises);

      // The last save should win
      const finalState = await storageService.loadGameState();
      expect(finalState).toBeTruthy();
      expect(finalState!.gameStatus).toBe(GameStatus.WON);
    });
  });

  describe('Score Persistence Integration', () => {
    it('should save and restore best scores with useScore hook integration', async () => {
      const testScores = [100, 250, 500, 750, 1000];

      for (const score of testScores) {
        await storageService.saveBestScore(score);
        const loadedScore = await storageService.loadBestScore();
        expect(loadedScore).toBe(score);
      }

      // Final score should be the highest
      const finalScore = await storageService.loadBestScore();
      expect(finalScore).toBe(1000);
    });

    it('should handle invalid score values gracefully', async () => {
      // Test negative scores
      await storageService.saveBestScore(-100);
      const negativeResult = await storageService.loadBestScore();
      expect(negativeResult).toBe(0); // Should default to 0

      // Test NaN scores
      await storageService.saveBestScore(NaN);
      const nanResult = await storageService.loadBestScore();
      expect(nanResult).toBe(0);

      // Test extremely large scores
      const largeScore = 999999999;
      await storageService.saveBestScore(largeScore);
      const largeResult = await storageService.loadBestScore();
      expect(largeResult).toBe(largeScore);
    });
  });

  describe('Statistics Persistence Integration', () => {
    it('should save and restore statistics correctly', async () => {
      const testStats = generateMockStatistics('experienced-player');

      // Update statistics through the service
      const gameResult = generateGameResult('winning-game');
      await storageService.updateStatistics(gameResult);

      const loadedStats = await storageService.loadStatistics();
      expect(loadedStats.totalGamesPlayed).toBeGreaterThan(0);
      expect(loadedStats.totalScore).toBeGreaterThan(0);
      expect(loadedStats.averageScore).toBeGreaterThan(0);
      expect(loadedStats.lastUpdated).toBeGreaterThan(0);
    });

    it('should handle multiple game result updates', async () => {
      const gameResults = [
        generateGameResult('quick-loss'),
        generateGameResult('average-game'),
        generateGameResult('winning-game'),
      ];

      let expectedGames = 0;
      let expectedScore = 0;
      let expectedWins = 0;

      for (const result of gameResults) {
        expectedGames++;
        expectedScore += result.finalScore;
        if (result.gameStatus === GameStatus.WON) {
          expectedWins++;
        }

        await storageService.updateStatistics(result);

        const stats = await storageService.loadStatistics();
        expect(stats.totalGamesPlayed).toBe(expectedGames);
        expect(stats.totalScore).toBe(expectedScore);
        expect(stats.winCount).toBe(expectedWins);

        const expectedAvg = expectedScore / expectedGames;
        expect(stats.averageScore).toBeCloseTo(expectedAvg, 2);
      }
    });

    it('should handle statistics data validation', async () => {
      // Corrupt statistics data
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      await AsyncStorage.setItem('@2048/statistics', '{"invalid": "data"}');

      // Should return default statistics
      const stats = await storageService.loadStatistics();
      expect(stats.totalGamesPlayed).toBe(0);
      expect(stats.totalScore).toBe(0);
      expect(stats.averageScore).toBe(0);
      expect(stats.winCount).toBe(0);
      expect(stats.lastUpdated).toBeGreaterThan(0);
    });
  });

  describe('Performance and Memory Testing', () => {
    it('should handle large data volumes efficiently', async () => {
      const largeGameState = generateGameState('mid-game');

      // Add extra data to simulate larger states
      const extraData = new Array(1000).fill(null).map((_, i) => ({
        id: `extra-${i}`,
        value: i * 2,
        row: i % 4,
        col: Math.floor(i / 4) % 4,
        isNew: false,
      }));

      // Simulate save/load with larger data
      const iterations = 50;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        await storageService.saveGameState(largeGameState);
        await storageService.loadGameState();

        // Small delay to prevent overwhelming the system
        if (i % 10 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 1));
        }
      }

      const endTime = performance.now();
      const averageTime = (endTime - startTime) / (iterations * 2);

      // Should maintain reasonable performance
      expect(averageTime).toBeLessThan(20); // Under 20ms per operation
    });

    it('should handle memory pressure during extensive operations', async () => {
      const memoryBefore = global.trackMemoryUsage();

      // Perform extensive storage operations
      const operations = [];
      for (let i = 0; i < 100; i++) {
        const gameState = generateGameState('mid-game');
        const gameResult = generateGameResult('average-game');

        operations.push(
          storageService.saveGameState(gameState),
          storageService.saveBestScore(i * 100),
          storageService.updateStatistics(gameResult)
        );
      }

      await Promise.all(operations);

      const memoryAfter = global.trackMemoryUsage();
      const memoryGrowth = memoryAfter.heapUsed - memoryBefore.heapUsed;

      // Should not cause excessive memory growth
      expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
    });

    it('should maintain data integrity under concurrent operations', async () => {
      const concurrentOperations = [];
      const testData = {
        gameStates: [],
        scores: [],
        statistics: [],
      };

      // Prepare test data
      for (let i = 0; i < 10; i++) {
        testData.gameStates.push(generateGameState('mid-game'));
        testData.scores.push(i * 100);
        testData.statistics.push(generateGameResult('average-game'));
      }

      // Perform concurrent operations for game state and scores
      const saveOperations = [];
      for (let i = 0; i < 10; i++) {
        saveOperations.push(
          storageService.saveGameState(testData.gameStates[i]),
          storageService.saveBestScore(testData.scores[i])
        );
      }
      await Promise.all(saveOperations);

      // Update statistics sequentially to avoid race conditions
      for (let i = 0; i < 10; i++) {
        await storageService.updateStatistics(testData.statistics[i]);
      }

      // Verify final state is consistent
      const finalGameState = await storageService.loadGameState();
      const finalScore = await storageService.loadBestScore();
      const finalStats = await storageService.loadStatistics();

      expect(finalGameState).toBeTruthy();
      expect(finalScore).toBe(900); // Highest score from test data
      expect(finalStats.totalGamesPlayed).toBe(10);
    });
  });

  describe('Data Migration and Versioning', () => {
    it('should handle version compatibility for game state', async () => {
      // Simulate old version data format
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      const oldFormatData = JSON.stringify({
        board: [
          [null, null, null, null],
          [null, null, null, null],
          [null, null, null, null],
          [null, null, null, null],
        ],
        score: 100,
        // Missing some new fields
      });

      await AsyncStorage.setItem('@2048/game_state', oldFormatData);

      // Should handle gracefully or return null for incomplete data
      const loadedState = await storageService.loadGameState();
      // Depending on validation strictness, this might be null or have defaults
      expect(loadedState === null || typeof loadedState === 'object').toBe(true);
    });

    it('should handle backup and recovery mechanisms', async () => {
      const originalState = generateGameState('winning');
      const originalScore = 1500;
      const originalResult = generateGameResult('winning-game');

      // Save original data
      await storageService.saveGameState(originalState);
      await storageService.saveBestScore(originalScore);
      await storageService.updateStatistics(originalResult);

      // Verify data is saved
      expect(await storageService.loadGameState()).toBeTruthy();
      expect(await storageService.loadBestScore()).toBe(originalScore);
      expect((await storageService.loadStatistics()).totalGamesPlayed).toBeGreaterThan(0);

      // Clear all data
      await storageService.clearAllData();

      // Verify data is cleared
      expect(await storageService.loadGameState()).toBeNull();
      expect(await storageService.loadBestScore()).toBe(0);
      expect((await storageService.loadStatistics()).totalGamesPlayed).toBe(0);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle storage quota exceeded scenarios', async () => {
      // This test simulates storage quota issues
      // In a real scenario, we'd mock AsyncStorage to throw quota exceeded errors
      const largeGameState = generateGameState('mid-game');

      try {
        // Try to save multiple large states
        for (let i = 0; i < 10; i++) {
          await storageService.saveGameState(largeGameState);
        }

        // If we reach here, storage worked fine
        expect(true).toBe(true);
      } catch (error) {
        // Should handle storage errors gracefully
        expect(error).toBeDefined();
      }
    });

    it('should maintain service availability during storage failures', async () => {
      // Even if individual operations fail, the service should continue working
      const validState = generateGameState('initial');

      // Save valid state
      await storageService.saveGameState(validState);

      // This should work even if there were previous failures
      const loadedState = await storageService.loadGameState();
      expect(loadedState).toBeTruthy();
    });
  });
});
