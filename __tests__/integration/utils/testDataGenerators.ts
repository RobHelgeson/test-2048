import { GameState, Direction, GameStatus, Tile, Board } from '@/types/game';
import { GameStatistics, GameResult } from '@/hooks/useScore';

/**
 * Test data generators for complex integration test scenarios
 * Provides deterministic test data creation for reproducible tests
 */

/**
 * Generate a full board configuration for edge case testing
 */
export function generateFullBoard(): Board {
  const board: Board = [];
  let tileId = 0;

  for (let row = 0; row < 4; row++) {
    const boardRow: (Tile | null)[] = [];
    for (let col = 0; col < 4; col++) {
      const value = Math.pow(2, row * 4 + col + 1); // Powers of 2 from 2 to 65536
      boardRow.push({
        id: `full-board-tile-${++tileId}`,
        value: Math.min(value, 2048), // Cap at reasonable values
        row,
        col,
        isNew: false,
      });
    }
    board.push(boardRow);
  }

  return board;
}

/**
 * Generate a nearly full board with one empty space
 */
export function generateNearlyFullBoard(emptyRow = 3, emptyCol = 3): Board {
  const board = generateFullBoard();
  board[emptyRow][emptyCol] = null;
  return board;
}

/**
 * Generate a board with specific winning condition (2048 tile)
 */
export function generateWinningBoard(): Board {
  return global.createTestBoard({
    tiles: [
      { row: 0, col: 0, value: 2048 },
      { row: 0, col: 1, value: 1024 },
      { row: 1, col: 0, value: 512 },
      { row: 1, col: 1, value: 256 },
    ],
  });
}

/**
 * Generate a board in game over state (no possible moves)
 */
export function generateGameOverBoard(): Board {
  return [
    [
      { id: 'go-1', value: 2, row: 0, col: 0, isNew: false },
      { id: 'go-2', value: 4, row: 0, col: 1, isNew: false },
      { id: 'go-3', value: 2, row: 0, col: 2, isNew: false },
      { id: 'go-4', value: 4, row: 0, col: 3, isNew: false },
    ],
    [
      { id: 'go-5', value: 4, row: 1, col: 0, isNew: false },
      { id: 'go-6', value: 2, row: 1, col: 1, isNew: false },
      { id: 'go-7', value: 4, row: 1, col: 2, isNew: false },
      { id: 'go-8', value: 2, row: 1, col: 3, isNew: false },
    ],
    [
      { id: 'go-9', value: 2, row: 2, col: 0, isNew: false },
      { id: 'go-10', value: 4, row: 2, col: 1, isNew: false },
      { id: 'go-11', value: 2, row: 2, col: 2, isNew: false },
      { id: 'go-12', value: 4, row: 2, col: 3, isNew: false },
    ],
    [
      { id: 'go-13', value: 4, row: 3, col: 0, isNew: false },
      { id: 'go-14', value: 2, row: 3, col: 1, isNew: false },
      { id: 'go-15', value: 4, row: 3, col: 2, isNew: false },
      { id: 'go-16', value: 8, row: 3, col: 3, isNew: false },
    ],
  ];
}

/**
 * Generate a board with mergeable tiles for specific direction
 */
export function generateMergeableBoard(direction: Direction): Board {
  switch (direction) {
    case Direction.LEFT:
      return global.createTestBoard({
        tiles: [
          { row: 0, col: 2, value: 2 },
          { row: 0, col: 3, value: 2 },
          { row: 1, col: 1, value: 4 },
          { row: 1, col: 3, value: 4 },
        ],
      });

    case Direction.RIGHT:
      return global.createTestBoard({
        tiles: [
          { row: 0, col: 0, value: 2 },
          { row: 0, col: 1, value: 2 },
          { row: 1, col: 0, value: 4 },
          { row: 1, col: 2, value: 4 },
        ],
      });

    case Direction.UP:
      return global.createTestBoard({
        tiles: [
          { row: 2, col: 0, value: 2 },
          { row: 3, col: 0, value: 2 },
          { row: 1, col: 1, value: 4 },
          { row: 3, col: 1, value: 4 },
        ],
      });

    case Direction.DOWN:
      return global.createTestBoard({
        tiles: [
          { row: 0, col: 0, value: 2 },
          { row: 1, col: 0, value: 2 },
          { row: 0, col: 1, value: 4 },
          { row: 2, col: 1, value: 4 },
        ],
      });

    default:
      return global.createTestBoard();
  }
}

/**
 * Generate game state for different scenarios
 */
