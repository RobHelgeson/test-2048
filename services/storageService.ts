import { GameState } from '@/types';
import { GameStatistics, GameResult } from '@/hooks/useScore';
import { ThemeType } from '@/types/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

// User preferences interface for theme and settings persistence
export interface UserPreferences {
  theme: ThemeType;
  hapticsEnabled: boolean;
  tutorialCompleted: boolean;
  userName?: string;
  soundEnabled: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  lastPlayedDate: number;
  totalGamesPlayed: number;
}

// Storage keys for AsyncStorage persistence
const STORAGE_KEYS = {
  GAME_STATE: '@2048/game_state',
  BEST_SCORE: '@2048/best_score',
  STATISTICS: '@2048/statistics',
  USER_PREFERENCES: '@2048/user_preferences',
} as const;

/**
 * Storage service for game data persistence
 * Uses AsyncStorage for score persistence (SQLite will be implemented in future stories)
 * Provides graceful fallbacks for storage failures
 */
class StorageService {
  /**
   * Save current game state to persistent storage
   */
  async saveGameState(state: GameState): Promise<void> {
    try {
      const serializedState = JSON.stringify(state);
      await AsyncStorage.setItem(STORAGE_KEYS.GAME_STATE, serializedState);
    } catch (error) {
      console.error('Failed to save game state:', error);
      // Gracefully handle storage failures without breaking gameplay
    }
  }

  /**
   * Load saved game state from persistent storage
   */
  async loadGameState(): Promise<GameState | null> {
    try {
      const serializedState = await AsyncStorage.getItem(
        STORAGE_KEYS.GAME_STATE
      );
      if (serializedState) {
        const gameState = JSON.parse(serializedState) as GameState;
        return this.validateGameState(gameState) ? gameState : null;
      }
      return null;
    } catch (error) {
      console.error('Failed to load game state:', error);
      return null;
    }
  }

