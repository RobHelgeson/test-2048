import { create } from 'zustand';
import { GameState } from '@/types';

interface GameStore extends GameState {
  makeMove: (direction: string) => void;
  resetGame: () => void;
}

// Placeholder game store - will be implemented in future stories
export const useGameStore = create<GameStore>((set) => ({
  board: [],
  score: 0,
  gameStatus: 'playing',
  makeMove: (direction: string) => {
    // TODO: Implement in future story
    console.log('Move:', direction);
  },
  resetGame: () => {
    set({
      board: [],
      score: 0,
      gameStatus: 'playing',
    });
  },
}));
