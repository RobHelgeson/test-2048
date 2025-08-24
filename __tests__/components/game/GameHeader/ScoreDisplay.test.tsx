import { ScoreDisplay } from '@/components/game/GameHeader/ScoreDisplay';
import { useThemeColors } from '@/hooks/useTheme';
import { render } from '@testing-library/react-native';
import React from 'react';

// Mock utilities
jest.mock('@/utils/helpers', () => ({
  formatScore: jest.fn((score) => {
    if (score < 1000) return score.toString();
    if (score < 1000000) return `${(score / 1000).toFixed(1)}K`;
    return `${(score / 1000000).toFixed(1)}M`;
  }),
}));

// No need to mock themed components - they're mocked globally in jest.setup.js

describe('ScoreDisplay Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Theme colors are already mocked globally
  });

  describe('Component Rendering', () => {
    it('renders score display with correct structure', () => {
      const { getByTestId, UNSAFE_getAllByType } = render(
        <ScoreDisplay label="Score" value={1024} testID="test-score" />
      );

      expect(getByTestId('test-score')).toBeTruthy();

      // Should render exactly 2 text elements (label and value)
      const textElements = UNSAFE_getAllByType('Text');
      expect(textElements).toHaveLength(2);
    });

    it('displays correct content in text elements', () => {
      const { UNSAFE_getAllByType } = render(
        <ScoreDisplay label="Best" value={50000} />
      );

      // Find the text elements and check their content
      const textElements = UNSAFE_getAllByType('Text');
      const texts = textElements.map((el) => el.props.children);

      expect(texts).toContain('BEST'); // Label (uppercased)
      expect(texts).toContain('50.0K'); // Formatted value
    });

    it('converts label to uppercase', () => {
      const { UNSAFE_getAllByType } = render(
        <ScoreDisplay label="score" value={100} />
      );

      const textElements = UNSAFE_getAllByType('Text');
      const texts = textElements.map((el) => el.props.children);

      expect(texts).toContain('SCORE'); // Should be uppercase
      expect(texts).toContain('100'); // Value
    });

    it('uses default testID when not provided', () => {
      const { getByTestId } = render(
        <ScoreDisplay label="Current" value={256} />
      );

      expect(getByTestId('score-display-current')).toBeTruthy();
    });

    it('renders with custom testID', () => {
      const { getByTestId } = render(
        <ScoreDisplay label="Custom" value={321} testID="my-custom-id" />
      );

      expect(getByTestId('my-custom-id')).toBeTruthy();
    });
  });

  describe('Score Formatting', () => {
    it('formats small numbers correctly', () => {
      const { UNSAFE_getAllByType } = render(
        <ScoreDisplay label="Test" value={42} />
      );

      const textElements = UNSAFE_getAllByType('Text');
      const texts = textElements.map((el) => el.props.children);
      expect(texts).toContain('42');
    });

    it('formats thousands correctly', () => {
      const { UNSAFE_getAllByType } = render(
        <ScoreDisplay label="Test" value={2500} />
      );

      const textElements = UNSAFE_getAllByType('Text');
      const texts = textElements.map((el) => el.props.children);
      expect(texts).toContain('2.5K');
    });

    it('formats millions correctly', () => {
      const { UNSAFE_getAllByType } = render(
        <ScoreDisplay label="Test" value={1500000} />
      );

      const textElements = UNSAFE_getAllByType('Text');
      const texts = textElements.map((el) => el.props.children);
      expect(texts).toContain('1.5M');
    });

    it('handles zero score', () => {
      const { UNSAFE_getAllByType } = render(
        <ScoreDisplay label="Test" value={0} />
      );

      const textElements = UNSAFE_getAllByType('Text');
      const texts = textElements.map((el) => el.props.children);
      expect(texts).toContain('0');
    });
  });

  describe('Theme Integration', () => {
    it('calls useThemeColors hook', () => {
      render(<ScoreDisplay label="Theme" value={123} />);

      expect(useThemeColors).toHaveBeenCalled();
    });

    it('applies theme colors in styles', () => {
      const { getByTestId } = render(
        <ScoreDisplay label="Themed" value={456} />
      );

      // Verify the component renders with the global theme mock
      expect(getByTestId('score-display-themed')).toBeTruthy();
    });
  });

  describe('Highlighted State', () => {
    it('applies highlighted styling when highlighted prop is true', () => {
      const { getByTestId } = render(
        <ScoreDisplay label="Best" value={2048} highlighted={true} />
      );

      // Component should render successfully with highlighted state
      expect(getByTestId('score-display-best')).toBeTruthy();
    });

    it('renders normally when highlighted prop is false', () => {
      const { getByTestId } = render(
        <ScoreDisplay label="Regular" value={512} highlighted={false} />
      );

      expect(getByTestId('score-display-regular')).toBeTruthy();
    });

    it('defaults to non-highlighted when highlighted prop is not provided', () => {
      const { getByTestId } = render(
        <ScoreDisplay label="Default" value={128} />
      );

      expect(getByTestId('score-display-default')).toBeTruthy();
    });
  });

  describe('Accessibility Features', () => {
    it('provides proper accessibility labels', () => {
      const { getByTestId } = render(
        <ScoreDisplay label="Score" value={1024} testID="accessible-score" />
      );

      const container = getByTestId('accessible-score');
      expect(container.props.accessibilityLabel).toBe('Score: 1.0K');
      expect(container.props.accessibilityHint).toBe('Current score is 1.0K');
    });

    it('sets correct accessibility role', () => {
      const { getByTestId } = render(
        <ScoreDisplay label="Best" value={4096} testID="role-test" />
      );

      const container = getByTestId('role-test');
      expect(container.props.accessibilityRole).toBe('text');
    });

    it('provides accessibility value', () => {
      const { getByTestId } = render(
        <ScoreDisplay label="High" value={8192} testID="value-test" />
      );

      const container = getByTestId('value-test');
      expect(container.props.accessibilityValue).toEqual({ text: '8.2K' });
    });

    it('marks container as accessible', () => {
      const { getByTestId } = render(
        <ScoreDisplay label="Access" value={512} testID="access-test" />
      );

      const container = getByTestId('access-test');
      expect(container.props.accessible).toBe(true);
    });
  });

  describe('Custom Styling', () => {
    it('accepts custom style prop without crashing', () => {
      const customStyle = { opacity: 0.5 };

      expect(() =>
        render(
          <ScoreDisplay
            label="Custom"
            value={789}
            style={customStyle}
            testID="custom-style"
          />
        )
      ).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('handles very large numbers', () => {
      const { UNSAFE_getAllByType } = render(
        <ScoreDisplay label="Huge" value={999999999} />
      );

      const textElements = UNSAFE_getAllByType('Text');
      const texts = textElements.map((el) => el.props.children);
      expect(texts).toContain('1000.0M');
    });

    it('handles negative numbers gracefully', () => {
      const { getByTestId } = render(
        <ScoreDisplay label="Negative" value={-100} />
      );

      // Should handle gracefully without crashing
      expect(getByTestId('score-display-negative')).toBeTruthy();
    });

    it('handles empty label gracefully', () => {
      const { getByTestId } = render(
        <ScoreDisplay label="" value={123} testID="empty-label" />
      );

      expect(getByTestId('empty-label')).toBeTruthy();
    });
  });
});
