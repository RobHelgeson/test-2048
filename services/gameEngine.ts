import { GameState, Direction, Tile, Board, GameStatus } from '@/types';

/**
 * Result of a tile movement operation
 * Contains the new board state and metadata about the move
 */
export interface MoveResult {
  /** New board state after movement */
  board: Board;
  /** Points scored from merges in this move */
  score: number;
  /** Whether any tiles actually moved */
  moved: boolean;
  /** IDs of tiles that were merged during this move */
  mergedTiles: string[];
}

/**
 * Result of spawning a new tile
 * Contains the spawned tile or null if spawning failed
 */
export interface SpawnResult {
  /** The newly spawned tile, or null if no spawn was possible */
  tile: Tile | null;
  /** Whether spawning was successful */
  success: boolean;
}

/**
 * Board validation result for game over detection
 */
export interface GameValidation {
  /** Whether the game is over (no valid moves) */
  isGameOver: boolean;
  /** Whether the game is won (2048+ tile exists) */
  isWon: boolean;
}

/**
 * Core 2048 Game Engine
 * Implements pure functions for all game mechanics with no side effects
 * All functions are deterministic and testable
 */

// Counter for unique merge IDs to prevent collisions
let mergeIdCounter = 0;

/**
 * Validate that a board state is properly formed
 */
