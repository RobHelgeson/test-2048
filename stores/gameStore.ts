import { create } from 'zustand';
import { GameState, GameStatus, Direction, Tile } from '@/types';
import { processMove, spawnRandomTile } from '@/services/gameEngine';

interface GameStore extends GameState {
  makeMove: (direction: Direction) => void;
  resetGame: () => void;
  initGame: () => void;
}

// Helper function to create initial game state with two starting tiles
function createInitialBoard() {
  const emptyBoard: (Tile | null)[][] = [
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
  ];

  // Add first tile
  const firstSpawn = spawnRandomTile(emptyBoard);
  if (firstSpawn.tile) {
    emptyBoard[firstSpawn.tile.row][firstSpawn.tile.col] = firstSpawn.tile;
  }

  // Add second tile
  const secondSpawn = spawnRandomTile(emptyBoard);
  if (secondSpawn.tile) {
    emptyBoard[secondSpawn.tile.row][secondSpawn.tile.col] = secondSpawn.tile;
  }

  return emptyBoard;
}

export const useGameStore = create<GameStore>((set, get) => ({
  board: [
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
  ],
  score: 0,
  bestScore: 0,
  gameStatus: GameStatus.PLAYING,
  moveCount: 0,
  startTime: Date.now(),
  lastMoveTime: Date.now(),
  canUndo: false,
  makeMove: (direction: Direction) => {
    const currentState = get();

    // Don't make moves if game is over or won
    if (currentState.gameStatus !== GameStatus.PLAYING) {
      return;
    }

    // Process the move using the game engine
    const newState = processMove(currentState, direction);

    // Update the store with the new state
    set(newState);
  },
  resetGame: () => {
    set({
      board: createInitialBoard(),
      score: 0,
      gameStatus: GameStatus.PLAYING,
      moveCount: 0,
      startTime: Date.now(),
      lastMoveTime: Date.now(),
      canUndo: false,
    });
  },
  initGame: () => {
    const currentState = get();
    // Only initialize if board is completely empty
    const isEmpty = currentState.board.every((row) => row.every((cell) => cell === null));
    if (isEmpty) {
      set({
        board: createInitialBoard(),
        startTime: Date.now(),
        lastMoveTime: Date.now(),
      });
    }
  },
}));
