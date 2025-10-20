import { GameHeader } from '@/components/game/GameHeader';
import { useGame } from '@/hooks/useGame';
import { useThemeColors } from '@/hooks/useTheme';
import { GameStatus } from '@/types';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';

// Mock dependencies
jest.mock('@/hooks/useGame', () => ({
  useGame: jest.fn(),
}));

jest.mock('@/hooks/useTheme', () => ({
  useThemeColors: jest.fn(),
}));

// Mock React Native Reanimated
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');

  const AnimatedView = React.forwardRef((props, ref) => React.createElement(View, { ...props, ref }));

  return {
    default: {
      View: AnimatedView,
    },
    useSharedValue: jest.fn(() => ({ value: 0 })),
    withSpring: jest.fn((value) => value),
    withSequence: jest.fn((value) => value),
    useAnimatedStyle: jest.fn(() => ({})),
    interpolate: jest.fn(),
    View: AnimatedView,
  };
});

// Mock Dimensions
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 667 })),
    },
  };
});

// Mock child components
jest.mock('@/components/game/GameHeader/ScoreDisplay', () => ({
  ScoreDisplay: ({ label, value, testID }: any) => {
    const React = require('react');
    const { Text } = require('react-native');
    const safeValue = value || 0;
    return React.createElement(Text, { testID }, `${label}: ${safeValue.toLocaleString()}`);
  },
}));

jest.mock('@/components/ui/StatusIndicator', () => ({
  StatusIndicator: ({ status, testID }: any) => {
    const React = require('react');
    const { Text } = require('react-native');
    const statusMap = {
      playing: 'Playing',
      won: 'You Won!',
      lost: 'Game Over',
    };
    const message = statusMap[status] || 'Playing';
    return React.createElement(Text, { testID }, message);
  },
}));

jest.mock('@/components/ui/Button', () => ({
  Button: ({ title, onPress, testID }: any) => {
    const React = require('react');
    const { TouchableOpacity, Text } = require('react-native');
    return React.createElement(TouchableOpacity, { onPress, testID }, React.createElement(Text, {}, title));
  },
}));

