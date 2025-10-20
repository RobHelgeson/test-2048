import { storageService } from '@/services/storageService';
import { GameStatus } from '@/types/game';
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';

/**
 * Score state interface for current scoring information and animations
 */
export interface ScoreState {
  /** Current score in the active game session */
  currentScore: number;
  /** Highest score ever achieved across all sessions */
  bestScore: number;
  /** Highest score achieved in current app session */
  sessionBest: number;
  /** Points gained in the last move for animation display */
  pointsGained: number;
  /** Flag indicating if current score is a new best score */
  isNewBest: boolean;
  /** Flag to trigger score gain animation */
  showScoreAnimation: boolean;
}

/**
 * Game statistics for analytics and learning tracking
 */
export interface GameStatistics {
  /** Total number of games played across all sessions */
  totalGamesPlayed: number;
  /** Cumulative score across all games ever played */
  totalScore: number;
  /** Calculated average score per game */
  averageScore: number;
  /** Highest tile value ever achieved */
  bestTileAchieved: number;
  /** Total number of moves made across all games */
  totalMoves: number;
  /** Total play time in seconds across all sessions */
  totalPlayTime: number;
  /** Number of games won (reaching 2048 or higher) */
  winCount: number;
  /** Current winning streak count */
  streakCount: number;
  /** Timestamp of last statistics update */
  lastUpdated: number;
}

/**
 * Game result interface for statistics tracking
 */
export interface GameResult {
  /** Final score when game ended */
  finalScore: number;
  /** Highest tile achieved in this game */
  highestTile: number;
  /** Total moves made in this game */
  totalMoves: number;
  /** Duration of this game session in seconds */
  playDuration: number;
  /** Final game status (won/lost) */
  gameStatus: GameStatus;
}

/**
 * Score action types for useReducer
 */
interface ScoreAction {
  type:
    | 'UPDATE_SCORE'
    | 'RESET_SCORE'
    | 'SET_NEW_BEST'
    | 'TRIGGER_SCORE_ANIMATION'
    | 'CLEAR_ANIMATION'
    | 'LOAD_BEST_SCORE'
    | 'UPDATE_SESSION_BEST';
  payload?: {
    points?: number;
    score?: number;
    isNewBest?: boolean;
  };
}

/**
 * Actions interface for score management
 */
export interface ScoreActions {
  /** Update current score by adding points */
  updateScore: (points: number) => void;
  /** Reset current score to zero for new game */
  resetScore: () => void;
  /** Set new best score */
  setNewBest: (score: number) => void;
  /** Trigger score animation with points gained */
  triggerScoreAnimation: (points: number) => void;
  /** Clear score animation flags */
  clearScoreAnimation: () => void;
  /** Load best score from persistent storage */
  loadBestScore: () => Promise<void>;
  /** Save current best score to persistent storage */
  saveBestScore: () => Promise<void>;
  /** Update statistics with completed game data */
  updateStatistics: (gameResult: GameResult) => Promise<void>;
}

/**
 * Return type for useScore hook
 */
export interface UseScoreReturn {
  /** Current score state and animation flags */
  scoreState: ScoreState;
  /** Score management actions */
  actions: ScoreActions;
  /** Game statistics for analytics */
  statistics: GameStatistics;
  /** Loading state for async operations */
  isLoading: boolean;
}

/**
 * Initial score state
 */
const initialScoreState: ScoreState = {
  currentScore: 0,
  bestScore: 0,
  sessionBest: 0,
  pointsGained: 0,
  isNewBest: false,
  showScoreAnimation: false,
};

/**
 * Initial statistics state
 */
