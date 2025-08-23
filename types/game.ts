// Game-related type definitions

export interface GameState {
  board: number[][];
  score: number;
  gameStatus: 'playing' | 'won' | 'lost';
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Move {
  direction: Direction;
  timestamp: number;
}