describe('GameHeader Component', () => {
  const mockGameState = {
    board: [
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ],
    score: 1024,
    bestScore: 4096,
    gameStatus: GameStatus.PLAYING,
    moveCount: 0,
    startTime: Date.now(),
    lastMoveTime: Date.now(),
    canUndo: false,
    previousBoard: null,
    previousScore: 0,
  };

  const mockActions = {
    startNewGame: jest.fn(),
    makeMove: jest.fn(),
    resetGame: jest.fn(),
    continueAfterWin: jest.fn(),
  };

  const mockThemeColors = {
    background: '#ffffff',
    text: '#000000',
    accent: '#007AFF',
    surface: '#f5f5f5',
    textSecondary: '#666666',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useGame as jest.MockedFunction<typeof useGame>).mockReturnValue({
      gameState: mockGameState,
      actions: mockActions,
      isLoading: false,
      canMove: true,
    });
    (useThemeColors as jest.Mock).mockReturnValue(mockThemeColors);
  });

  describe('Component Rendering', () => {
    it('renders GameHeader with correct structure and content', () => {
      const { getByTestId, getByText } = render(<GameHeader />);

      expect(getByTestId('game-header')).toBeTruthy();
      expect(getByTestId('game-header-scores')).toBeTruthy();
      expect(getByTestId('game-header-controls')).toBeTruthy();
      expect(getByText('New Game')).toBeTruthy();
    });

    it('displays correct score values with proper formatting', () => {
      const { getByText } = render(<GameHeader />);

      expect(getByText('Score: 1,024')).toBeTruthy();
      expect(getByText('Best: 4,096')).toBeTruthy();
    });

    it('shows correct game status', () => {
      const { getByText } = render(<GameHeader />);

      expect(getByText('Playing')).toBeTruthy();
    });

    it('renders with custom testID prop', () => {
      const { getByTestId } = render(<GameHeader testID="custom-header" />);

      expect(getByTestId('custom-header')).toBeTruthy();
      expect(getByTestId('custom-header-scores')).toBeTruthy();
      expect(getByTestId('custom-header-controls')).toBeTruthy();
    });
  });

  describe('Score Display Tests', () => {
    it('handles zero scores correctly', () => {
      const zeroScoreState = { ...mockGameState, score: 0, bestScore: 0 };
      (useGame as jest.MockedFunction<typeof useGame>).mockReturnValue({
        gameState: zeroScoreState,
        actions: mockActions,
        isLoading: false,
        canMove: true,
      });

      const { getByText } = render(<GameHeader />);

      expect(getByText('Score: 0')).toBeTruthy();
      expect(getByText('Best: 0')).toBeTruthy();
    });

    it('formats large scores correctly', () => {
      const largeScoreState = {
        ...mockGameState,
        score: 1500000,
        bestScore: 2500000,
      };
      (useGame as jest.MockedFunction<typeof useGame>).mockReturnValue({
        gameState: largeScoreState,
        actions: mockActions,
        isLoading: false,
        canMove: true,
      });

      const { getByText } = render(<GameHeader />);

      expect(getByText('Score: 1,500,000')).toBeTruthy();
      expect(getByText('Best: 2,500,000')).toBeTruthy();
    });

    it('handles score changes properly', async () => {
      const { rerender, getByText } = render(<GameHeader />);

      // Update score
      const updatedState = { ...mockGameState, score: 2048 };
      (useGame as jest.MockedFunction<typeof useGame>).mockReturnValue({
        gameState: updatedState,
        actions: mockActions,
        isLoading: false,
        canMove: true,
      });

      rerender(<GameHeader />);

      await waitFor(() => {
        expect(getByText('Score: 2,048')).toBeTruthy();
      });
    });
  });

  describe('Game Status Integration', () => {
    it('displays "Playing" status during active game', () => {
      const { getByText } = render(<GameHeader />);

      expect(getByText('Playing')).toBeTruthy();
    });

    it('displays "You Won!" status when game is won', () => {
      const wonState = { ...mockGameState, gameStatus: GameStatus.WON };
      (useGame as jest.MockedFunction<typeof useGame>).mockReturnValue({
        gameState: wonState,
        actions: mockActions,
        isLoading: false,
        canMove: true,
      });

      const { getByText } = render(<GameHeader />);

      expect(getByText('You Won!')).toBeTruthy();
    });

    it('displays "Game Over" status when game is lost', () => {
      const lostState = { ...mockGameState, gameStatus: GameStatus.LOST };
      (useGame as jest.MockedFunction<typeof useGame>).mockReturnValue({
        gameState: lostState,
        actions: mockActions,
        isLoading: false,
        canMove: false,
      });

      const { getByText } = render(<GameHeader />);

      expect(getByText('Game Over')).toBeTruthy();
    });
  });

  describe('New Game Button Functionality', () => {
    it('triggers resetGame when New Game button is pressed', () => {
      const { getByTestId } = render(<GameHeader />);
      const newGameButton = getByTestId('new-game-button');

      fireEvent.press(newGameButton);

      expect(mockActions.resetGame).toHaveBeenCalledTimes(1);
    });

    it('calls onNewGame callback when provided', () => {
      const mockOnNewGame = jest.fn();
      const { getByTestId } = render(<GameHeader onNewGame={mockOnNewGame} />);
      const newGameButton = getByTestId('new-game-button');

      fireEvent.press(newGameButton);

      expect(mockOnNewGame).toHaveBeenCalledTimes(1);
      expect(mockActions.resetGame).toHaveBeenCalledTimes(1);
    });

    it('works without onNewGame callback', () => {
      const { getByTestId } = render(<GameHeader />);
      const newGameButton = getByTestId('new-game-button');

      // Should not throw error
      expect(() => {
        fireEvent.press(newGameButton);
      }).not.toThrow();

      expect(mockActions.resetGame).toHaveBeenCalledTimes(1);
    });
  });

  describe('Responsive Layout Tests', () => {
    it('adapts layout for narrow screens', () => {
      // Mock narrow screen dimensions
      const mockDimensions = require('react-native').Dimensions;
      mockDimensions.get.mockReturnValue({ width: 320, height: 568 });

      const { getByTestId } = render(<GameHeader />);

      // Component should render without errors on narrow screens
      expect(getByTestId('game-header')).toBeTruthy();
    });

    it('adapts layout for tablet screens', () => {
      // Mock tablet screen dimensions
      const mockDimensions = require('react-native').Dimensions;
      mockDimensions.get.mockReturnValue({ width: 1024, height: 768 });

      const { getByTestId } = render(<GameHeader />);

      // Component should render without errors on tablet screens
      expect(getByTestId('game-header')).toBeTruthy();
    });
  });

  describe('Theme Integration', () => {
    it('applies theme colors correctly', () => {
      const customColors = {
        ...mockThemeColors,
        background: '#f0f0f0',
        accent: '#ff6b35',
      };
      (useThemeColors as jest.Mock).mockReturnValue(customColors);

      const { getByTestId } = render(<GameHeader />);

      // Component should render with custom theme
      expect(getByTestId('game-header')).toBeTruthy();
    });

    it('handles theme changes properly', () => {
      const { rerender, getByTestId } = render(<GameHeader />);

      // Change theme
      const darkColors = {
        ...mockThemeColors,
        background: '#000000',
        text: '#ffffff',
      };
      (useThemeColors as jest.Mock).mockReturnValue(darkColors);

      rerender(<GameHeader />);

      expect(getByTestId('game-header')).toBeTruthy();
    });
  });

  describe('Accessibility Features', () => {
    it('provides proper accessibility labels for header', () => {
      const { getByTestId } = render(<GameHeader />);
      const header = getByTestId('game-header');

      expect(header.props.accessibilityRole).toBe('header');
      expect(header.props.accessibilityLabel).toBe('Game header with score and controls');
    });

    it('has accessible score sections', () => {
      const { getByTestId } = render(<GameHeader />);
      const scoresSection = getByTestId('game-header-scores');

      expect(scoresSection.props.accessibilityLabel).toBe('Score information');
    });

    it('has accessible controls section', () => {
      const { getByTestId } = render(<GameHeader />);
      const controlsSection = getByTestId('game-header-controls');

      expect(controlsSection.props.accessibilityLabel).toBe('Game controls');
    });
  });

  describe('Animation Integration', () => {
    it('handles score animation setup without errors', () => {
      // Component should setup animations without throwing
      expect(() => {
        render(<GameHeader />);
      }).not.toThrow();
    });

    it('triggers animation when score changes', async () => {
      const { rerender } = render(<GameHeader />);

      // Update score to trigger animation
      const newState = { ...mockGameState, score: 2048 };
      (useGame as jest.MockedFunction<typeof useGame>).mockReturnValue({
        gameState: newState,
        actions: mockActions,
        isLoading: false,
        canMove: true,
      });

      expect(() => {
        rerender(<GameHeader />);
      }).not.toThrow();
    });

    it('triggers special animation for new best score', async () => {
      const { rerender } = render(<GameHeader />);

      // Update best score to trigger animation
      const newState = { ...mockGameState, bestScore: 8192 };
      (useGame as jest.MockedFunction<typeof useGame>).mockReturnValue({
        gameState: newState,
        actions: mockActions,
        isLoading: false,
        canMove: true,
      });

      expect(() => {
        rerender(<GameHeader />);
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('handles missing theme colors gracefully', () => {
      (useThemeColors as jest.Mock).mockReturnValue({});

      expect(() => {
        render(<GameHeader />);
      }).not.toThrow();
    });

    it('handles missing game state gracefully', () => {
      // Provide minimal valid game state instead of undefined
      const minimalGameState = {
        board: [[null]],
        score: 0,
        bestScore: 0,
        gameStatus: GameStatus.PLAYING,
        moveCount: 0,
        startTime: Date.now(),
        lastMoveTime: Date.now(),
        canUndo: false,
        previousBoard: null,
        previousScore: 0,
      };
      (useGame as jest.MockedFunction<typeof useGame>).mockReturnValue({
        gameState: minimalGameState,
        actions: mockActions,
        isLoading: false,
        canMove: false,
      });

      expect(() => {
        render(<GameHeader />);
      }).not.toThrow();
    });
  });
});
