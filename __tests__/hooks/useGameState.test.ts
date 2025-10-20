// Sample game hook for demonstration
const useGameState = (initialBoard?: number[][]) => {
  const [board, setBoard] = useState(
    initialBoard || [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
  );
  const [score, setScore] = useState(0);
  const [gameStatus, setGameStatus] = useState('playing' as 'playing' | 'won' | 'lost');

  const resetGame = () => {
    setBoard([
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    setScore(0);
    setGameStatus('playing');
  };

  const addScore = (points: number) => {
    setScore((prevScore: number) => prevScore + points);
  };

  return {
    board,
    score,
    gameStatus,
    resetGame,
    addScore,
    setGameStatus,
  };
};

// Mock React hooks since we're in a test environment
const useState = jest.fn();
const mockSetState = jest.fn();

describe('useGameState Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useState.mockImplementation((initial) => [initial, mockSetState]);
  });

  describe('Initial State', () => {
    it('should initialize with empty board', () => {
      useState
        .mockReturnValueOnce([
          [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
          ],
          mockSetState,
        ])
        .mockReturnValueOnce([0, mockSetState])
        .mockReturnValueOnce(['playing', mockSetState]);

      const hook = useGameState();

      expect(hook.board).toEqual([
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ]);
      expect(hook.score).toBe(0);
      expect(hook.gameStatus).toBe('playing');
    });

    it('should initialize with custom board', () => {
      const customBoard = [
        [2, 0, 0, 0],
        [0, 4, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];

      useState
        .mockReturnValueOnce([customBoard, mockSetState])
        .mockReturnValueOnce([0, mockSetState])
        .mockReturnValueOnce(['playing', mockSetState]);

      const hook = useGameState(customBoard);

      expect(hook.board).toEqual(customBoard);
    });
  });

  describe('Game Actions', () => {
    let hook: ReturnType<typeof useGameState>;

    beforeEach(() => {
      useState
        .mockReturnValueOnce([
          [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
          ],
          mockSetState,
        ])
        .mockReturnValueOnce([0, mockSetState])
        .mockReturnValueOnce(['playing', mockSetState]);

      hook = useGameState();
    });

    it('should reset game to initial state', () => {
      hook.resetGame();

      // Verify all setters were called with correct values
      expect(mockSetState).toHaveBeenCalledWith([
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ]);
      expect(mockSetState).toHaveBeenCalledWith(0);
      expect(mockSetState).toHaveBeenCalledWith('playing');
    });

    it('should add score correctly', () => {
      // Mock the score setter to use function form
      const mockScoreSetter = jest.fn();
      useState
        .mockReturnValueOnce([
          [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
          ],
          mockSetState,
        ])
        .mockReturnValueOnce([10, mockScoreSetter])
        .mockReturnValueOnce(['playing', mockSetState]);

      const hookWithScore = useGameState();
      hookWithScore.addScore(4);

      expect(mockScoreSetter).toHaveBeenCalledWith(expect.any(Function));

      // Test the function passed to setScore
      const scoreUpdateFn = mockScoreSetter.mock.calls[0][0];
      expect(scoreUpdateFn(10)).toBe(14);
    });
  });

  describe('Game Status Management', () => {
    it('should update game status', () => {
      useState
        .mockReturnValueOnce([
          [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
          ],
          mockSetState,
        ])
        .mockReturnValueOnce([0, mockSetState])
        .mockReturnValueOnce(['playing', mockSetState]);

      const hook = useGameState();
      hook.setGameStatus('won');

      expect(mockSetState).toHaveBeenCalledWith('won');
    });

    it('should handle all valid game status values', () => {
      useState
        .mockReturnValueOnce([
          [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
          ],
          mockSetState,
        ])
        .mockReturnValueOnce([0, mockSetState])
        .mockReturnValueOnce(['playing', mockSetState]);

      const hook = useGameState();

      const validStatuses: ('playing' | 'won' | 'lost')[] = ['playing', 'won', 'lost'];

      validStatuses.forEach((status) => {
        hook.setGameStatus(status);
        expect(mockSetState).toHaveBeenCalledWith(status);
      });
    });
  });
});
