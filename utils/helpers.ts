// General utility functions

export const formatScore = (score: number): string => {
  if (score < 1000) return score.toLocaleString();
  if (score < 1000000) return `${(score / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${(score / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};
