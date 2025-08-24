import {
  calculateScore,
  calculateScoreFromValues,
} from '@/services/gameEngine';
import { Tile } from '@/types/game';

describe('GameEngine Score Calculations', () => {
  describe('calculateScore', () => {
    it('should return 0 for empty merged tiles array', () => {
      const tiles: Tile[] = [
        { id: 'tile-1', value: 2, row: 0, col: 0, isNew: false },
        { id: 'tile-2', value: 4, row: 0, col: 1, isNew: false },
      ];

      const score = calculateScore([], tiles);
      expect(score).toBe(0);
    });

    it('should return 0 for empty tiles array', () => {
      const mergedIds = ['tile-1', 'tile-2'];
      const score = calculateScore(mergedIds, []);
      expect(score).toBe(0);
    });

    it('should calculate score for merged tiles correctly', () => {
      const tiles: Tile[] = [
        { id: 'tile-1', value: 2, row: 0, col: 0, isNew: false },
        { id: 'tile-2', value: 2, row: 0, col: 1, isNew: false },
        { id: 'tile-3', value: 4, row: 0, col: 2, isNew: false },
        { id: 'tile-4', value: 8, row: 1, col: 0, isNew: false },
      ];

      const mergedIds = ['tile-1', 'tile-2']; // Two tiles with value 2 each
      const score = calculateScore(mergedIds, tiles);
      expect(score).toBe(4); // 2 + 2 = 4
    });

    it('should calculate score for multiple different merged tiles', () => {
      const tiles: Tile[] = [
        { id: 'tile-1', value: 4, row: 0, col: 0, isNew: false },
        { id: 'tile-2', value: 4, row: 0, col: 1, isNew: false },
        { id: 'tile-3', value: 8, row: 0, col: 2, isNew: false },
        { id: 'tile-4', value: 8, row: 1, col: 0, isNew: false },
      ];

      const mergedIds = ['tile-1', 'tile-2', 'tile-3', 'tile-4']; // 4+4+8+8
      const score = calculateScore(mergedIds, tiles);
      expect(score).toBe(24); // 4 + 4 + 8 + 8 = 24
    });

    it('should handle missing tile IDs gracefully', () => {
      const tiles: Tile[] = [
        { id: 'tile-1', value: 2, row: 0, col: 0, isNew: false },
        { id: 'tile-2', value: 4, row: 0, col: 1, isNew: false },
      ];

      const mergedIds = ['tile-1', 'tile-nonexistent', 'tile-2'];
      const score = calculateScore(mergedIds, tiles);
      expect(score).toBe(6); // 2 + 0 + 4 = 6 (missing tile contributes 0)
    });

    it('should handle complex merge scenario with high-value tiles', () => {
      const tiles: Tile[] = [
        { id: 'tile-1', value: 64, row: 0, col: 0, isNew: false },
        { id: 'tile-2', value: 64, row: 0, col: 1, isNew: false },
        { id: 'tile-3', value: 128, row: 0, col: 2, isNew: false },
        { id: 'tile-4', value: 128, row: 1, col: 0, isNew: false },
      ];

      const mergedIds = ['tile-1', 'tile-2', 'tile-3', 'tile-4'];
      const score = calculateScore(mergedIds, tiles);
      expect(score).toBe(384); // 64 + 64 + 128 + 128 = 384
    });

    it('should work with tile objects containing additional properties', () => {
      const tiles: Tile[] = [
        {
          id: 'tile-1',
          value: 8,
          row: 0,
          col: 0,
          isNew: false,
          mergedFrom: ['tile-a', 'tile-b'],
          previousPosition: { row: 1, col: 0 },
        },
        {
          id: 'tile-2',
          value: 8,
          row: 0,
          col: 1,
          isNew: true,
          previousPosition: { row: 0, col: 2 },
        },
      ];

      const mergedIds = ['tile-1', 'tile-2'];
      const score = calculateScore(mergedIds, tiles);
      expect(score).toBe(16); // 8 + 8 = 16
    });
  });

  describe('calculateScoreFromValues', () => {
    it('should return 0 for empty array', () => {
      const score = calculateScoreFromValues([]);
      expect(score).toBe(0);
    });

    it('should calculate score from simple values', () => {
      const values = [2, 2];
      const score = calculateScoreFromValues(values);
      expect(score).toBe(4); // 2 + 2 = 4
    });

    it('should calculate score from multiple different values', () => {
      const values = [2, 4, 8, 16];
      const score = calculateScoreFromValues(values);
      expect(score).toBe(30); // 2 + 4 + 8 + 16 = 30
    });

    it('should handle large values correctly', () => {
      const values = [512, 512, 1024];
      const score = calculateScoreFromValues(values);
      expect(score).toBe(2048); // 512 + 512 + 1024 = 2048
    });

    it('should handle single value', () => {
      const score = calculateScoreFromValues([64]);
      expect(score).toBe(64);
    });

    it('should handle many small values', () => {
      const values = new Array(10).fill(2); // [2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
      const score = calculateScoreFromValues(values);
      expect(score).toBe(20); // 2 * 10 = 20
    });

    it('should handle mixed value sizes', () => {
      const values = [2, 4, 2, 8, 4, 16, 8, 32];
      const score = calculateScoreFromValues(values);
      expect(score).toBe(76); // Sum of all values
    });
  });

  describe('Score Calculation Integration', () => {
    it('should produce same results with both methods when data matches', () => {
      const tiles: Tile[] = [
        { id: 'tile-1', value: 4, row: 0, col: 0, isNew: false },
        { id: 'tile-2', value: 8, row: 0, col: 1, isNew: false },
        { id: 'tile-3', value: 16, row: 0, col: 2, isNew: false },
      ];

      const mergedIds = ['tile-1', 'tile-2', 'tile-3'];
      const values = [4, 8, 16];

      const scoreFromIds = calculateScore(mergedIds, tiles);
      const scoreFromValues = calculateScoreFromValues(values);

      expect(scoreFromIds).toBe(scoreFromValues);
      expect(scoreFromIds).toBe(28);
    });

    it('should handle realistic 2048 game merge scenario', () => {
      // Scenario: Two 2-tiles merge into one 4-tile
      const tiles: Tile[] = [
        { id: 'tile-1', value: 2, row: 0, col: 0, isNew: false },
        { id: 'tile-2', value: 2, row: 0, col: 1, isNew: false },
      ];

      const mergedIds = ['tile-1', 'tile-2'];
      const score = calculateScore(mergedIds, tiles);

      // In 2048, when two 2-tiles merge, you get 4 points
      expect(score).toBe(4);
    });

    it('should handle multiple simultaneous merges', () => {
      // Scenario: Multiple merges in one move (rare but possible)
      const tiles: Tile[] = [
        // First merge: 2 + 2 = 4 (4 points)
        { id: 'tile-1', value: 2, row: 0, col: 0, isNew: false },
        { id: 'tile-2', value: 2, row: 0, col: 1, isNew: false },
        // Second merge: 4 + 4 = 8 (8 points)
        { id: 'tile-3', value: 4, row: 1, col: 0, isNew: false },
        { id: 'tile-4', value: 4, row: 1, col: 1, isNew: false },
      ];

      const mergedIds = ['tile-1', 'tile-2', 'tile-3', 'tile-4'];
      const score = calculateScore(mergedIds, tiles);

      expect(score).toBe(12); // 2 + 2 + 4 + 4 = 12 total points
    });

    it('should handle edge case with maximum tile values', () => {
      // Edge case with very high tile values
      const tiles: Tile[] = [
        { id: 'tile-1', value: 2048, row: 0, col: 0, isNew: false },
        { id: 'tile-2', value: 2048, row: 0, col: 1, isNew: false },
      ];

      const mergedIds = ['tile-1', 'tile-2'];
      const score = calculateScore(mergedIds, tiles);

      expect(score).toBe(4096); // 2048 + 2048 = 4096
    });
  });
});
