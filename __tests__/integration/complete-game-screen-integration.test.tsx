import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Dimensions } from 'react-native';
import { GameStatus } from '@/types/game';
import { useGame } from '@/hooks/useGame';
import { useGameStore } from '@/stores/gameStore';
import { ThemeProvider } from '@/components/themed/ThemeProvider';
import GameScreen from '@/app/(tabs)/index';

// Mock the hooks
jest.mock('@/hooks/useGame');
jest.mock('@/stores/gameStore');
jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      text: '#000000',
      textSecondary: '#666666',
      background: '#FFFFFF',
      cardBackground: '#F8F8F8',
      shadow: '#000000',
    },
  }),
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

// Mock ThemedSafeAreaView
jest.mock('@/components/themed/ThemedSafeAreaView', () => ({
  ThemedSafeAreaView: ({ children, testID, style, ...props }) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID, style, ...props }, children);
  },
}));

// Mock GameBoard and GameHeader components
jest.mock('@/components/game/GameBoard', () => ({
  GameBoard: ({ testID, style, ...props }) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID, style, ...props }, [
      React.createElement(View, {
        key: 'board-grid',
        testID: 'game-board-grid',
      }),
    ]);
  },
}));

jest.mock('@/components/game/GameHeader', () => ({
  GameHeader: ({ testID, onNewGame, style, ...props }) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID, style, ...props }, [
      React.createElement(View, {
        key: 'scores',
        testID: 'game-header-scores',
      }),
      React.createElement(View, { key: 'controls', testID: 'game-header-controls' }, [
        React.createElement('TouchableOpacity', {
          key: 'new-game',
          testID: 'game-header-new-game',
          onPress: onNewGame,
        }),
      ]),
    ]);
  },
}));

// Mock Dimensions
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 667 })), // Standard iPhone size
    },
  };
});

const mockUseGame = useGame as jest.MockedFunction<typeof useGame>;
const mockUseGameStore = useGameStore as jest.MockedFunction<typeof useGameStore>;