const initialStatistics: GameStatistics = {
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

/**
 * Score reducer function for managing score state transitions
 */
function scoreReducer(state: ScoreState, action: ScoreAction): ScoreState {
  switch (action.type) {
    case 'UPDATE_SCORE': {
      if (!action.payload?.points || action.payload.points <= 0) {
        return state;
      }

      const newScore = state.currentScore + action.payload.points;
      const isNewSessionBest = newScore > state.sessionBest;
      const isNewAllTimeBest = newScore > state.bestScore;

      return {
        ...state,
        currentScore: newScore,
        pointsGained: action.payload.points,
        sessionBest: isNewSessionBest ? newScore : state.sessionBest,
        bestScore: isNewAllTimeBest ? newScore : state.bestScore,
        isNewBest: isNewAllTimeBest,
        showScoreAnimation: true,
      };
    }

    case 'RESET_SCORE': {
      return {
        ...initialScoreState,
        bestScore: state.bestScore, // Preserve best score
        sessionBest: state.sessionBest, // Preserve session best
      };
    }

    case 'SET_NEW_BEST': {
      if (!action.payload?.score) {
        return state;
      }

      return {
        ...state,
        bestScore: action.payload.score,
        isNewBest: action.payload.score > state.bestScore,
      };
    }

    case 'TRIGGER_SCORE_ANIMATION': {
      if (!action.payload?.points) {
        return state;
      }

      return {
        ...state,
        pointsGained: action.payload.points,
        showScoreAnimation: true,
        isNewBest: action.payload.isNewBest || false,
      };
    }

    case 'CLEAR_ANIMATION': {
      return {
        ...state,
        showScoreAnimation: false,
        pointsGained: 0,
        isNewBest: false,
      };
    }

    case 'LOAD_BEST_SCORE': {
      if (!action.payload?.score) {
        return state;
      }

      return {
        ...state,
        bestScore: action.payload.score,
      };
    }

    case 'UPDATE_SESSION_BEST': {
      if (!action.payload?.score) {
        return state;
      }

      const newBest = Math.max(state.sessionBest, action.payload.score);
      return {
        ...state,
        sessionBest: newBest,
      };
    }

    default:
      return state;
  }
}

/**
 * Custom hook for managing 2048 score state and statistics
 * Provides score tracking, best score persistence, and game analytics
 *
 * @returns UseScoreReturn object with score state, actions, and statistics
 *
 * @example
 * ```typescript
 * const { scoreState, actions, statistics, isLoading } = useScore();
 *
 * // Update score after tile merge
 * actions.updateScore(4); // Add 4 points
 *
 * // Reset for new game
 * actions.resetScore();
 *
 * // Update statistics after game completion
 * const gameResult = {
 *   finalScore: 1024,
 *   highestTile: 256,
 *   totalMoves: 42,
 *   playDuration: 300,
 *   gameStatus: GameStatus.WON
 * };
 * await actions.updateStatistics(gameResult);
 * ```
 */
export function useScore(): UseScoreReturn {
  // Main score state managed by useReducer
  const [scoreState, dispatch] = useReducer(scoreReducer, initialScoreState);

  // Local state for async operations and statistics
  const [isLoading, setIsLoading] = useState(false);
  const [statistics, setStatistics] = useState<GameStatistics>(initialStatistics);

  // Load persisted data on hook initialization
  useEffect(() => {
    const loadPersistedData = async () => {
      setIsLoading(true);
      try {
        // Load best score from storage
        const bestScore = await storageService.loadBestScore();
        if (bestScore > 0) {
          dispatch({
            type: 'LOAD_BEST_SCORE',
            payload: { score: bestScore },
          });
        }

        // Load statistics from storage
        const loadedStats = await storageService.loadStatistics();
        if (loadedStats) {
          setStatistics(loadedStats);
        }
      } catch (error) {
        console.error('Failed to load persisted score data:', error);
        // Continue with default values if loading fails
      } finally {
        setIsLoading(false);
      }
    };

    loadPersistedData();
  }, []);

  // Calculate average score when statistics change
  const calculatedStatistics = useMemo(() => {
    const averageScore = statistics.totalGamesPlayed > 0 ? statistics.totalScore / statistics.totalGamesPlayed : 0;

    return {
      ...statistics,
      averageScore: Math.round(averageScore * 100) / 100, // Round to 2 decimal places
    };
  }, [statistics]);

  // Action creators with useCallback for performance
  const updateScore = useCallback((points: number) => {
    if (points <= 0 || !Number.isInteger(points)) {
      console.warn('Invalid score points:', points);
      return;
    }

    dispatch({
      type: 'UPDATE_SCORE',
      payload: { points },
    });
  }, []);

  const resetScore = useCallback(() => {
    dispatch({ type: 'RESET_SCORE' });
  }, []);

  const setNewBest = useCallback((score: number) => {
    if (score <= 0) {
      return;
    }

    dispatch({
      type: 'SET_NEW_BEST',
      payload: { score },
    });
  }, []);

  const triggerScoreAnimation = useCallback(
    (points: number) => {
      if (points <= 0) {
        return;
      }

      const isNewBest = scoreState.currentScore + points > scoreState.bestScore;

      dispatch({
        type: 'TRIGGER_SCORE_ANIMATION',
        payload: { points, isNewBest },
      });

      // Auto-clear animation after 2 seconds
      setTimeout(() => {
        dispatch({ type: 'CLEAR_ANIMATION' });
      }, 2000);
    },
    [scoreState.currentScore, scoreState.bestScore]
  );

  const clearScoreAnimation = useCallback(() => {
    dispatch({ type: 'CLEAR_ANIMATION' });
  }, []);

  const loadBestScore = useCallback(async () => {
    try {
      setIsLoading(true);
      const bestScore = await storageService.loadBestScore();
      if (bestScore > 0) {
        dispatch({
          type: 'LOAD_BEST_SCORE',
          payload: { score: bestScore },
        });
      }
    } catch (error) {
      console.error('Failed to load best score:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveBestScore = useCallback(async () => {
    try {
      await storageService.saveBestScore(scoreState.bestScore);
    } catch (error) {
      console.error('Failed to save best score:', error);
      // Continue gracefully even if persistence fails
    }
  }, [scoreState.bestScore]);

  const updateStatistics = useCallback(
    async (gameResult: GameResult) => {
      try {
        setIsLoading(true);

        const isWin = gameResult.gameStatus === GameStatus.WON;
        const newStreakCount = isWin ? statistics.streakCount + 1 : 0;

        const updatedStats: GameStatistics = {
          ...statistics,
          totalGamesPlayed: statistics.totalGamesPlayed + 1,
          totalScore: statistics.totalScore + gameResult.finalScore,
          bestTileAchieved: Math.max(statistics.bestTileAchieved, gameResult.highestTile),
          totalMoves: statistics.totalMoves + gameResult.totalMoves,
          totalPlayTime: statistics.totalPlayTime + gameResult.playDuration,
          winCount: statistics.winCount + (isWin ? 1 : 0),
          streakCount: newStreakCount,
          lastUpdated: Date.now(),
        };

        // Calculate average score
        updatedStats.averageScore = updatedStats.totalScore / updatedStats.totalGamesPlayed;

        setStatistics(updatedStats);

        // Persist updated statistics
        await storageService.updateStatistics(gameResult);
      } catch (error) {
        console.error('Failed to update statistics:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [statistics]
  );

  // Auto-save best score when it changes
  useEffect(() => {
    if (scoreState.bestScore > 0 && !isLoading) {
      saveBestScore();
    }
  }, [scoreState.bestScore, saveBestScore, isLoading]);

  return {
    scoreState,
    actions: {
      updateScore,
      resetScore,
      setNewBest,
      triggerScoreAnimation,
      clearScoreAnimation,
      loadBestScore,
      saveBestScore,
      updateStatistics,
    },
    statistics: calculatedStatistics,
    isLoading,
  };
}