function validateBoard(board: Board): boolean {
  if (!Array.isArray(board) || board.length !== 4) {
    return false;
  }

  for (const row of board) {
    if (!Array.isArray(row) || row.length !== 4) {
      return false;
    }

    for (const cell of row) {
      if (
        cell !== null &&
        (!cell.value || cell.value <= 0 || !Number.isInteger(cell.value))
      ) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Process a complete move in the game
 * Combines movement, spawning, and win/lose detection
 *
 * @param state - Current game state
 * @param direction - Direction to move tiles
 * @returns New game state with updated board, score, and status
 *
 * @example
 * ```typescript
 * const newState = processMove(currentState, Direction.LEFT);
 * if (newState.gameStatus === GameStatus.WON) {
 *   showVictoryScreen();
 * }
 * ```
 */
export function processMove(state: GameState, direction: Direction): GameState {
  // Validate input board state
  if (!validateBoard(state.board)) {
    console.error('Invalid board state provided to processMove');
    return state;
  }
  // Move tiles in the specified direction
  const moveResult = makeMove(state.board, direction);

  if (!moveResult.moved) {
    // No movement occurred, return unchanged state
    return state;
  }

  // Spawn a new tile on the updated board
  const spawnResult = spawnRandomTile(moveResult.board);
  const finalBoard = spawnResult.tile
    ? placeTileOnBoard(moveResult.board, spawnResult.tile)
    : moveResult.board;

  // Calculate new score
  const newScore = state.score + moveResult.score;

  // Check win and game over conditions
  const validation = validateGameState(finalBoard);

  // Determine new game status
  let newStatus = state.gameStatus;
  if (validation.isWon && state.gameStatus === GameStatus.PLAYING) {
    newStatus = GameStatus.WON;
  } else if (validation.isGameOver) {
    newStatus = GameStatus.LOST;
  }

  return {
    ...state,
    board: finalBoard,
    score: newScore,
    bestScore: Math.max(state.bestScore, newScore),
    gameStatus: newStatus,
    moveCount: state.moveCount + 1,
    lastMoveTime: Date.now(),
    canUndo: true,
    previousBoard: state.board,
    previousScore: state.score,
  };
}

/**
 * Move all tiles in the specified direction
 * Handles sliding and merging according to 2048 rules
 *
 * @param board - Current board state
 * @param direction - Direction to move tiles
 * @returns MoveResult with new board state and move metadata
 */
export function makeMove(board: Board, direction: Direction): MoveResult {
  // Validate input board
  if (!validateBoard(board)) {
    console.error('Invalid board state provided to makeMove');
    return {
      board,
      score: 0,
      moved: false,
      mergedTiles: [],
    };
  }
  switch (direction) {
    case Direction.LEFT:
      return moveLeft(board);
    case Direction.RIGHT:
      return moveRight(board);
    case Direction.UP:
      return moveUp(board);
    case Direction.DOWN:
      return moveDown(board);
    default:
      return {
        board,
        score: 0,
        moved: false,
        mergedTiles: [],
      };
  }
}

/**
 * Move tiles left - tiles slide toward column 0
 */
function moveLeft(board: Board): MoveResult {
  const newBoard: Board = [];
  let totalScore = 0;
  let moved = false;
  const mergedTiles: string[] = [];

  for (let row = 0; row < 4; row++) {
    const { newRow, score, rowMoved, mergedIds } = processRow(board[row]);
    newBoard.push(newRow);
    totalScore += score;
    if (rowMoved) moved = true;
    mergedTiles.push(...mergedIds);
  }

  return {
    board: newBoard,
    score: totalScore,
    moved,
    mergedTiles,
  };
}

/**
 * Move tiles right - tiles slide toward column 3
 */
function moveRight(board: Board): MoveResult {
  const newBoard: Board = [];
  let totalScore = 0;
  let moved = false;
  const mergedTiles: string[] = [];

  for (let row = 0; row < 4; row++) {
    // Reverse the row, process it, then reverse again
    const reversedRow = [...board[row]].reverse();
    const { newRow, score, rowMoved, mergedIds } = processRow(reversedRow);

    // Reverse back and update column positions correctly
    const finalRow = [...newRow]
      .reverse()
      .map((tile, col) => (tile ? { ...tile, col, row } : tile));

    newBoard.push(finalRow);
    totalScore += score;
    if (rowMoved) moved = true;
    mergedTiles.push(...mergedIds);
  }

  return {
    board: newBoard,
    score: totalScore,
    moved,
    mergedTiles,
  };
}

/**
 * Move tiles up - tiles slide toward row 0
 */
function moveUp(board: Board): MoveResult {
  // Transpose board, move left, then transpose back
  const transposed = transposeBoard(board);
  const result = moveLeft(transposed);

  return {
    ...result,
    board: transposeBoard(result.board),
  };
}

/**
 * Move tiles down - tiles slide toward row 3
 */
function moveDown(board: Board): MoveResult {
  // Transpose board, move right, then transpose back
  const transposed = transposeBoard(board);
  const result = moveRight(transposed);

  return {
    ...result,
    board: transposeBoard(result.board),
  };
}

/**
 * Process a single row for left movement
 * Handles sliding and merging
 */
function processRow(row: (Tile | null)[]): {
  newRow: (Tile | null)[];
  score: number;
  rowMoved: boolean;
  mergedIds: string[];
} {
  // Filter out null values to get only tiles
  const tiles = row.filter((tile) => tile !== null) as Tile[];

  if (tiles.length === 0) {
    return {
      newRow: [null, null, null, null],
      score: 0,
      rowMoved: false,
      mergedIds: [],
    };
  }

  const merged: (Tile | null)[] = [];
  let score = 0;
  const mergedIds: string[] = [];
  let i = 0;

  // Process tiles with merging logic
  while (i < tiles.length) {
    if (i < tiles.length - 1 && tiles[i].value === tiles[i + 1].value) {
      // Merge two tiles
      const mergedValue = tiles[i].value * 2;
      const mergedTile: Tile = {
        id: `merged-${++mergeIdCounter}-${Date.now()}`,
        value: mergedValue,
        row: tiles[i].row,
        col: merged.length,
        isNew: false,
        mergedFrom: [tiles[i].id, tiles[i + 1].id],
        previousPosition: { row: tiles[i].row, col: tiles[i].col },
      };

      merged.push(mergedTile);
      score += mergedValue;
      mergedIds.push(tiles[i].id, tiles[i + 1].id);
      i += 2; // Skip both merged tiles
    } else {
      // Move tile without merging
      const movedTile: Tile = {
        ...tiles[i],
        col: merged.length,
        previousPosition: { row: tiles[i].row, col: tiles[i].col },
      };
      merged.push(movedTile);
      i++;
    }
  }

  // Fill remaining positions with null
  while (merged.length < 4) {
    merged.push(null);
  }

  // Check if any tiles actually moved
  const rowMoved = !tilesEqual(row, merged);

  return {
    newRow: merged,
    score,
    rowMoved,
    mergedIds,
  };
}

/**
 * Transpose a 4x4 board (swap rows and columns)
 */
function transposeBoard(board: Board): Board {
  const transposed: Board = [
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
  ];

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const tile = board[row][col];
      if (tile) {
        transposed[col][row] = {
          ...tile,
          row: col,
          col: row,
        };
      }
    }
  }

  return transposed;
}

/**
 * Check if two tile arrays are equal (for movement detection)
 */
function tilesEqual(row1: (Tile | null)[], row2: (Tile | null)[]): boolean {
  if (row1.length !== row2.length) return false;

  for (let i = 0; i < row1.length; i++) {
    const tile1 = row1[i];
    const tile2 = row2[i];

    if (tile1 === null && tile2 === null) continue;
    if (tile1 === null || tile2 === null) return false;
    if (tile1.value !== tile2.value || tile1.col !== tile2.col) return false;
  }

  return true;
}

/**
 * Spawn a new tile with 90% chance of value 2, 10% chance of value 4
 *
 * @param board - Current board state
 * @returns SpawnResult with new tile or null if board is full
 */
export function spawnRandomTile(board: Board): SpawnResult {
  // Find all empty positions
  const emptyPositions: { row: number; col: number }[] = [];

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (board[row][col] === null) {
        emptyPositions.push({ row, col });
      }
    }
  }

  // Return null if board is full
  if (emptyPositions.length === 0) {
    return {
      tile: null,
      success: false,
    };
  }

  // Select random empty position
  const randomIndex = Math.floor(Math.random() * emptyPositions.length);
  const position = emptyPositions[randomIndex];

  // Determine tile value: 90% chance of 2, 10% chance of 4
  const value = Math.random() < 0.9 ? 2 : 4;

  // Create new tile with unique ID
  const newTile: Tile = {
    id: `tile-${position.row}-${position.col}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    value,
    row: position.row,
    col: position.col,
    isNew: true,
  };

  return {
    tile: newTile,
    success: true,
  };
}

/**
 * Check if the game is won (2048+ tile exists) or over (no valid moves)
 *
 * @param board - Current board state
 * @returns GameValidation with win and game over status
 */
export function validateGameState(board: Board): GameValidation {
  const isWon = checkWinCondition(board);
  const isGameOver = checkGameOver(board);

  return {
    isGameOver,
    isWon,
  };
}

/**
 * Check if the game is won (2048+ tile exists)
 *
 * @param board - Current board state
 * @returns True if any tile has value 2048 or higher
 */
export function checkWinCondition(board: Board): boolean {
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const tile = board[row][col];
      if (tile && tile.value >= 2048) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Check if the game is over (no valid moves available)
 *
 * @param board - Current board state
 * @returns True if no moves are possible
 */
export function checkGameOver(board: Board): boolean {
  // Check for empty cells
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (board[row][col] === null) {
        return false; // Empty cell means moves are still possible
      }
    }
  }

  // Check for possible merges horizontally
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      const current = board[row][col];
      const next = board[row][col + 1];
      if (current && next && current.value === next.value) {
        return false; // Merge is possible
      }
    }
  }

  // Check for possible merges vertically
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 3; row++) {
      const current = board[row][col];
      const next = board[row + 1][col];
      if (current && next && current.value === next.value) {
        return false; // Merge is possible
      }
    }
  }

  // No empty cells and no possible merges
  return true;
}

/**
 * Place a tile on the board at its specified position
 *
 * @param board - Current board state
 * @param tile - Tile to place
 * @returns New board with tile placed
 */
function placeTileOnBoard(board: Board, tile: Tile): Board {
  const newBoard = board.map((row) => [...row]);
  newBoard[tile.row][tile.col] = tile;
  return newBoard;
}
