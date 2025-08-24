// Game-related type definitions

/**
 * Main game state interface containing all game data and metadata.
 * Represents the complete state of a 2048 game session including
 * board state, scoring, timing, and undo functionality.
 *
 * @example
 * ```typescript
 * const gameState: GameState = {
 *   board: [[null, null, null, null], ...],
 *   score: 1024,
 *   bestScore: 4096,
 *   gameStatus: GameStatus.PLAYING,
 *   moveCount: 42,
 *   startTime: Date.now(),
 *   lastMoveTime: Date.now(),
 *   canUndo: true,
 *   previousBoard: [[null, null, null, null], ...],
 *   previousScore: 896
 * };
 * ```
 */
export interface GameState {
  /** 4x4 game board with tiles or null for empty cells */
  board: (Tile | null)[][];
  /** Current game score */
  score: number;
  /** Highest score ever achieved */
  bestScore: number;
  /** Current state of the game (playing, won, lost) */
  gameStatus: GameStatus;
  /** Total number of moves made in current session */
  moveCount: number;
  /** Timestamp when the game session started */
  startTime: number;
  /** Timestamp of the last move made */
  lastMoveTime: number;
  /** Whether undo functionality is available */
  canUndo: boolean;
  /** Previous board state for undo functionality */
  previousBoard?: (Tile | null)[][];
  /** Previous score for undo functionality */
  previousScore?: number;
}

/**
 * Individual tile representation on the game board.
 * Contains position, value, state tracking, and animation support.
 *
 * @example
 * ```typescript
 * const tile: Tile = {
 *   id: "tile-123-456",
 *   value: 2,
 *   row: 1,
 *   col: 2,
 *   isNew: true,
 *   mergedFrom: ["tile-111", "tile-222"],
 *   previousPosition: { row: 0, col: 2 }
 * };
 * ```
 */
export interface Tile {
  /** Unique identifier for this tile instance */
  id: string;
  /** Numeric value of the tile (2, 4, 8, 16, ..., 2048, etc.) */
  value: number;
  /** Row position on the 4x4 board (0-3) */
  row: number;
  /** Column position on the 4x4 board (0-3) */
  col: number;
  /** Flag indicating if this tile was newly spawned this turn */
  isNew: boolean;
  /** Array of tile IDs that merged to create this tile */
  mergedFrom?: string[];
  /** Previous position for animation support */
  previousPosition?: {
    row: number;
    col: number;
  };
}

/**
 * Direction enum for game moves.
 * Defines the four possible movement directions in the 2048 game.
 * Used for processing user input and tile movement logic.
 *
 * @example
 * ```typescript
 * // Usage in game logic
 * const direction = Direction.UP;
 * gameEngine.makeMove(direction);
 *
 * // Switch statement usage
 * switch (direction) {
 *   case Direction.UP:
 *   case Direction.DOWN:
 *     // Handle vertical movement
 *     break;
 *   case Direction.LEFT:
 *   case Direction.RIGHT:
 *     // Handle horizontal movement
 *     break;
 * }
 * ```
 */
export enum Direction {
  /** Move tiles upward */
  UP = 'up',
  /** Move tiles downward */
  DOWN = 'down',
  /** Move tiles leftward */
  LEFT = 'left',
  /** Move tiles rightward */
  RIGHT = 'right',
}

/**
 * Game status enum representing different states of game progression.
 * Defines the three possible states a game can be in during play.
 *
 * @example
 * ```typescript
 * // Check game status
 * if (gameState.gameStatus === GameStatus.WON) {
 *   showVictoryModal();
 * } else if (gameState.gameStatus === GameStatus.LOST) {
 *   showGameOverModal();
 * }
 *
 * // State transition example
 * const newState = {
 *   ...gameState,
 *   gameStatus: GameStatus.WON
 * };
 * ```
 */
export enum GameStatus {
  /** Game is in progress, moves can be made */
  PLAYING = 'playing',
  /** Game has been won (2048 tile achieved) */
  WON = 'won',
  /** Game is over (no valid moves available) */
  LOST = 'lost',
}

export interface Move {
  direction: Direction;
  timestamp: number;
}

/**
 * Board type alias for the 4x4 game grid.
 * Represents the complete game board as a 2D array with tiles or null values.
 */
export type Board = (Tile | null)[][];

/**
 * Position interface for board coordinates.
 * Represents a specific location on the 4x4 game board.
 *
 * @example
 * ```typescript
 * const position: Position = { row: 2, col: 1 };
 * const tile = board[position.row][position.col];
 * ```
 */
export interface Position {
  /** Row coordinate (0-3) */
  row: number;
  /** Column coordinate (0-3) */
  col: number;
}

/**
 * Board size constant type for 4x4 grid dimensions.
 * Ensures consistent board sizing throughout the application.
 */
export type BoardSize = 4;

/**
 * Empty position utility type for vacant board cells.
 * Represents positions on the board that contain null values.
 */
export type EmptyPosition = Position;

/**
 * Utility type for board operations requiring position tracking.
 * Used for algorithms that need to track multiple positions simultaneously.
 */
export type PositionArray = Position[];

/**
 * Configuration interface for initial game state creation.
 * Allows customization of game initialization parameters.
 *
 * @example
 * ```typescript
 * const config: InitialGameConfig = {
 *   boardSize: 4,
 *   initialTileCount: 2,
 *   startingTileValue: 2
 * };
 * ```
 */
export interface InitialGameConfig {
  /** Size of the game board (default: 4 for 4x4) */
  boardSize?: BoardSize;
  /** Number of initial tiles to spawn (default: 2) */
  initialTileCount?: number;
  /** Value of starting tiles (default: 2) */
  startingTileValue?: number;
}

/**
 * Factory function interface for creating initial game state.
 * Defines the signature for functions that create new game instances.
 *
 * @example
 * ```typescript
 * const createInitialState: InitialGameStateFactory = (config) => {
 *   return {
 *     board: createEmptyBoard(),
 *     score: 0,
 *     bestScore: 0,
 *     gameStatus: GameStatus.PLAYING,
 *     moveCount: 0,
 *     startTime: Date.now(),
 *     lastMoveTime: Date.now(),
 *     canUndo: false
 *   };
 * };
 * ```
 */
export interface InitialGameStateFactory {
  /** Creates a new game state with optional configuration */
  (config?: InitialGameConfig): GameState;
}
