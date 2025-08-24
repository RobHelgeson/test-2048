// Sample Zustand store tests demonstrating testing patterns
import { createMockStore } from '../test-utils';

interface GameState {
  board: number[][];
  score: number;
  gameStatus: 'playing' | 'won' | 'lost';
  highScore: number;
}

interface GameActions {
  makeMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  resetGame: () => void;
  updateScore: (newScore: number) => void;
  setGameStatus: (status: 'playing' | 'won' | 'lost') => void;
}

type GameStore = GameState & GameActions;

describe('Game Store', () => {
  let mockStore: ReturnType<typeof createMockStore<GameStore>>;

  const initialState: GameStore = {
    board: [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    score: 0,
    gameStatus: 'playing',
    highScore: 0,
    makeMove: jest.fn(),
    resetGame: jest.fn(),
    updateScore: jest.fn(),
    setGameStatus: jest.fn(),
  };

  beforeEach(() => {
    mockStore = createMockStore(initialState);
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = mockStore.getState();

      expect(state.board).toEqual([
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ]);
      expect(state.score).toBe(0);
      expect(state.gameStatus).toBe('playing');
      expect(state.highScore).toBe(0);
    });

    it('should have all required action methods', () => {
      const state = mockStore.getState();

      expect(typeof state.makeMove).toBe('function');
      expect(typeof state.resetGame).toBe('function');
      expect(typeof state.updateScore).toBe('function');
      expect(typeof state.setGameStatus).toBe('function');
    });
  });

  describe('State Updates', () => {
    it('should update score correctly', () => {
      mockStore.setState({ score: 100 });

      const state = mockStore.getState();
      expect(state.score).toBe(100);
    });

    it('should update game status', () => {
      mockStore.setState({ gameStatus: 'won' });

      const state = mockStore.getState();
      expect(state.gameStatus).toBe('won');
    });

    it('should update board state', () => {
      const newBoard = [
        [2, 0, 0, 0],
        [0, 4, 0, 0],
        [0, 0, 8, 0],
        [0, 0, 0, 16],
      ];

      mockStore.setState({ board: newBoard });

      const state = mockStore.getState();
      expect(state.board).toEqual(newBoard);
    });

    it('should update high score when current score exceeds it', () => {
      // Simulate game logic for high score
      const currentScore = 1000;
      const currentHighScore = mockStore.getState().highScore;

      const newHighScore = Math.max(currentScore, currentHighScore);

      mockStore.setState({
        score: currentScore,
        highScore: newHighScore,
      });

      const state = mockStore.getState();
      expect(state.highScore).toBe(1000);
      expect(state.score).toBe(1000);
    });
  });

  describe('Complex State Updates', () => {
    it('should handle game reset properly', () => {
      // Set up a game in progress
      mockStore.setState({
        board: [
          [2, 4, 8, 16],
          [32, 64, 128, 256],
          [512, 1024, 2048, 4],
          [2, 4, 8, 16],
        ],
        score: 5000,
        gameStatus: 'won',
      });

      // Reset to initial state (keeping high score)
      const currentHighScore = Math.max(5000, mockStore.getState().highScore);

      mockStore.setState({
        board: [
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
        score: 0,
        gameStatus: 'playing',
        highScore: currentHighScore,
      });

      const state = mockStore.getState();
      expect(state.score).toBe(0);
      expect(state.gameStatus).toBe('playing');
      expect(state.highScore).toBe(5000);
      expect(state.board.every((row) => row.every((cell) => cell === 0))).toBe(
        true
      );
    });

    it('should handle partial state updates', () => {
      const initialBoard = mockStore.getState().board;

      // Update only score
      mockStore.setState({ score: 50 });

      let state = mockStore.getState();
      expect(state.score).toBe(50);
      expect(state.board).toEqual(initialBoard); // Board should remain unchanged
      expect(state.gameStatus).toBe('playing'); // Status should remain unchanged

      // Update only game status
      mockStore.setState({ gameStatus: 'lost' });

      state = mockStore.getState();
      expect(state.score).toBe(50); // Score should remain as updated
      expect(state.gameStatus).toBe('lost');
      expect(state.board).toEqual(initialBoard); // Board should remain unchanged
    });
  });

  describe('State Immutability', () => {
    it('should not mutate original state when updating', () => {
      const originalBoard = mockStore.getState().board;
      const originalBoardStringified = JSON.stringify(originalBoard);

      // Update with new board
      const newBoard = [
        [2, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];

      mockStore.setState({ board: newBoard });

      // Original board reference should remain unchanged
      expect(JSON.stringify(originalBoard)).toBe(originalBoardStringified);
      expect(mockStore.getState().board).toEqual(newBoard);
      expect(mockStore.getState().board).not.toBe(originalBoard);
    });

    it('should handle deep state updates correctly', () => {
      const state = mockStore.getState();
      const originalState = JSON.parse(JSON.stringify(state));

      // Update multiple properties
      mockStore.setState((prevState) => ({
        score: prevState.score + 100,
        gameStatus: 'won',
        board: [
          [2048, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
      }));

      const newState = mockStore.getState();

      expect(newState.score).toBe(100);
      expect(newState.gameStatus).toBe('won');
      expect(newState.board[0][0]).toBe(2048);

      // Verify original state wasn't mutated
      expect(originalState.score).toBe(0);
      expect(originalState.gameStatus).toBe('playing');
      expect(originalState.board[0][0]).toBe(0);
    });
  });

  describe('Mock Store Behavior', () => {
    it('should support subscription mock', () => {
      expect(mockStore.subscribe).toBeDefined();
      expect(typeof mockStore.subscribe).toBe('function');
    });

    it('should support destroy mock', () => {
      expect(mockStore.destroy).toBeDefined();
      expect(typeof mockStore.destroy).toBe('function');
    });

    it('should handle setState with function updater', () => {
      mockStore.setState((prevState) => ({
        score: prevState.score + 50,
      }));

      expect(mockStore.getState().score).toBe(50);

      // Test chaining
      mockStore.setState((prevState) => ({
        score: prevState.score * 2,
      }));

      expect(mockStore.getState().score).toBe(100);
    });
  });
});
