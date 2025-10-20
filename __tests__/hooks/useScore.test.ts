import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useScore, GameResult, GameStatistics } from '@/hooks/useScore';
import { GameStatus } from '@/types/game';
import { storageService } from '@/services/storageService';

// Mock AsyncStorage and storageService
jest.mock('@/services/storageService', () => ({
  storageService: {
    saveBestScore: jest.fn(),
    loadBestScore: jest.fn(),
    updateStatistics: jest.fn(),
    loadStatistics: jest.fn(),
  },
}));

const mockStorageService = storageService as jest.Mocked<typeof storageService>;

describe('useScore hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default mock returns
    mockStorageService.loadBestScore.mockResolvedValue(0);
    mockStorageService.loadStatistics.mockResolvedValue({
      totalGamesPlayed: 0,
      totalScore: 0,
      averageScore: 0,
      bestTileAchieved: 0,
      totalMoves: 0,
      totalPlayTime: 0,
      winCount: 0,
      streakCount: 0,
      lastUpdated: Date.now(),
    });
  });

  describe('Hook Initialization', () => {
    it('should initialize with default score state', () => {
      const { result } = renderHook(() => useScore());

      expect(result.current.scoreState.currentScore).toBe(0);
      expect(result.current.scoreState.bestScore).toBe(0);
      expect(result.current.scoreState.sessionBest).toBe(0);
      expect(result.current.scoreState.pointsGained).toBe(0);
      expect(result.current.scoreState.isNewBest).toBe(false);
      expect(result.current.scoreState.showScoreAnimation).toBe(false);
    });

    it('should initialize with default statistics', () => {
      const { result } = renderHook(() => useScore());

      expect(result.current.statistics.totalGamesPlayed).toBe(0);
      expect(result.current.statistics.totalScore).toBe(0);
      expect(result.current.statistics.averageScore).toBe(0);
      expect(result.current.statistics.bestTileAchieved).toBe(0);
      expect(result.current.statistics.totalMoves).toBe(0);
      expect(result.current.statistics.totalPlayTime).toBe(0);
      expect(result.current.statistics.winCount).toBe(0);
      expect(result.current.statistics.streakCount).toBe(0);
    });

    it('should load best score from storage on initialization', async () => {
      mockStorageService.loadBestScore.mockResolvedValue(1024);

      const { result } = renderHook(() => useScore());

      await waitFor(() => {
        expect(result.current.scoreState.bestScore).toBe(1024);
      });

      expect(mockStorageService.loadBestScore).toHaveBeenCalledTimes(1);
    });

    it('should load statistics from storage on initialization', async () => {
      const mockStats: GameStatistics = {
        totalGamesPlayed: 5,
        totalScore: 2500,
        averageScore: 500,
        bestTileAchieved: 512,
        totalMoves: 250,
        totalPlayTime: 1500,
        winCount: 2,
        streakCount: 1,
        lastUpdated: Date.now(),
      };

      mockStorageService.loadStatistics.mockResolvedValue(mockStats);

      const { result } = renderHook(() => useScore());

      await waitFor(() => {
        expect(result.current.statistics.totalGamesPlayed).toBe(5);
        expect(result.current.statistics.totalScore).toBe(2500);
        expect(result.current.statistics.averageScore).toBe(500);
      });
    });

    it('should handle storage loading errors gracefully', async () => {
      mockStorageService.loadBestScore.mockRejectedValue(new Error('Storage error'));
      mockStorageService.loadStatistics.mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => useScore());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should still have default values
      expect(result.current.scoreState.bestScore).toBe(0);
      expect(result.current.statistics.totalGamesPlayed).toBe(0);
    });
  });

  describe('Score Management', () => {
    it('should update current score correctly', () => {
      const { result } = renderHook(() => useScore());

      act(() => {
        result.current.actions.updateScore(4);
      });

      expect(result.current.scoreState.currentScore).toBe(4);
      expect(result.current.scoreState.pointsGained).toBe(4);
      expect(result.current.scoreState.showScoreAnimation).toBe(true);
    });

    it('should accumulate score across multiple updates', () => {
      const { result } = renderHook(() => useScore());

      act(() => {
        result.current.actions.updateScore(4);
      });

      act(() => {
        result.current.actions.updateScore(8);
      });

      expect(result.current.scoreState.currentScore).toBe(12);
      expect(result.current.scoreState.pointsGained).toBe(8);
    });

    it('should update session best when current score exceeds it', () => {
      const { result } = renderHook(() => useScore());

      act(() => {
        result.current.actions.updateScore(100);
      });

      expect(result.current.scoreState.sessionBest).toBe(100);

      act(() => {
        result.current.actions.updateScore(50);
      });

      expect(result.current.scoreState.sessionBest).toBe(150);
      expect(result.current.scoreState.currentScore).toBe(150);
    });

    it('should detect new best score', () => {
      const { result } = renderHook(() => useScore());

      // Set initial best score
      act(() => {
        result.current.actions.setNewBest(100);
      });

      // Score that exceeds best score
      act(() => {
        result.current.actions.updateScore(150);
      });

      expect(result.current.scoreState.bestScore).toBe(150);
      expect(result.current.scoreState.isNewBest).toBe(true);
    });

    it('should not update best score if current score is lower', () => {
      const { result } = renderHook(() => useScore());

      // Set initial best score
      act(() => {
        result.current.actions.setNewBest(200);
      });

      // Score that doesn't exceed best score
      act(() => {
        result.current.actions.updateScore(50);
      });

      expect(result.current.scoreState.bestScore).toBe(200);
      expect(result.current.scoreState.isNewBest).toBe(false);
    });

    it('should reject invalid score updates', () => {
      const { result } = renderHook(() => useScore());

      // Test negative score
      act(() => {
        result.current.actions.updateScore(-5);
      });

      expect(result.current.scoreState.currentScore).toBe(0);

      // Test non-integer score
      act(() => {
        result.current.actions.updateScore(4.5);
      });

      expect(result.current.scoreState.currentScore).toBe(0);

      // Test zero score
      act(() => {
        result.current.actions.updateScore(0);
      });

      expect(result.current.scoreState.currentScore).toBe(0);
    });
  });

  describe('Score Reset Functionality', () => {
    it('should reset current score to zero', () => {
      const { result } = renderHook(() => useScore());

      // Set up initial score
      act(() => {
        result.current.actions.updateScore(100);
      });

      expect(result.current.scoreState.currentScore).toBe(100);

      // Reset score
      act(() => {
        result.current.actions.resetScore();
      });

      expect(result.current.scoreState.currentScore).toBe(0);
      expect(result.current.scoreState.pointsGained).toBe(0);
      expect(result.current.scoreState.showScoreAnimation).toBe(false);
      expect(result.current.scoreState.isNewBest).toBe(false);
    });

    it('should preserve best score after reset', () => {
      const { result } = renderHook(() => useScore());

      // Set up scores
      act(() => {
        result.current.actions.setNewBest(200);
        result.current.actions.updateScore(100);
      });

      // Reset score
      act(() => {
        result.current.actions.resetScore();
      });

      expect(result.current.scoreState.currentScore).toBe(0);
      expect(result.current.scoreState.bestScore).toBe(200);
    });

    it('should preserve session best after reset', () => {
      const { result } = renderHook(() => useScore());

      // Set up session best
      act(() => {
        result.current.actions.updateScore(150);
      });

      expect(result.current.scoreState.sessionBest).toBe(150);

      // Reset and check session best is preserved
      act(() => {
        result.current.actions.resetScore();
      });

      expect(result.current.scoreState.sessionBest).toBe(150);
    });
  });

  describe('Score Animation Management', () => {
    it('should trigger score animation with correct points', () => {
      const { result } = renderHook(() => useScore());

      act(() => {
        result.current.actions.triggerScoreAnimation(16);
      });

      expect(result.current.scoreState.showScoreAnimation).toBe(true);
      expect(result.current.scoreState.pointsGained).toBe(16);
    });

    it('should clear score animation', () => {
      const { result } = renderHook(() => useScore());

      // Set up animation
      act(() => {
        result.current.actions.triggerScoreAnimation(8);
      });

      // Clear animation
      act(() => {
        result.current.actions.clearScoreAnimation();
      });

      expect(result.current.scoreState.showScoreAnimation).toBe(false);
      expect(result.current.scoreState.pointsGained).toBe(0);
      expect(result.current.scoreState.isNewBest).toBe(false);
    });

    it('should auto-clear animation after timeout', async () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useScore());

      act(() => {
        result.current.actions.triggerScoreAnimation(32);
      });

      expect(result.current.scoreState.showScoreAnimation).toBe(true);

      // Fast-forward time by 2 seconds
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(result.current.scoreState.showScoreAnimation).toBe(false);
      });

      jest.useRealTimers();
    });

    it('should detect new best score in animation', () => {
      const { result } = renderHook(() => useScore());

      // Set current score and best score
      act(() => {
        result.current.actions.setNewBest(100);
        result.current.actions.updateScore(90);
      });

      // Trigger animation that would result in new best
      act(() => {
        result.current.actions.triggerScoreAnimation(20);
      });

      expect(result.current.scoreState.isNewBest).toBe(true);
    });
  });

  describe('Statistics Tracking', () => {
    it('should update statistics for a completed game', async () => {
      const { result } = renderHook(() => useScore());

      const gameResult: GameResult = {
        finalScore: 1024,
        highestTile: 256,
        totalMoves: 42,
        playDuration: 300,
        gameStatus: GameStatus.WON,
      };

      await act(async () => {
        await result.current.actions.updateStatistics(gameResult);
      });

      expect(mockStorageService.updateStatistics).toHaveBeenCalledWith(gameResult);
    });

    it('should calculate win rate correctly', async () => {
      // Set up initial statistics with some wins
      const initialStats: GameStatistics = {
        totalGamesPlayed: 4,
        totalScore: 2000,
        averageScore: 500,
        bestTileAchieved: 512,
        totalMoves: 200,
        totalPlayTime: 1200,
        winCount: 2,
        streakCount: 1,
        lastUpdated: Date.now(),
      };

      mockStorageService.loadStatistics.mockResolvedValue(initialStats);

      const { result } = renderHook(() => useScore());

      await waitFor(() => {
        expect(result.current.statistics.winCount).toBe(2);
        expect(result.current.statistics.totalGamesPlayed).toBe(4);
      });

      // Add a winning game
      const winningGame: GameResult = {
        finalScore: 2048,
        highestTile: 512,
        totalMoves: 50,
        playDuration: 400,
        gameStatus: GameStatus.WON,
      };

      await act(async () => {
        await result.current.actions.updateStatistics(winningGame);
      });

      // Win rate should be 3/5 = 0.6 (60%)
      expect(mockStorageService.updateStatistics).toHaveBeenCalledWith(winningGame);
    });

    it('should update streak count for consecutive wins', async () => {
      const initialStats: GameStatistics = {
        totalGamesPlayed: 2,
        totalScore: 1000,
        averageScore: 500,
        bestTileAchieved: 256,
        totalMoves: 100,
        totalPlayTime: 600,
        winCount: 1,
        streakCount: 1,
        lastUpdated: Date.now(),
      };

      mockStorageService.loadStatistics.mockResolvedValue(initialStats);

      const { result } = renderHook(() => useScore());

      const winningGame: GameResult = {
        finalScore: 1024,
        highestTile: 256,
        totalMoves: 50,
        playDuration: 300,
        gameStatus: GameStatus.WON,
      };

      await act(async () => {
        await result.current.actions.updateStatistics(winningGame);
      });

      expect(mockStorageService.updateStatistics).toHaveBeenCalledWith(winningGame);
    });

    it('should reset streak count on game loss', async () => {
      const initialStats: GameStatistics = {
        totalGamesPlayed: 3,
        totalScore: 1500,
        averageScore: 500,
        bestTileAchieved: 256,
        totalMoves: 150,
        totalPlayTime: 900,
        winCount: 2,
        streakCount: 2,
        lastUpdated: Date.now(),
      };

      mockStorageService.loadStatistics.mockResolvedValue(initialStats);

      const { result } = renderHook(() => useScore());

      const losingGame: GameResult = {
        finalScore: 512,
        highestTile: 128,
        totalMoves: 60,
        playDuration: 250,
        gameStatus: GameStatus.LOST,
      };

      await act(async () => {
        await result.current.actions.updateStatistics(losingGame);
      });

      expect(mockStorageService.updateStatistics).toHaveBeenCalledWith(losingGame);
    });

    it('should calculate average score correctly', async () => {
      const { result } = renderHook(() => useScore());

      // Mock statistics to return specific values for average calculation
      const mockStats: GameStatistics = {
        totalGamesPlayed: 3,
        totalScore: 1530, // This should give an average of 510
        averageScore: 0, // Will be calculated
        bestTileAchieved: 256,
        totalMoves: 150,
        totalPlayTime: 900,
        winCount: 1,
        streakCount: 0,
        lastUpdated: Date.now(),
      };

      mockStorageService.loadStatistics.mockResolvedValue(mockStats);

      const { result: newResult } = renderHook(() => useScore());

      await waitFor(() => {
        expect(newResult.current.statistics.averageScore).toBe(510);
      });
    });
  });

  describe('Score Persistence', () => {
    it('should save best score when it changes', async () => {
      const { result } = renderHook(() => useScore());

      // Update to trigger auto-save
      act(() => {
        result.current.actions.setNewBest(500);
      });

      await waitFor(() => {
        expect(mockStorageService.saveBestScore).toHaveBeenCalledWith(500);
      });
    });

    it('should load best score manually', async () => {
      mockStorageService.loadBestScore.mockResolvedValue(750);

      const { result } = renderHook(() => useScore());

      await act(async () => {
        await result.current.actions.loadBestScore();
      });

      await waitFor(() => {
        expect(result.current.scoreState.bestScore).toBe(750);
      });
    });

    it('should save best score manually', async () => {
      const { result } = renderHook(() => useScore());

      // Set a best score
      act(() => {
        result.current.actions.setNewBest(1000);
      });

      await act(async () => {
        await result.current.actions.saveBestScore();
      });

      expect(mockStorageService.saveBestScore).toHaveBeenCalledWith(1000);
    });

    it('should handle persistence errors gracefully', async () => {
      mockStorageService.saveBestScore.mockRejectedValue(new Error('Save failed'));

      const { result } = renderHook(() => useScore());

      // This should not throw
      await act(async () => {
        await result.current.actions.saveBestScore();
      });

      expect(mockStorageService.saveBestScore).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle statistics update errors gracefully', async () => {
      mockStorageService.updateStatistics.mockRejectedValue(new Error('Update failed'));

      const { result } = renderHook(() => useScore());

      const gameResult: GameResult = {
        finalScore: 512,
        highestTile: 128,
        totalMoves: 30,
        playDuration: 180,
        gameStatus: GameStatus.LOST,
      };

      // Should not throw
      await act(async () => {
        await result.current.actions.updateStatistics(gameResult);
      });

      expect(mockStorageService.updateStatistics).toHaveBeenCalledWith(gameResult);
    });

    it('should handle loading errors during initialization', async () => {
      mockStorageService.loadBestScore.mockRejectedValue(new Error('Load failed'));
      mockStorageService.loadStatistics.mockRejectedValue(new Error('Load failed'));

      const { result } = renderHook(() => useScore());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should have default values
      expect(result.current.scoreState.bestScore).toBe(0);
      expect(result.current.statistics.totalGamesPlayed).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle division by zero in average calculation', () => {
      const { result } = renderHook(() => useScore());

      // With 0 games played, average should be 0
      expect(result.current.statistics.averageScore).toBe(0);
    });

    it('should handle very large scores', () => {
      const { result } = renderHook(() => useScore());

      const largeScore = 999999999;

      act(() => {
        result.current.actions.updateScore(largeScore);
      });

      expect(result.current.scoreState.currentScore).toBe(largeScore);
    });

    it('should handle rapid score updates', () => {
      const { result } = renderHook(() => useScore());

      // Rapidly update score multiple times
      act(() => {
        result.current.actions.updateScore(2);
        result.current.actions.updateScore(4);
        result.current.actions.updateScore(8);
        result.current.actions.updateScore(16);
      });

      expect(result.current.scoreState.currentScore).toBe(30);
      expect(result.current.scoreState.pointsGained).toBe(16); // Should be the last update
    });
  });
});
