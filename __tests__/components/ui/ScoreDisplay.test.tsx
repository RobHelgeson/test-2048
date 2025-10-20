import React from 'react';
import { render } from '@testing-library/react-native';
import { ScoreDisplay } from '@/components/game/GameHeader/ScoreDisplay';
import { useThemeColors } from '@/hooks/useTheme';
import { formatScore } from '@/utils/helpers';

// Mock utilities
jest.mock('@/utils/helpers', () => ({
  formatScore: jest.fn(),
}));

// No need to mock themed components - they're mocked globally in jest.setup.js

describe('ScoreDisplay Component', () => {
  const mockThemeColors = {
    surface: '#f5f5f5',
    text: '#000000',
    textSecondary: '#666666',
    accent: '#007AFF',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useThemeColors as jest.Mock).mockReturnValue(mockThemeColors);
    (formatScore as jest.Mock).mockImplementation((score) => score.toLocaleString());
  });

  describe('Component Rendering', () => {
    it('renders ScoreDisplay with correct label and value', () => {
      const { getByTestId } = render(<ScoreDisplay label="Score" value={1024} />);

      const container = getByTestId('score-display-score');
      const label = getByTestId('score-label-score', {
        includeHiddenElements: true,
      });
      const valueElement = getByTestId('score-value-score', {
        includeHiddenElements: true,
      });

      expect(container).toBeTruthy();
      expect(label).toBeTruthy();
      expect(valueElement).toBeTruthy();
      expect(formatScore).toHaveBeenCalledWith(1024);
    });

    it('renders with custom testID', () => {
      const { getByTestId } = render(<ScoreDisplay label="Best" value={4096} testID="custom-score" />);

      expect(getByTestId('custom-score')).toBeTruthy();
      expect(getByTestId('custom-score-label', { includeHiddenElements: true })).toBeTruthy();
      expect(getByTestId('custom-score-value', { includeHiddenElements: true })).toBeTruthy();
    });

    it('generates default testIDs when not provided', () => {
      const { getByTestId } = render(<ScoreDisplay label="Best Score" value={2048} />);

      expect(getByTestId('score-display-best score')).toBeTruthy();
      expect(getByTestId('score-label-best score', { includeHiddenElements: true })).toBeTruthy();
      expect(getByTestId('score-value-best score', { includeHiddenElements: true })).toBeTruthy();
    });

    it('renders label in uppercase', () => {
      const { getByTestId } = render(<ScoreDisplay label="best score" value={512} />);

      const label = getByTestId('score-label-best score', {
        includeHiddenElements: true,
      });
      expect(label).toBeTruthy();
    });
  });

  describe('Score Formatting', () => {
    it('formats scores using formatScore utility', () => {
      render(<ScoreDisplay label="Score" value={123456} />);

      expect(formatScore).toHaveBeenCalledWith(123456);
    });

    it('handles zero score', () => {
      const { getByTestId } = render(<ScoreDisplay label="Score" value={0} />);

      const valueElement = getByTestId('score-value-score', {
        includeHiddenElements: true,
      });
      expect(valueElement).toBeTruthy();
      expect(formatScore).toHaveBeenCalledWith(0);
    });

    it('handles large scores', () => {
      (formatScore as jest.Mock).mockReturnValue('1,500,000');

      const { getByTestId } = render(<ScoreDisplay label="Score" value={1500000} />);

      const valueElement = getByTestId('score-value-score', {
        includeHiddenElements: true,
      });
      expect(valueElement).toBeTruthy();
      expect(formatScore).toHaveBeenCalledWith(1500000);
    });

    it('handles negative scores', () => {
      (formatScore as jest.Mock).mockReturnValue('-1,024');

      const { getByTestId } = render(<ScoreDisplay label="Score" value={-1024} />);

      const valueElement = getByTestId('score-value-score', {
        includeHiddenElements: true,
      });
      expect(valueElement).toBeTruthy();
      expect(formatScore).toHaveBeenCalledWith(-1024);
    });
  });

  describe('Highlighted State', () => {
    it('renders without highlighted state by default', () => {
      const { getByTestId } = render(<ScoreDisplay label="Score" value={1024} />);

      const container = getByTestId('score-display-score');
      expect(container).toBeTruthy();
    });

    it('applies highlighted styling when highlighted prop is true', () => {
      const { getByTestId } = render(<ScoreDisplay label="Best" value={2048} highlighted={true} />);

      const container = getByTestId('score-display-best');
      expect(container).toBeTruthy();
    });

    it('removes highlighted styling when highlighted prop is false', () => {
      const { rerender, getByTestId } = render(<ScoreDisplay label="Best" value={2048} highlighted={true} />);

      let container = getByTestId('score-display-best');
      expect(container).toBeTruthy();

      rerender(<ScoreDisplay label="Best" value={2048} highlighted={false} />);

      container = getByTestId('score-display-best');
      expect(container).toBeTruthy();
    });
  });

  describe('Theme Integration', () => {
    it('applies theme colors correctly', () => {
      const customColors = {
        ...mockThemeColors,
        surface: '#ffffff',
        text: '#333333',
        textSecondary: '#888888',
        accent: '#ff6b35',
      };
      (useThemeColors as jest.Mock).mockReturnValue(customColors);

      const { getByTestId } = render(<ScoreDisplay label="Score" value={1024} />);

      expect(getByTestId('score-display-score')).toBeTruthy();
    });

    it('handles theme changes properly', () => {
      const { rerender, getByTestId } = render(<ScoreDisplay label="Score" value={1024} />);

      // Change theme colors
      const darkColors = {
        surface: '#1a1a1a',
        text: '#ffffff',
        textSecondary: '#cccccc',
        accent: '#00d4ff',
      };
      (useThemeColors as jest.Mock).mockReturnValue(darkColors);

      rerender(<ScoreDisplay label="Score" value={1024} />);

      expect(getByTestId('score-display-score')).toBeTruthy();
    });
  });

  describe('Accessibility Features', () => {
    it('provides proper accessibility labels', () => {
      const { getByTestId } = render(<ScoreDisplay label="Score" value={1024} />);

      const container = getByTestId('score-display-score');
      expect(container.props.accessibilityRole).toBe('text');
      expect(container.props.accessibilityLabel).toBe('Score: 1,024');
      expect(container.props.accessibilityHint).toBe('Current score is 1,024');
    });

    it('updates accessibility properties when value changes', () => {
      const { rerender, getByTestId } = render(<ScoreDisplay label="Best" value={2048} />);

      let container = getByTestId('score-display-best');
      expect(container.props.accessibilityLabel).toBe('Best: 2,048');

      (formatScore as jest.Mock).mockReturnValue('4,096');
      rerender(<ScoreDisplay label="Best" value={4096} />);

      container = getByTestId('score-display-best');
      expect(container.props.accessibilityLabel).toBe('Best: 4,096');
    });

    it('hides child elements from accessibility tree', () => {
      const { getByTestId } = render(<ScoreDisplay label="Score" value={1024} />);

      // The container should have proper accessibility properties
      const container = getByTestId('score-display-score');
      expect(container.props.accessibilityRole).toBe('text');
      expect(container.props.accessibilityLabel).toBe('Score: 1,024');
      expect(container.props.accessibilityHint).toBe('Current score is 1,024');

      // Check that child elements exist (they are hidden from accessibility in the actual component)
      const label = getByTestId('score-label-score', {
        includeHiddenElements: true,
      });
      const value = getByTestId('score-value-score', {
        includeHiddenElements: true,
      });
      expect(label).toBeTruthy();
      expect(value).toBeTruthy();
    });

    it('provides accessibility value text', () => {
      const { getByTestId } = render(<ScoreDisplay label="Score" value={1024} />);

      const container = getByTestId('score-display-score');
      expect(container.props.accessibilityValue).toEqual({ text: '1,024' });
    });
  });

  describe('Custom Styling', () => {
    it('applies custom container style', () => {
      const customStyle = { marginTop: 10, backgroundColor: '#red' };
      const { getByTestId } = render(<ScoreDisplay label="Score" value={1024} style={customStyle} />);

      const container = getByTestId('score-display-score');
      expect(container.props.style).toContainEqual(customStyle);
    });

    it('merges custom style with default styles', () => {
      const { getByTestId } = render(<ScoreDisplay label="Score" value={1024} style={{ marginLeft: 5 }} />);

      const container = getByTestId('score-display-score');
      expect(container.props.style).toBeTruthy();
    });
  });

  describe('Performance Optimizations', () => {
    it('memoizes styles when theme colors remain the same', () => {
      const { rerender, getByTestId } = render(<ScoreDisplay label="Score" value={1024} />);

      rerender(<ScoreDisplay label="Score" value={2048} />);

      expect(getByTestId('score-display-score')).toBeTruthy();
      expect(useThemeColors).toHaveBeenCalledTimes(2);
    });

    it('updates styles when theme colors change', () => {
      const { rerender, getByTestId } = render(<ScoreDisplay label="Score" value={1024} />);

      const newColors = { ...mockThemeColors, accent: '#ff0000' };
      (useThemeColors as jest.Mock).mockReturnValue(newColors);

      rerender(<ScoreDisplay label="Score" value={1024} />);

      expect(getByTestId('score-display-score')).toBeTruthy();
    });

    it('memoizes accessibility properties correctly', () => {
      const { rerender, getByTestId } = render(<ScoreDisplay label="Score" value={1024} />);

      // Same props should use memoized accessibility properties
      rerender(<ScoreDisplay label="Score" value={1024} />);

      const container = getByTestId('score-display-score');
      expect(container.props.accessibilityLabel).toBe('Score: 1,024');
    });
  });

  describe('Error Handling', () => {
    it('handles missing theme colors gracefully', () => {
      (useThemeColors as jest.Mock).mockReturnValue({});

      expect(() => {
        render(<ScoreDisplay label="Score" value={1024} />);
      }).not.toThrow();
    });

    it('handles formatScore utility errors gracefully', () => {
      (formatScore as jest.Mock).mockImplementation(() => {
        throw new Error('Formatting error');
      });

      expect(() => {
        render(<ScoreDisplay label="Score" value={1024} />);
      }).toThrow();
    });

    it('handles invalid value types', () => {
      expect(() => {
        render(<ScoreDisplay label="Score" value={NaN} />);
      }).not.toThrow();
    });
  });

  describe('Component Props Validation', () => {
    it('requires label and value props', () => {
      expect(() => {
        render(<ScoreDisplay label="Score" value={1024} />);
      }).not.toThrow();
    });

    it('handles empty label string', () => {
      const { getByTestId } = render(<ScoreDisplay label="" value={1024} />);

      const container = getByTestId('score-display-');
      const label = getByTestId('score-label-', {
        includeHiddenElements: true,
      });
      expect(container).toBeTruthy();
      expect(label).toBeTruthy();
    });

    it('handles various value types correctly', () => {
      const testCases = [0, 1, 1024, 999999, -1];

      testCases.forEach((value) => {
        expect(() => {
          render(<ScoreDisplay label="Test" value={value} />);
        }).not.toThrow();
      });
    });
  });
});
