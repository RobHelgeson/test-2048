import { create } from 'zustand';
import { GameState, GameStatus, Direction } from '@/types';

interface GameStore extends GameState {
  makeMove: (direction: Direction) => void;
  resetGame: () => void;
}

// Placeholder game store - will be implemented in future stories
export const useGameStore = create<GameStore>((set) => ({
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
    // TODO: Implement in future story
    console.log('Move:', direction);
  },
  resetGame: () => {
    set({
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
    });
  },
}));