  /**
   * Clear saved game state from persistent storage
   */
  async clearGameState(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.GAME_STATE);
    } catch (error) {
      console.error('Failed to clear game state:', error);
    }
  }

  /**
   * Save best score to persistent storage
   */
  async saveBestScore(score: number): Promise<void> {
    try {
      if (score < 0 || !Number.isInteger(score)) {
        throw new Error('Invalid score value');
      }
      await AsyncStorage.setItem(STORAGE_KEYS.BEST_SCORE, score.toString());
    } catch (error) {
      console.error('Failed to save best score:', error);
    }
  }

  /**
   * Load best score from persistent storage
   */
  async loadBestScore(): Promise<number> {
    try {
      const scoreString = await AsyncStorage.getItem(STORAGE_KEYS.BEST_SCORE);
      if (scoreString) {
        const score = parseInt(scoreString, 10);
        return isNaN(score) || score < 0 ? 0 : score;
      }
      return 0;
    } catch (error) {
      console.error('Failed to load best score:', error);
      return 0;
    }
  }

  /**
   * Update game statistics with completed game results
   */
  async updateStatistics(gameResult: GameResult): Promise<void> {
    try {
      // Load existing statistics
      const currentStats = await this.loadStatistics();

      const isWin = gameResult.gameStatus === 'won';
      const newStreakCount = isWin ? currentStats.streakCount + 1 : 0;

      // Calculate updated statistics
      const updatedStats: GameStatistics = {
        ...currentStats,
        totalGamesPlayed: currentStats.totalGamesPlayed + 1,
        totalScore: currentStats.totalScore + gameResult.finalScore,
        bestTileAchieved: Math.max(
          currentStats.bestTileAchieved,
          gameResult.highestTile
        ),
        totalMoves: currentStats.totalMoves + gameResult.totalMoves,
        totalPlayTime: currentStats.totalPlayTime + gameResult.playDuration,
        winCount: currentStats.winCount + (isWin ? 1 : 0),
        streakCount: newStreakCount,
        lastUpdated: Date.now(),
      };

      // Calculate average score
      updatedStats.averageScore =
        updatedStats.totalScore / updatedStats.totalGamesPlayed;

      // Save updated statistics
      await this.saveStatistics(updatedStats);
    } catch (error) {
      console.error('Failed to update statistics:', error);
    }
  }

  /**
   * Load game statistics from persistent storage
   */
  async loadStatistics(): Promise<GameStatistics> {
    try {
      const serializedStats = await AsyncStorage.getItem(
        STORAGE_KEYS.STATISTICS
      );
      if (serializedStats) {
        const stats = JSON.parse(serializedStats) as GameStatistics;
        return this.validateStatistics(stats)
          ? stats
          : this.createDefaultStatistics();
      }
      return this.createDefaultStatistics();
    } catch (error) {
      console.error('Failed to load statistics:', error);
      return this.createDefaultStatistics();
    }
  }

  /**
   * Save game statistics to persistent storage
   */
  private async saveStatistics(statistics: GameStatistics): Promise<void> {
    try {
      const serializedStats = JSON.stringify(statistics);
      await AsyncStorage.setItem(STORAGE_KEYS.STATISTICS, serializedStats);
    } catch (error) {
      console.error('Failed to save statistics:', error);
    }
  }

  /**
   * Create default statistics object
   */
  private createDefaultStatistics(): GameStatistics {
    return {
      totalGamesPlayed: 0,
      totalScore: 0,
      averageScore: 0,
      bestTileAchieved: 0,
      totalMoves: 0,
      totalPlayTime: 0,
      winCount: 0,
      streakCount: 0,
      lastUpdated: Date.now(),
    };
  }

  /**
   * Validate game state structure
   */
  private validateGameState(state: unknown): state is GameState {
    if (!state || typeof state !== 'object') return false;

    const s = state as any;
    return (
      Array.isArray(s.board) &&
      s.board.length === 4 &&
      typeof s.score === 'number' &&
      s.score >= 0 &&
      typeof s.bestScore === 'number' &&
      s.bestScore >= 0 &&
      ['playing', 'won', 'lost'].includes(s.gameStatus) &&
      typeof s.moveCount === 'number' &&
      s.moveCount >= 0
    );
  }

  /**
   * Validate statistics structure
   */
  private validateStatistics(stats: unknown): stats is GameStatistics {
    if (!stats || typeof stats !== 'object') return false;

    const s = stats as any;
    return (
      typeof s.totalGamesPlayed === 'number' &&
      s.totalGamesPlayed >= 0 &&
      typeof s.totalScore === 'number' &&
      s.totalScore >= 0 &&
      typeof s.averageScore === 'number' &&
      s.averageScore >= 0 &&
      typeof s.bestTileAchieved === 'number' &&
      s.bestTileAchieved >= 0 &&
      typeof s.totalMoves === 'number' &&
      s.totalMoves >= 0 &&
      typeof s.totalPlayTime === 'number' &&
      s.totalPlayTime >= 0 &&
      typeof s.winCount === 'number' &&
      s.winCount >= 0 &&
      typeof s.streakCount === 'number' &&
      s.streakCount >= 0 &&
      typeof s.lastUpdated === 'number' &&
      s.lastUpdated > 0
    );
  }

  /**
   * Save user preferences (including theme) to persistent storage
   */
  async saveUserPreferences(
    preferences: Partial<UserPreferences>
  ): Promise<void> {
    try {
      // Load existing preferences and merge with new ones
      const currentPrefs = await this.loadUserPreferences();
      const updatedPrefs: UserPreferences = {
        ...currentPrefs,
        ...preferences,
        lastPlayedDate: Date.now(), // Always update last played date
      };

      const serializedPrefs = JSON.stringify(updatedPrefs);
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PREFERENCES,
        serializedPrefs
      );
    } catch (error) {
      console.error('Failed to save user preferences:', error);
      throw error; // Re-throw for theme store error handling
    }
  }

  /**
   * Load user preferences from persistent storage
   */
  async loadUserPreferences(): Promise<UserPreferences> {
    try {
      const serializedPrefs = await AsyncStorage.getItem(
        STORAGE_KEYS.USER_PREFERENCES
      );
      if (serializedPrefs) {
        const prefs = JSON.parse(serializedPrefs) as UserPreferences;
        return this.validateUserPreferences(prefs)
          ? prefs
          : this.createDefaultUserPreferences();
      }
      return this.createDefaultUserPreferences();
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      return this.createDefaultUserPreferences();
    }
  }

  /**
   * Get specific user preference value
   */
  async getUserPreference<K extends keyof UserPreferences>(
    key: K
  ): Promise<UserPreferences[K]> {
    try {
      const preferences = await this.loadUserPreferences();
      return preferences[key];
    } catch (error) {
      console.error(`Failed to get user preference ${key}:`, error);
      const defaultPrefs = this.createDefaultUserPreferences();
      return defaultPrefs[key];
    }
  }

  /**
   * Update specific user preference
   */
  async setUserPreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ): Promise<void> {
    try {
      await this.saveUserPreferences({
        [key]: value,
      } as Partial<UserPreferences>);
    } catch (error) {
      console.error(`Failed to set user preference ${key}:`, error);
      throw error;
    }
  }

  /**
   * Create default user preferences
   */
  private createDefaultUserPreferences(): UserPreferences {
    return {
      theme: 'classic',
      hapticsEnabled: true,
      tutorialCompleted: false,
      soundEnabled: true,
      animationSpeed: 'normal',
      lastPlayedDate: Date.now(),
      totalGamesPlayed: 0,
    };
  }

  /**
   * Validate user preferences structure
   */
  private validateUserPreferences(prefs: unknown): prefs is UserPreferences {
    if (!prefs || typeof prefs !== 'object') return false;

    const p = prefs as any;
    return (
      ['classic', 'cool'].includes(p.theme) &&
      typeof p.hapticsEnabled === 'boolean' &&
      typeof p.tutorialCompleted === 'boolean' &&
      typeof p.soundEnabled === 'boolean' &&
      ['slow', 'normal', 'fast'].includes(p.animationSpeed) &&
      typeof p.lastPlayedDate === 'number' &&
      p.lastPlayedDate > 0 &&
      typeof p.totalGamesPlayed === 'number' &&
      p.totalGamesPlayed >= 0 &&
      (p.userName === undefined || typeof p.userName === 'string')
    );
  }

  /**
   * Clear all stored data (for testing or reset purposes)
   */
  async clearAllData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.GAME_STATE),
        AsyncStorage.removeItem(STORAGE_KEYS.BEST_SCORE),
        AsyncStorage.removeItem(STORAGE_KEYS.STATISTICS),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES),
      ]);
    } catch (error) {
      console.error('Failed to clear all data:', error);
    }
  }
}

export const storageService = new StorageService();
