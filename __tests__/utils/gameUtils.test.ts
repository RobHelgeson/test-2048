// Sample utility tests demonstrating testing patterns
describe('Game Utilities', () => {
  describe('Score Calculation', () => {
    it('should calculate score correctly for tile merges', () => {
      const calculateMergeScore = (tileValue: number): number => {
        return tileValue;
      };

      expect(calculateMergeScore(2)).toBe(2);
      expect(calculateMergeScore(4)).toBe(4);
      expect(calculateMergeScore(8)).toBe(8);
    });

    it('should handle invalid tile values gracefully', () => {
      const calculateMergeScore = (tileValue: number): number => {
        if (!tileValue || tileValue < 0) return 0;
        return tileValue;
      };

      expect(calculateMergeScore(0)).toBe(0);
      expect(calculateMergeScore(-1)).toBe(0);
      expect(calculateMergeScore(NaN)).toBe(0);
    });
  });

  describe('Board Utilities', () => {
    it('should check if board is full correctly', () => {
      const isBoardFull = (board: number[][]): boolean => {
        return board.every((row) => row.every((cell) => cell !== 0));
      };

      const emptyBoard = [
        [0, 0],
        [0, 0],
      ];
      const fullBoard = [
        [2, 4],
        [8, 16],
      ];
      const partialBoard = [
        [2, 0],
        [4, 8],
      ];

      expect(isBoardFull(emptyBoard)).toBe(false);
      expect(isBoardFull(fullBoard)).toBe(true);
      expect(isBoardFull(partialBoard)).toBe(false);
    });

    it('should find empty cells correctly', () => {
      const findEmptyCells = (board: number[][]): { row: number; col: number }[] => {
        const emptyCells: { row: number; col: number }[] = [];
        board.forEach((row, rowIndex) => {
          row.forEach((cell, colIndex) => {
            if (cell === 0) {
              emptyCells.push({ row: rowIndex, col: colIndex });
            }
          });
        });
        return emptyCells;
      };

      const board = [
        [2, 0, 4],
        [0, 8, 0],
        [16, 0, 32],
      ];

      const emptyCells = findEmptyCells(board);

      expect(emptyCells).toHaveLength(4);
      expect(emptyCells).toContainEqual({ row: 0, col: 1 });
      expect(emptyCells).toContainEqual({ row: 1, col: 0 });
      expect(emptyCells).toContainEqual({ row: 1, col: 2 });
      expect(emptyCells).toContainEqual({ row: 2, col: 1 });
    });
  });

  describe('Validation Utilities', () => {
    it('should validate move directions', () => {
      type Direction = 'up' | 'down' | 'left' | 'right';

      const isValidDirection = (direction: string): direction is Direction => {
        return ['up', 'down', 'left', 'right'].includes(direction);
      };

      expect(isValidDirection('up')).toBe(true);
      expect(isValidDirection('down')).toBe(true);
      expect(isValidDirection('left')).toBe(true);
      expect(isValidDirection('right')).toBe(true);
      expect(isValidDirection('diagonal')).toBe(false);
      expect(isValidDirection('')).toBe(false);
      expect(isValidDirection('invalid')).toBe(false);
    });

    it('should validate game state', () => {
      interface GameState {
        board: number[][];
        score: number;
        gameStatus: 'playing' | 'won' | 'lost';
      }

      const isValidGameState = (state: any): state is GameState => {
        if (!state || state === null || state === undefined) return false;
        return (
          Array.isArray(state.board) &&
          typeof state.score === 'number' &&
          state.score >= 0 &&
          ['playing', 'won', 'lost'].includes(state.gameStatus)
        );
      };

      const validState = {
        board: [
          [2, 0],
          [0, 4],
        ],
        score: 0,
        gameStatus: 'playing',
      };

      const invalidState1 = {
        board: 'invalid',
        score: 0,
        gameStatus: 'playing',
      };

      const invalidState2 = {
        board: [[2, 0]],
        score: -10,
        gameStatus: 'playing',
      };

      expect(isValidGameState(validState)).toBe(true);
      expect(isValidGameState(invalidState1)).toBe(false);
      expect(isValidGameState(invalidState2)).toBe(false);
      expect(isValidGameState(null)).toBe(false);
      expect(isValidGameState(undefined)).toBe(false);
    });
  });
});
