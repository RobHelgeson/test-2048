// General utility functions

export const formatScore = (score: number): string => {
  return score.toLocaleString();
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};
