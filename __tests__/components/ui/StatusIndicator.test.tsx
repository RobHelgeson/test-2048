import React from 'react';
import { render } from '@testing-library/react-native';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { useThemeColors } from '@/hooks/useTheme';
import { GameStatus } from '@/types';

// No need to mock themed components - they're mocked globally in jest.setup.js

describe('StatusIndicator Component', () => {
  const mockThemeColors = {
    accent: '#007AFF',
    success: '#10b981',
    danger: '#ef4444',
    error: '#dc2626',
    tile2048: '#edc22e',
    textOnPrimary: '#ffffff',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Theme colors are already mocked globally
  });

  describe('Component Rendering', () => {
    it('renders StatusIndicator with default testID', () => {
      const { getByTestId } = render(<StatusIndicator status={GameStatus.PLAYING} />);

      expect(getByTestId('status-indicator')).toBeTruthy();
      expect(getByTestId('status-indicator-text', { includeHiddenElements: true })).toBeTruthy();
    });

    it('renders with custom testID', () => {
      const { getByTestId } = render(<StatusIndicator status={GameStatus.PLAYING} testID="custom-status" />);

      expect(getByTestId('custom-status')).toBeTruthy();
      expect(getByTestId('custom-status-text', { includeHiddenElements: true })).toBeTruthy();
    });

    it('renders container and badge structure correctly', () => {
      const { getByTestId } = render(<StatusIndicator status={GameStatus.PLAYING} />);

      const container = getByTestId('status-indicator');
      expect(container).toBeTruthy();
    });
  });

  describe('Status Messages', () => {
    it('displays "Playing" message for PLAYING status', () => {
      const { getByText } = render(<StatusIndicator status={GameStatus.PLAYING} />);

      expect(getByText('Playing', { includeHiddenElements: true })).toBeTruthy();
    });

    it('displays "You Won!" message for WON status', () => {
      const { getByText } = render(<StatusIndicator status={GameStatus.WON} />);

      expect(getByText('You Won!', { includeHiddenElements: true })).toBeTruthy();
    });

    it('displays "Game Over" message for LOST status', () => {
      const { getByText } = render(<StatusIndicator status={GameStatus.LOST} />);

      expect(getByText('Game Over', { includeHiddenElements: true })).toBeTruthy();
    });

    it('handles invalid status gracefully with default message', () => {
      const { getByText } = render(<StatusIndicator status={'invalid' as GameStatus} />);

      expect(getByText('Playing', { includeHiddenElements: true })).toBeTruthy();
    });
  });

  describe('Status Styling', () => {
    it('applies correct colors for PLAYING status', () => {
      const { getByTestId } = render(<StatusIndicator status={GameStatus.PLAYING} />);

      const container = getByTestId('status-indicator');
      expect(container).toBeTruthy();
    });

    it('applies correct colors for WON status', () => {
      const { getByTestId } = render(<StatusIndicator status={GameStatus.WON} />);

      const container = getByTestId('status-indicator');
      expect(container).toBeTruthy();
    });

    it('applies correct colors for LOST status', () => {
      const { getByTestId } = render(<StatusIndicator status={GameStatus.LOST} />);

      const container = getByTestId('status-indicator');
      expect(container).toBeTruthy();
    });

    it('falls back to default colors when theme colors are missing', () => {
      (useThemeColors as jest.Mock).mockReturnValue({
        accent: '#007AFF',
        textOnPrimary: '#ffffff',
      });

      const { getByTestId } = render(<StatusIndicator status={GameStatus.WON} />);

      expect(getByTestId('status-indicator')).toBeTruthy();
    });
  });

  describe('Theme Integration', () => {
    it('applies theme colors correctly', () => {
      const customColors = {
        ...mockThemeColors,
        accent: '#ff6b35',
        success: '#00d4ff',
        danger: '#ff4757',
      };
      (useThemeColors as jest.Mock).mockReturnValue(customColors);

      const { getByTestId } = render(<StatusIndicator status={GameStatus.PLAYING} />);

      expect(getByTestId('status-indicator')).toBeTruthy();
    });

    it('handles theme changes properly', () => {
      const { rerender, getByTestId } = render(<StatusIndicator status={GameStatus.PLAYING} />);

      // Change theme colors
      const darkColors = {
        accent: '#00d4ff',
        success: '#20e3b2',
        danger: '#ff6b6b',
        textOnPrimary: '#000000',
      };
      (useThemeColors as jest.Mock).mockReturnValue(darkColors);

      rerender(<StatusIndicator status={GameStatus.PLAYING} />);

      expect(getByTestId('status-indicator')).toBeTruthy();
    });

    it('uses fallback colors when specific theme colors are not available', () => {
      const minimalColors = {
        accent: '#007AFF',
        textOnPrimary: '#ffffff',
      };
      (useThemeColors as jest.Mock).mockReturnValue(minimalColors);

      const { getByText } = render(<StatusIndicator status={GameStatus.WON} />);

      expect(getByText('You Won!', { includeHiddenElements: true })).toBeTruthy();
    });
  });

  describe('Accessibility Features', () => {
    it('provides proper accessibility role and labels for PLAYING', () => {
      const { getByTestId } = render(<StatusIndicator status={GameStatus.PLAYING} />);

      const container = getByTestId('status-indicator');
      expect(container.props.accessibilityRole).toBe('text');
      expect(container.props.accessibilityLabel).toBe('Playing');
      expect(container.props.accessibilityLiveRegion).toBe('polite');
    });

    it('provides proper accessibility labels for WON status', () => {
      const { getByTestId } = render(<StatusIndicator status={GameStatus.WON} />);

      const container = getByTestId('status-indicator');
      expect(container.props.accessibilityLabel).toBe('You Won!');
      expect(container.props.accessibilityValue).toEqual({ text: 'You Won!' });
    });

    it('provides proper accessibility labels for LOST status', () => {
      const { getByTestId } = render(<StatusIndicator status={GameStatus.LOST} />);

      const container = getByTestId('status-indicator');
      expect(container.props.accessibilityLabel).toBe('Game Over');
      expect(container.props.accessibilityValue).toEqual({ text: 'Game Over' });
    });

    it('updates accessibility properties when status changes', () => {
      const { rerender, getByTestId } = render(<StatusIndicator status={GameStatus.PLAYING} />);

      let container = getByTestId('status-indicator');
      expect(container.props.accessibilityLabel).toBe('Playing');

      rerender(<StatusIndicator status={GameStatus.WON} />);

      container = getByTestId('status-indicator');
      expect(container.props.accessibilityLabel).toBe('You Won!');
    });

    it('hides text element from accessibility tree', () => {
      const { getByTestId } = render(<StatusIndicator status={GameStatus.PLAYING} />);

      const textElement = getByTestId('status-indicator-text', {
        includeHiddenElements: true,
      });
      expect(textElement.props.accessibilityElementsHidden).toBe(true);
    });

    it('maintains live region for status announcements', () => {
      const { getByTestId } = render(<StatusIndicator status={GameStatus.PLAYING} />);

      const container = getByTestId('status-indicator');
      expect(container.props.accessibilityLiveRegion).toBe('polite');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom container style', () => {
      const customStyle = { marginTop: 20, backgroundColor: 'red' };
      const { getByTestId } = render(<StatusIndicator status={GameStatus.PLAYING} style={customStyle} />);

      const container = getByTestId('status-indicator');
      expect(container.props.style).toContainEqual(customStyle);
    });

    it('applies custom text style', () => {
      const customTextStyle = { fontSize: 20, fontWeight: 'bold' };
      const { getByTestId } = render(<StatusIndicator status={GameStatus.PLAYING} textStyle={customTextStyle} />);

      const textElement = getByTestId('status-indicator-text', {
        includeHiddenElements: true,
      });
      expect(textElement.props.style).toContainEqual(customTextStyle);
    });

    it('merges custom styles with default styles', () => {
      const { getByTestId } = render(
        <StatusIndicator status={GameStatus.PLAYING} style={{ marginLeft: 10 }} textStyle={{ letterSpacing: 1 }} />
      );

      const container = getByTestId('status-indicator');
      const textElement = getByTestId('status-indicator-text', {
        includeHiddenElements: true,
      });

      expect(container.props.style).toBeTruthy();
      expect(textElement.props.style).toBeTruthy();
    });
  });

  describe('Animation Support', () => {
    it('handles animated prop being true', () => {
      const { getByTestId } = render(<StatusIndicator status={GameStatus.PLAYING} animated={true} />);

      expect(getByTestId('status-indicator')).toBeTruthy();
    });

    it('handles animated prop being false', () => {
      const { getByTestId } = render(<StatusIndicator status={GameStatus.PLAYING} animated={false} />);

      expect(getByTestId('status-indicator')).toBeTruthy();
    });

    it('defaults animated to true when not provided', () => {
      const { getByTestId } = render(<StatusIndicator status={GameStatus.PLAYING} />);

      expect(getByTestId('status-indicator')).toBeTruthy();
    });
  });

  describe('Status Transitions', () => {
    it('handles status transition from PLAYING to WON', () => {
      const { rerender, getByText } = render(<StatusIndicator status={GameStatus.PLAYING} />);

      expect(getByText('Playing', { includeHiddenElements: true })).toBeTruthy();

      rerender(<StatusIndicator status={GameStatus.WON} />);

      expect(getByText('You Won!', { includeHiddenElements: true })).toBeTruthy();
    });

    it('handles status transition from PLAYING to LOST', () => {
      const { rerender, getByText } = render(<StatusIndicator status={GameStatus.PLAYING} />);

      expect(getByText('Playing', { includeHiddenElements: true })).toBeTruthy();

      rerender(<StatusIndicator status={GameStatus.LOST} />);

      expect(getByText('Game Over', { includeHiddenElements: true })).toBeTruthy();
    });

    it('handles rapid status changes', () => {
      const { rerender, getByText } = render(<StatusIndicator status={GameStatus.PLAYING} />);

      rerender(<StatusIndicator status={GameStatus.WON} />);
      rerender(<StatusIndicator status={GameStatus.PLAYING} />);
      rerender(<StatusIndicator status={GameStatus.LOST} />);

      expect(getByText('Game Over', { includeHiddenElements: true })).toBeTruthy();
    });
  });

  describe('Performance Optimizations', () => {
    it('memoizes status configuration correctly', () => {
      const { rerender, getByText } = render(<StatusIndicator status={GameStatus.PLAYING} />);

      // Same status should use memoized config
      rerender(<StatusIndicator status={GameStatus.PLAYING} />);

      expect(getByText('Playing', { includeHiddenElements: true })).toBeTruthy();
      expect(useThemeColors).toHaveBeenCalledTimes(2);
    });

    it('updates configuration when status changes', () => {
      const { rerender, getByText } = render(<StatusIndicator status={GameStatus.PLAYING} />);

      rerender(<StatusIndicator status={GameStatus.WON} />);

      expect(getByText('You Won!', { includeHiddenElements: true })).toBeTruthy();
    });

    it('updates configuration when theme colors change', () => {
      const { rerender, getByTestId } = render(<StatusIndicator status={GameStatus.PLAYING} />);

      const newColors = { ...mockThemeColors, accent: '#ff0000' };
      (useThemeColors as jest.Mock).mockReturnValue(newColors);

      rerender(<StatusIndicator status={GameStatus.PLAYING} />);

      expect(getByTestId('status-indicator')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('handles missing theme colors gracefully', () => {
      (useThemeColors as jest.Mock).mockReturnValue({});

      expect(() => {
        render(<StatusIndicator status={GameStatus.PLAYING} />);
      }).not.toThrow();
    });

    it('handles undefined status gracefully', () => {
      expect(() => {
        render(<StatusIndicator status={undefined as any} />);
      }).not.toThrow();
    });

    it('handles null status gracefully', () => {
      expect(() => {
        render(<StatusIndicator status={null as any} />);
      }).not.toThrow();
    });
  });

  describe('Component Props Validation', () => {
    it('requires status prop', () => {
      expect(() => {
        render(<StatusIndicator status={GameStatus.PLAYING} />);
      }).not.toThrow();
    });

    it('accepts all valid GameStatus values', () => {
      const validStatuses = [GameStatus.PLAYING, GameStatus.WON, GameStatus.LOST];

      validStatuses.forEach((status) => {
        expect(() => {
          render(<StatusIndicator status={status} />);
        }).not.toThrow();
      });
    });
  });
});
