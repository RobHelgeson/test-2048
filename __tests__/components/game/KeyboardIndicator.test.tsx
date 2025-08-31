import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { KeyboardIndicator } from '@/components/game/KeyboardIndicator';
import { Direction } from '@/types';

// Mock useThemeColors hook
jest.mock('@/hooks/useTheme', () => ({
  useThemeColors: () => ({
    primary: '#007AFF',
    textSecondary: '#666666',
    tilePlaceholder: '#DDDDDD',
  }),
}));

// Mock getKeyBindings utility
jest.mock('@/hooks/useKeyboard', () => ({
  getKeyBindings: () => [
    { keys: ['↑', 'W'], direction: 'up', label: 'Move Up' },
    { keys: ['↓', 'S'], direction: 'down', label: 'Move Down' },
    { keys: ['←', 'A'], direction: 'left', label: 'Move Left' },
    { keys: ['→', 'D'], direction: 'right', label: 'Move Right' },
  ],
}));

describe('KeyboardIndicator Component', () => {
  const defaultProps = {
    visible: true,
    compact: false,
    testID: 'test-keyboard-indicator',
  };

  describe('Visibility', () => {
    it('should render when visible is true', () => {
      render(<KeyboardIndicator {...defaultProps} />);

      expect(screen.getByTestId('test-keyboard-indicator')).toBeTruthy();
    });

    it('should not render when visible is false', () => {
      render(<KeyboardIndicator {...defaultProps} visible={false} />);

      expect(screen.queryByTestId('test-keyboard-indicator')).toBeNull();
    });
  });

  describe('Layout Modes', () => {
    it('should render directional layout in non-compact mode', () => {
      render(<KeyboardIndicator {...defaultProps} compact={false} />);

      // Should show help text in non-compact mode
      expect(screen.getByText('Use arrow keys or WASD to move')).toBeTruthy();

      // Should render all direction keys
      expect(screen.getByTestId('test-keyboard-indicator-key-up')).toBeTruthy();
      expect(screen.getByTestId('test-keyboard-indicator-key-down')).toBeTruthy();
      expect(screen.getByTestId('test-keyboard-indicator-key-left')).toBeTruthy();
      expect(screen.getByTestId('test-keyboard-indicator-key-right')).toBeTruthy();
    });

    it('should render linear layout in compact mode', () => {
      render(<KeyboardIndicator {...defaultProps} compact={true} />);

      // Should not show help text in compact mode
      expect(screen.queryByText('Use arrow keys or WASD to move')).toBeNull();

      // Should still render all direction keys
      expect(screen.getByTestId('test-keyboard-indicator-key-up')).toBeTruthy();
      expect(screen.getByTestId('test-keyboard-indicator-key-down')).toBeTruthy();
      expect(screen.getByTestId('test-keyboard-indicator-key-left')).toBeTruthy();
      expect(screen.getByTestId('test-keyboard-indicator-key-right')).toBeTruthy();
    });
  });

  describe('Key Symbols', () => {
    it('should display all key symbols for each direction', () => {
      render(<KeyboardIndicator {...defaultProps} />);

      // Arrow keys
      expect(screen.getByText('↑')).toBeTruthy();
      expect(screen.getByText('↓')).toBeTruthy();
      expect(screen.getByText('←')).toBeTruthy();
      expect(screen.getByText('→')).toBeTruthy();

      // WASD keys
      expect(screen.getByText('W')).toBeTruthy();
      expect(screen.getByText('S')).toBeTruthy();
      expect(screen.getByText('A')).toBeTruthy();
      expect(screen.getByText('D')).toBeTruthy();
    });

    it('should display direction labels in non-compact mode', () => {
      render(<KeyboardIndicator {...defaultProps} compact={false} />);

      expect(screen.getByText('Up')).toBeTruthy();
      expect(screen.getByText('Down')).toBeTruthy();
      expect(screen.getByText('Left')).toBeTruthy();
      expect(screen.getByText('Right')).toBeTruthy();
    });

    it('should not display direction labels in compact mode', () => {
      render(<KeyboardIndicator {...defaultProps} compact={true} />);

      expect(screen.queryByText('Up')).toBeNull();
      expect(screen.queryByText('Down')).toBeNull();
      expect(screen.queryByText('Left')).toBeNull();
      expect(screen.queryByText('Right')).toBeNull();
    });
  });

  describe('Visual State Feedback', () => {
    it('should highlight active directions', () => {
      const activeDirections = new Set([Direction.UP, Direction.RIGHT]);

      render(<KeyboardIndicator {...defaultProps} activeDirections={activeDirections} />);

      const upKey = screen.getByTestId('test-keyboard-indicator-key-up');
      const rightKey = screen.getByTestId('test-keyboard-indicator-key-right');
      const downKey = screen.getByTestId('test-keyboard-indicator-key-down');
      const leftKey = screen.getByTestId('test-keyboard-indicator-key-left');

      // Active keys should have selected state
      expect(upKey.props.accessibilityState.selected).toBe(true);
      expect(rightKey.props.accessibilityState.selected).toBe(true);

      // Inactive keys should not have selected state
      expect(downKey.props.accessibilityState.selected).toBe(false);
      expect(leftKey.props.accessibilityState.selected).toBe(false);
    });

    it('should highlight pressed direction', () => {
      render(<KeyboardIndicator {...defaultProps} pressedDirection={Direction.LEFT} />);

      const leftKey = screen.getByTestId('test-keyboard-indicator-key-left');
      const upKey = screen.getByTestId('test-keyboard-indicator-key-up');

      // Keys should have accessibility labels regardless of press state
      expect(leftKey.props.accessibilityLabel).toContain('Move Left');
      expect(upKey.props.accessibilityLabel).toContain('Move Up');
    });

    it('should prioritize pressed state over active state', () => {
      const activeDirections = new Set([Direction.DOWN]);

      render(
        <KeyboardIndicator {...defaultProps} activeDirections={activeDirections} pressedDirection={Direction.DOWN} />
      );

      const downKey = screen.getByTestId('test-keyboard-indicator-key-down');

      // Should be selected (active)
      expect(downKey.props.accessibilityState.selected).toBe(true);
      // Should have proper accessibility label
      expect(downKey.props.accessibilityLabel).toContain('Move Down');
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      render(<KeyboardIndicator {...defaultProps} />);

      const upKey = screen.getByTestId('test-keyboard-indicator-key-up');
      const container = screen.getByTestId('test-keyboard-indicator');

      expect(upKey.props.accessibilityLabel).toBe('Move Up - Keys: ↑ or W');
      expect(upKey.props.accessibilityRole).toBe('button');

      expect(container.props.accessibilityRole).toBe('group');
      expect(container.props.accessibilityLabel).toBe('Keyboard controls indicator');
    });

    it('should have different accessibility hints for compact and full modes', () => {
      const { rerender } = render(<KeyboardIndicator {...defaultProps} compact={false} />);

      let container = screen.getByTestId('test-keyboard-indicator');
      expect(container.props.accessibilityHint).toBe('Shows available keyboard controls with current state');

      rerender(<KeyboardIndicator {...defaultProps} compact={true} />);

      container = screen.getByTestId('test-keyboard-indicator');
      expect(container.props.accessibilityHint).toBe('Shows available keyboard controls');
    });
  });

  describe('Styling Props', () => {
    it('should apply custom styles', () => {
      const customStyle = { marginTop: 20, backgroundColor: 'red' };

      render(<KeyboardIndicator {...defaultProps} style={customStyle} />);

      const container = screen.getByTestId('test-keyboard-indicator');
      expect(container.props.style).toContainEqual(expect.objectContaining(customStyle));
    });

    it('should use provided testID', () => {
      render(<KeyboardIndicator {...defaultProps} testID="custom-test-id" />);

      expect(screen.getByTestId('custom-test-id')).toBeTruthy();
      expect(screen.getByTestId('custom-test-id-key-up')).toBeTruthy();
      expect(screen.getByTestId('custom-test-id-key-down')).toBeTruthy();
      expect(screen.getByTestId('custom-test-id-key-left')).toBeTruthy();
      expect(screen.getByTestId('custom-test-id-key-right')).toBeTruthy();
    });
  });

  describe('Default Props', () => {
    it('should use default props when none provided', () => {
      render(<KeyboardIndicator />);

      const container = screen.getByTestId('keyboard-indicator');
      expect(container).toBeTruthy();

      // Should render in non-compact mode by default
      expect(screen.getByText('Use arrow keys or WASD to move')).toBeTruthy();
      expect(screen.getByText('Up')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty active directions set', () => {
      render(<KeyboardIndicator {...defaultProps} activeDirections={new Set()} />);

      const upKey = screen.getByTestId('test-keyboard-indicator-key-up');
      expect(upKey.props.accessibilityState.selected).toBe(false);
    });

    it('should handle null pressed direction', () => {
      render(<KeyboardIndicator {...defaultProps} pressedDirection={null} />);

      const upKey = screen.getByTestId('test-keyboard-indicator-key-up');
      expect(upKey.props.accessibilityState.selected).toBe(false);
    });
  });
});