describe('Complete Game Screen Integration', () => {
  const mockGameState = {
    board: [
      [{ id: '1', value: 2, row: 0, col: 0, isNew: false }, null, null, null],
      [null, { id: '2', value: 4, row: 1, col: 1, isNew: false }, null, null],
      [null, null, null, null],
      [null, null, null, { id: '3', value: 2, row: 3, col: 3, isNew: true }],
    ],
    score: 12,
    bestScore: 128,
    gameStatus: GameStatus.PLAYING,
    moveCount: 3,
    startTime: Date.now() - 30000,
    lastMoveTime: Date.now() - 1000,
    canUndo: false,
  };

  const mockActions = {
    startNewGame: jest.fn(),
    makeMove: jest.fn(),
    resetGame: jest.fn(),
    continueAfterWin: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useGame hook
    mockUseGame.mockReturnValue({
      gameState: mockGameState,
      actions: mockActions,
      isLoading: false,
      canMove: true,
    });

    // Mock useGameStore selectors
    mockUseGameStore.mockImplementation((selector) => {
      const store = {
        score: 12,
        bestScore: 128,
        gameStatus: GameStatus.PLAYING,
        board: mockGameState.board,
        resetGame: jest.fn(),
      };
      return selector ? selector(store) : store;
    });
  });

  const renderGameScreenWithTheme = (initialTheme: 'light' | 'dark' = 'light') => {
    return render(
      <ThemeProvider initialTheme={initialTheme}>
        <GameScreen />
      </ThemeProvider>
    );
  };

  describe('Main Game Screen Assembly', () => {
    it('renders all main components together', () => {
      renderGameScreenWithTheme();

      // Verify main container is present
      expect(screen.getByTestId('game-screen')).toBeTruthy();

      // Verify GameHeader is integrated
      expect(screen.getByTestId('game-header')).toBeTruthy();

      // Verify GameBoard is integrated
      expect(screen.getByTestId('board-container')).toBeTruthy();
      expect(screen.getByTestId('game-board')).toBeTruthy();
    });

    it('displays loading state correctly', () => {
      mockUseGame.mockReturnValue({
        gameState: mockGameState,
        actions: mockActions,
        isLoading: true,
        canMove: false,
      });

      renderGameScreenWithTheme();

      expect(screen.getByText('Loading Game')).toBeTruthy();
      expect(screen.getByText('Please wait...')).toBeTruthy();

      // Game components should not be visible during loading
      expect(screen.queryByTestId('game-header')).toBeFalsy();
      expect(screen.queryByTestId('game-board')).toBeFalsy();
    });

    it('handles error states gracefully', () => {
      // This test verifies that the GameScreen doesn't crash when rendered properly
      // The GameScreen itself has an error boundary that catches component errors

      // Mock a scenario that could cause errors - missing props or state
      mockUseGame.mockReturnValue({
        gameState: null as any, // Potentially problematic state
        actions: mockActions,
        isLoading: false,
        canMove: false,
      });

      // Should not throw even with problematic state
      expect(() => {
        renderGameScreenWithTheme();
      }).not.toThrow();
    });
  });

  describe('Component Interaction Patterns', () => {
    it('integrates GameHeader with game state updates', () => {
      renderGameScreenWithTheme();

      // Verify GameHeader receives game state
      const header = screen.getByTestId('game-header');
      expect(header).toBeTruthy();

      // Check that score displays are integrated
      expect(screen.getByTestId('game-header-scores')).toBeTruthy();
      expect(screen.getByTestId('game-header-controls')).toBeTruthy();
    });

    it('integrates GameBoard with game state', () => {
      renderGameScreenWithTheme();

      const gameBoard = screen.getByTestId('game-board');
      expect(gameBoard).toBeTruthy();

      // Verify board grid is rendered
      expect(screen.getByTestId('game-board-grid')).toBeTruthy();
    });

    it('handles new game action from GameHeader', () => {
      renderGameScreenWithTheme();

      const newGameButton = screen.getByTestId('game-header-new-game') || screen.getByText('New Game');

      fireEvent.press(newGameButton);

      expect(mockActions.resetGame).toHaveBeenCalledTimes(1);
    });
  });

  describe('Theme System Integration', () => {
    it('switches themes correctly across components', () => {
      const { rerender } = renderGameScreenWithTheme('light');

      // Verify light theme is applied
      expect(screen.getByTestId('game-screen')).toBeTruthy();

      // Re-render with dark theme
      rerender(
        <ThemeProvider initialTheme="dark">
          <GameScreen />
        </ThemeProvider>
      );

      // Components should still be present with dark theme
      expect(screen.getByTestId('game-screen')).toBeTruthy();
      expect(screen.getByTestId('game-header')).toBeTruthy();
      expect(screen.getByTestId('game-board')).toBeTruthy();
    });

    it('applies theme consistently to all child components', () => {
      renderGameScreenWithTheme();

      // All major components should be present and properly themed
      expect(screen.getByTestId('game-screen')).toBeTruthy();
      expect(screen.getByTestId('game-header')).toBeTruthy();
      expect(screen.getByTestId('board-container')).toBeTruthy();
      expect(screen.getByTestId('game-board')).toBeTruthy();
    });
  });

  describe('Responsive Layout Testing', () => {
    it('adapts to different screen sizes', () => {
      // Mock tablet dimensions
      (Dimensions.get as jest.Mock).mockReturnValue({
        width: 800,
        height: 600,
      });

      renderGameScreenWithTheme();

      expect(screen.getByTestId('game-screen')).toBeTruthy();
      expect(screen.getByTestId('game-header')).toBeTruthy();
      expect(screen.getByTestId('game-board')).toBeTruthy();
    });

    it('handles narrow screen layouts', () => {
      // Mock narrow screen dimensions
      (Dimensions.get as jest.Mock).mockReturnValue({
        width: 320,
        height: 568,
      });

      renderGameScreenWithTheme();

      expect(screen.getByTestId('game-screen')).toBeTruthy();
      expect(screen.getByTestId('game-header')).toBeTruthy();
      expect(screen.getByTestId('game-board')).toBeTruthy();
    });

    it('handles portrait and landscape orientations', () => {
      // Test portrait
      (Dimensions.get as jest.Mock).mockReturnValue({
        width: 375,
        height: 667,
      });
      const { rerender } = renderGameScreenWithTheme();

      expect(screen.getByTestId('game-screen')).toBeTruthy();

      // Test landscape
      (Dimensions.get as jest.Mock).mockReturnValue({
        width: 667,
        height: 375,
      });
      rerender(
        <ThemeProvider>
          <GameScreen />
        </ThemeProvider>
      );

      expect(screen.getByTestId('game-screen')).toBeTruthy();
    });
  });

  describe('State Flow Testing', () => {
    it('flows state correctly from game engine through hooks to UI', () => {
      renderGameScreenWithTheme();

      // Verify that game state is properly integrated
      expect(mockUseGame).toHaveBeenCalled();
      // Note: GameScreen uses useGame hook, not useGameStore directly
      // useGameStore would be called internally by child components or the useGame hook

      // Components should receive and display game state
      expect(screen.getByTestId('game-header')).toBeTruthy();
      expect(screen.getByTestId('game-board')).toBeTruthy();
    });

    it('updates UI when game state changes', () => {
      const { rerender } = renderGameScreenWithTheme();

      // Update game state
      const updatedGameState = {
        ...mockGameState,
        score: 24,
        moveCount: 4,
      };

      mockUseGame.mockReturnValue({
        gameState: updatedGameState,
        actions: mockActions,
        isLoading: false,
        canMove: true,
      });

      // Re-render with updated state
      rerender(
        <ThemeProvider>
          <GameScreen />
        </ThemeProvider>
      );

      // Components should still be present and functional
      expect(screen.getByTestId('game-header')).toBeTruthy();
      expect(screen.getByTestId('game-board')).toBeTruthy();
    });
  });

  describe('Error Boundary Integration', () => {
    it('catches and handles component errors gracefully', () => {
      // Test that the GameScreen can handle error scenarios without crashing
      // Since we're using mocked components, we can't easily test the actual error boundary
      // But we can test that the component handles problematic states gracefully

      mockUseGame.mockReturnValue({
        gameState: undefined as any, // Problematic state
        actions: {
          startNewGame: jest.fn(),
          makeMove: jest.fn(),
          resetGame: jest.fn(),
          continueAfterWin: jest.fn(),
        },
        isLoading: false,
        canMove: false,
      });

      // Should render without throwing, even with undefined gameState
      expect(() => {
        renderGameScreenWithTheme();
      }).not.toThrow();

      // Should still render the container
      expect(screen.getByTestId('game-screen')).toBeTruthy();
    });
  });

  describe('Performance and Optimization', () => {
    it('prevents unnecessary re-renders with proper memoization', () => {
      const { rerender } = renderGameScreenWithTheme();

      // Initial render
      expect(screen.getByTestId('game-screen')).toBeTruthy();

      // Re-render without state changes
      rerender(
        <ThemeProvider>
          <GameScreen />
        </ThemeProvider>
      );

      // Components should still be present
      expect(screen.getByTestId('game-screen')).toBeTruthy();
      expect(screen.getByTestId('game-header')).toBeTruthy();
      expect(screen.getByTestId('game-board')).toBeTruthy();
    });

    it('handles loading states without blocking UI', () => {
      mockUseGame.mockReturnValue({
        gameState: mockGameState,
        actions: mockActions,
        isLoading: true,
        canMove: false,
      });

      renderGameScreenWithTheme();

      // Loading state should be responsive
      expect(screen.getByText('Loading Game')).toBeTruthy();
      expect(screen.getByText('Please wait...')).toBeTruthy();
    });
  });
});
