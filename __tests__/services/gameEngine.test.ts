// Sample game engine service tests demonstrating testing patterns
describe('Game Engine Service', () => {
  describe('Board Manipulation', () => {
    it('should create empty board with correct dimensions', () => {
      const createEmptyBoard = (size: number): number[][] => {
        return Array(size)
          .fill(null)
          .map(() => Array(size).fill(0));
      };

      const board4x4 = createEmptyBoard(4);
      expect(board4x4).toHaveLength(4);
      expect(board4x4[0]).toHaveLength(4);
      expect(board4x4.every((row) => row.every((cell) => cell === 0))).toBe(
        true
      );

      const board2x2 = createEmptyBoard(2);
      expect(board2x2).toHaveLength(2);
      expect(board2x2[0]).toHaveLength(2);
    });

    it('should add random tile to empty position', () => {
      const board = [
        [2, 0, 4, 0],
        [0, 8, 0, 16],
        [0, 0, 0, 0],
        [32, 0, 64, 0],
      ];

      const addRandomTile = (board: number[][]): number[][] => {
        const emptyCells: { row: number; col: number }[] = [];
        board.forEach((row, rowIndex) => {
          row.forEach((cell, colIndex) => {
            if (cell === 0) {
              emptyCells.push({ row: rowIndex, col: colIndex });
            }
          });
        });

        if (emptyCells.length === 0) return board;

        const newBoard = board.map((row) => [...row]);
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const { row, col } = emptyCells[randomIndex];
        newBoard[row][col] = Math.random() < 0.9 ? 2 : 4;

        return newBoard;
      };

      // Mock Math.random for this test
      const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const newBoard = addRandomTile(board);

      // Verify a tile was added
      const originalEmpty = board.flat().filter((cell) => cell === 0).length;
      const newEmpty = newBoard.flat().filter((cell) => cell === 0).length;
      expect(newEmpty).toBe(originalEmpty - 1);

      // Restore Math.random
      mockRandom.mockRestore();
    });
  });

  describe('Move Logic', () => {
    it('should move tiles left correctly', () => {
      const moveLeft = (row: number[]): { newRow: number[]; score: number } => {
        const filtered = row.filter((cell) => cell !== 0);
        const merged: number[] = [];
        let score = 0;
        let i = 0;

        while (i < filtered.length) {
          if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
            const mergedValue = filtered[i] * 2;
            merged.push(mergedValue);
            score += mergedValue;
            i += 2;
          } else {
            merged.push(filtered[i]);
            i += 1;
          }
        }

        while (merged.length < 4) {
          merged.push(0);
        }

        return { newRow: merged, score };
      };

      // Test basic move
      expect(moveLeft([2, 0, 2, 0])).toEqual({
        newRow: [4, 0, 0, 0],
        score: 4,
      });

      // Test no merge
      expect(moveLeft([2, 4, 8, 16])).toEqual({
        newRow: [2, 4, 8, 16],
        score: 0,
      });

      // Test multiple merges
      expect(moveLeft([2, 2, 4, 4])).toEqual({
        newRow: [4, 8, 0, 0],
        score: 12,
      });

      // Test with zeros
      expect(moveLeft([0, 2, 0, 2])).toEqual({
        newRow: [4, 0, 0, 0],
        score: 4,
      });
    });

    it('should detect when no moves are possible', () => {
      const canMove = (board: number[][]): boolean => {
        // Check for empty cells
        for (let row = 0; row < board.length; row++) {
          for (let col = 0; col < board[row].length; col++) {
            if (board[row][col] === 0) return true;
          }
        }

        // Check for possible merges
        for (let row = 0; row < board.length; row++) {
          for (let col = 0; col < board[row].length; col++) {
            const currentValue = board[row][col];
            // Check right neighbor
            if (
              col < board[row].length - 1 &&
              board[row][col + 1] === currentValue
            ) {
              return true;
            }
            // Check down neighbor
            if (
              row < board.length - 1 &&
              board[row + 1][col] === currentValue
            ) {
              return true;
            }
          }
        }

        return false;
      };

      // Board with empty cells
      const boardWithEmpty = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2048, 0],
        [2, 4, 8, 16],
      ];
      expect(canMove(boardWithEmpty)).toBe(true);

      // Board with possible merges
      const boardWithMerge = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2048, 4],
        [2, 4, 8, 8],
      ];
      expect(canMove(boardWithMerge)).toBe(true);

      // Board with no moves
      const noMoveBoard = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2048, 4],
        [2, 32, 8, 2],
      ];
      expect(canMove(noMoveBoard)).toBe(false);
    });
  });

  describe('Game State Validation', () => {
    it('should detect win condition', () => {
      const hasWon = (board: number[][]): boolean => {
        return board.some((row) => row.some((cell) => cell >= 2048));
      };

      const winningBoard = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2048, 4],
        [2, 4, 8, 16],
      ];
      expect(hasWon(winningBoard)).toBe(true);

      const nonWinningBoard = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 512, 4],
        [2, 4, 8, 16],
      ];
      expect(hasWon(nonWinningBoard)).toBe(false);
    });

    it('should calculate total score correctly', () => {
      const calculateScore = (board: number[][]): number => {
        return board.flat().reduce((sum, cell) => sum + cell, 0);
      };

      const board = [
        [2, 4, 0, 0],
        [0, 8, 0, 0],
        [0, 0, 16, 0],
        [0, 0, 0, 32],
      ];

      expect(calculateScore(board)).toBe(62);

      const emptyBoard = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];

      expect(calculateScore(emptyBoard)).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid board dimensions', () => {
      const validateBoard = (board: number[][]): boolean => {
        if (!Array.isArray(board)) return false;
        if (board.length === 0) return false;

        // For a valid board, each row should have the same length as others
        const firstRowLength = board[0].length;
        return board.every(
          (row) => Array.isArray(row) && row.length === firstRowLength
        );
      };

      expect(
        validateBoard([
          [2, 4],
          [8, 16],
        ])
      ).toBe(true);
      expect(
        validateBoard([
          [2, 4, 8],
          [16, 32, 64],
        ])
      ).toBe(true);
      expect(validateBoard([[2, 4], [8]])).toBe(false);
      expect(validateBoard([])).toBe(false);
      expect(validateBoard(null as any)).toBe(false);
    });

    it('should handle invalid tile values', () => {
      const isValidTile = (value: any): boolean => {
        if (typeof value !== 'number') return false;
        if (value < 0) return false;
        if (value === 0) return true;

        // Check if it's a power of 2
        return (value & (value - 1)) === 0;
      };

      expect(isValidTile(0)).toBe(true);
      expect(isValidTile(2)).toBe(true);
      expect(isValidTile(4)).toBe(true);
      expect(isValidTile(2048)).toBe(true);
      expect(isValidTile(3)).toBe(false);
      expect(isValidTile(-2)).toBe(false);
      expect(isValidTile('2')).toBe(false);
      expect(isValidTile(null)).toBe(false);
    });
  });
});