export function generateGameState(
  scenario: 'initial' | 'mid-game' | 'winning' | 'losing'
): GameState {
  const baseState = {
    score: 0,
    bestScore: 1024,
    gameStatus: GameStatus.PLAYING,
    moveCount: 0,
    startTime: Date.now() - 300000, // Started 5 minutes ago
    lastMoveTime: Date.now() - 10000, // Last move 10 seconds ago
    canUndo: false,
  };

  switch (scenario) {
    case 'initial':
      return {
        ...baseState,
        board: global.createTestBoard({
          tiles: [
            { row: 0, col: 0, value: 2 },
            { row: 3, col: 3, value: 2 },
          ],
        }),
        startTime: Date.now(),
        lastMoveTime: Date.now(),
      };

    case 'mid-game':
      return {
        ...baseState,
        board: global.createTestBoard({
          tiles: [
            { row: 0, col: 0, value: 64 },
            { row: 0, col: 1, value: 32 },
            { row: 1, col: 0, value: 16 },
            { row: 1, col: 1, value: 8 },
            { row: 2, col: 2, value: 4 },
            { row: 3, col: 3, value: 2 },
          ],
        }),
        score: 1240,
        moveCount: 45,
        canUndo: true,
      };

    case 'winning':
      return {
        ...baseState,
        board: generateWinningBoard(),
        score: 23456,
        gameStatus: GameStatus.WON,
        moveCount: 234,
      };

    case 'losing':
      return {
        ...baseState,
        board: generateGameOverBoard(),
        score: 4532,
        gameStatus: GameStatus.LOST,
        moveCount: 167,
      };

    default:
      return {
        ...baseState,
        board: global.createTestBoard(),
      };
  }
}

/**
 * Generate mock statistics for testing
 */
export function generateMockStatistics(
  scenario: 'empty' | 'active-player' | 'experienced-player'
): GameStatistics {
  const baseStats = {
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

  switch (scenario) {
    case 'empty':
      return baseStats;

    case 'active-player':
      return {
        ...baseStats,
        totalGamesPlayed: 25,
        totalScore: 31250,
        averageScore: 1250,
        bestTileAchieved: 1024,
        totalMoves: 1125,
        totalPlayTime: 7200, // 2 hours
        winCount: 3,
        streakCount: 1,
      };

    case 'experienced-player':
      return {
        ...baseStats,
        totalGamesPlayed: 500,
        totalScore: 1250000,
        averageScore: 2500,
        bestTileAchieved: 4096,
        totalMoves: 45000,
        totalPlayTime: 180000, // 50 hours
        winCount: 75,
        streakCount: 8,
      };

    default:
      return baseStats;
  }
}

/**
 * Generate game result for statistics testing
 */
export function generateGameResult(
  scenario: 'quick-loss' | 'average-game' | 'winning-game'
): GameResult {
  const baseResult = {
    finalScore: 0,
    highestTile: 0,
    totalMoves: 0,
    playDuration: 0,
    gameStatus: GameStatus.LOST,
  };

  switch (scenario) {
    case 'quick-loss':
      return {
        ...baseResult,
        finalScore: 124,
        highestTile: 32,
        totalMoves: 18,
        playDuration: 45, // 45 seconds
      };

    case 'average-game':
      return {
        ...baseResult,
        finalScore: 2340,
        highestTile: 256,
        totalMoves: 98,
        playDuration: 420, // 7 minutes
      };

    case 'winning-game':
      return {
        ...baseResult,
        finalScore: 23456,
        highestTile: 2048,
        totalMoves: 234,
        playDuration: 1800, // 30 minutes
        gameStatus: GameStatus.WON,
      };

    default:
      return baseResult;
  }
}

/**
 * Generate seeded random number for reproducible randomness testing
 */
export class SeededRandom {
  private seed: number;

  constructor(seed = 12345) {
    this.seed = seed;
  }

  next(): number {
    // Simple linear congruential generator for testing
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }

  // Generate tile value with 90% chance of 2, 10% chance of 4
  nextTileValue(): number {
    return this.next() < 0.9 ? 2 : 4;
  }
}

/**
 * Create board scenarios for performance testing
 */
export function generatePerformanceTestBoards(): Board[] {
  return [
    global.createTestBoard(), // Empty board
    generateNearlyFullBoard(), // Nearly full board
    generateFullBoard(), // Full board
    generateMergeableBoard(Direction.LEFT), // Mergeable tiles
    generateWinningBoard(), // Winning state
    generateGameOverBoard(), // Game over state
  ];
}

/**
 * Generate complex scenarios for stress testing
 */
export function generateStressTestScenarios() {
  const scenarios: {
    name: string;
    gameState: GameState;
    moves: Direction[];
  }[] = [];

  // Rapid consecutive moves scenario
  scenarios.push({
    name: 'rapid-moves',
    gameState: generateGameState('mid-game'),
    moves: [Direction.LEFT, Direction.UP, Direction.RIGHT, Direction.DOWN],
  });

  // Multiple merge scenario
  scenarios.push({
    name: 'multiple-merges',
    gameState: {
      ...generateGameState('initial'),
      board: global.createTestBoard({
        tiles: [
          { row: 0, col: 0, value: 2 },
          { row: 0, col: 1, value: 2 },
          { row: 0, col: 2, value: 4 },
          { row: 0, col: 3, value: 4 },
        ],
      }),
    },
    moves: [Direction.LEFT],
  });

  // Edge case scenario with maximum tile values
  scenarios.push({
    name: 'max-values',
    gameState: {
      ...generateGameState('initial'),
      board: global.createTestBoard({
        tiles: [
          { row: 0, col: 0, value: 2048 },
          { row: 0, col: 1, value: 2048 },
          { row: 1, col: 0, value: 1024 },
          { row: 1, col: 1, value: 1024 },
        ],
      }),
    },
    moves: [Direction.LEFT, Direction.DOWN],
  });

  return scenarios;
}
