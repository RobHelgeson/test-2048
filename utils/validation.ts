import { GameState } from '@/types';

// Validation utility functions

export const validateGameState = (state: unknown): state is GameState => {
  if (!state || typeof state !== 'object') return false;

  const s = state as any;
  return (
    Array.isArray(s.board) &&
    typeof s.score === 'number' &&
    s.score >= 0 &&
    ['playing', 'won', 'lost'].includes(s.gameStatus)
  );
};

export const sanitizeUserName = (name: string): string => {
  return name
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .substring(0, 50); // Limit length
};
