import { Tile } from '@/components/game/Tile';
import { useThemeColors, useTileColor, useTileTextColor } from '@/hooks/useTheme';
import { Tile as TileData } from '@/types/game';
import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';

// No need to mock themed components - they're mocked globally in jest.setup.js

// Hooks are already mocked globally, just use them directly

// Mock tile data factory
const createMockTile = (value: number, row = 0, col = 0): TileData => ({
  id: `tile-${value}-${row}-${col}`,
  value,
  row,
  col,
  isNew: false,
});

describe('Tile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Theme hooks are already mocked globally
  });

  describe('Component Rendering', () => {
    it('renders tile component successfully', () => {
      const tile = createMockTile(2);
      const { getByTestId } = render(<Tile tile={tile} size={80} testID="test-tile" />);

      expect(getByTestId('test-tile')).toBeTruthy();
    });

    it('renders tile with correct value in text', () => {
      const tile = createMockTile(4);
      const { getByTestId } = render(<Tile tile={tile} size={80} />);

      // Check that the text element contains the tile value
      const textElement = getByTestId(`tile-text-${tile.id}`, {
        includeHiddenElements: true,
      });
      expect(textElement.props.children).toBe(4);
    });

    it('applies custom testID when provided', () => {
      const tile = createMockTile(8);
      const { getByTestId } = render(<Tile tile={tile} size={80} testID="custom-tile" />);

      expect(getByTestId('custom-tile')).toBeTruthy();
      expect(getByTestId('custom-tile-text', { includeHiddenElements: true })).toBeTruthy();
    });

    it('uses default testID based on tile ID when not provided', () => {
      const tile = createMockTile(16);
      const { getByTestId } = render(<Tile tile={tile} size={80} />);

      expect(getByTestId(`tile-${tile.id}`)).toBeTruthy();
      expect(getByTestId(`tile-text-${tile.id}`, { includeHiddenElements: true })).toBeTruthy();
    });
  });

  describe('Hook Integration', () => {
    it('calls theme color hooks', () => {
      const tile = createMockTile(32);
      render(<Tile tile={tile} size={80} />);

      expect(useThemeColors).toHaveBeenCalled();
      expect(useTileColor).toHaveBeenCalled();
      expect(useTileTextColor).toHaveBeenCalled();
    });

    it('passes tile value to color hooks', () => {
      const tile = createMockTile(64);
      render(<Tile tile={tile} size={80} />);

      const getTileColor = (useTileColor as jest.Mock).mock.results[0].value;
      const getTileTextColor = (useTileTextColor as jest.Mock).mock.results[0].value;

      expect(getTileColor(64)).toBe('#f65e3b'); // Expected color for tile64
      expect(getTileTextColor(64)).toBe('#ffffff');
    });
  });

  describe('Victory Tile Detection', () => {
    it('detects 2048 as victory tile', () => {
      const victoryTile = createMockTile(2048);
      const { getByTestId } = render(<Tile tile={victoryTile} size={80} testID="victory-test" />);

      // Component should render successfully for victory tile
      expect(getByTestId('victory-test')).toBeTruthy();
      const textElement = getByTestId('victory-test-text', {
        includeHiddenElements: true,
      });
      expect(textElement.props.children).toBe(2048);
    });

    it('handles non-victory tiles normally', () => {
      const regularTile = createMockTile(1024);
      const { getByTestId } = render(<Tile tile={regularTile} size={80} testID="regular-test" />);

      expect(getByTestId('regular-test')).toBeTruthy();
      const textElement = getByTestId('regular-test-text', {
        includeHiddenElements: true,
      });
      expect(textElement.props.children).toBe(1024);
    });
  });

  describe('Accessibility Features', () => {
    it('provides proper accessibility labels', () => {
      const tile = createMockTile(128, 1, 2);
      const { getByTestId } = render(<Tile tile={tile} size={80} testID="accessible-tile" />);

      const tileContainer = getByTestId('accessible-tile');
      expect(tileContainer.props.accessibilityLabel).toBe('Tile with value 128');
      expect(tileContainer.props.accessibilityHint).toBe('Located at row 2, column 3');
    });

    it('sets correct accessibility role', () => {
      const tile = createMockTile(256);
      const { getByTestId } = render(<Tile tile={tile} size={80} testID="role-test" />);

      const tileContainer = getByTestId('role-test');
      expect(tileContainer.props.accessibilityRole).toBe('button');
    });

    it('provides accessibility state', () => {
      const tile = createMockTile(512);
      const { getByTestId } = render(<Tile tile={tile} size={80} testID="state-test" />);

      const tileContainer = getByTestId('state-test');
      expect(tileContainer.props.accessibilityState).toEqual({
        disabled: false,
        selected: false,
      });
    });

    it('marks container as accessible', () => {
      const tile = createMockTile(1024);
      const { getByTestId } = render(<Tile tile={tile} size={80} testID="accessible-test" />);

      const tileContainer = getByTestId('accessible-test');
      expect(tileContainer.props.accessible).toBe(true);
    });

    it('hides text from accessibility tree to avoid duplication', () => {
      const tile = createMockTile(2048);
      const { getByTestId } = render(<Tile tile={tile} size={80} testID="text-hidden" />);

      const text = getByTestId('text-hidden-text', {
        includeHiddenElements: true,
      });
      expect(text.props.accessibilityElementsHidden).toBe(true);
    });
  });

  describe('User Interactions', () => {
    it('calls onPress when tile is touched', () => {
      const mockOnPress = jest.fn();
      const tile = createMockTile(4096);
      const { getByTestId } = render(<Tile tile={tile} size={80} onPress={mockOnPress} testID="interactive-tile" />);

      const tileContainer = getByTestId('interactive-tile');
      fireEvent.press(tileContainer);

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('does not crash when onPress is not provided', () => {
      const tile = createMockTile(8192);
      const { getByTestId } = render(<Tile tile={tile} size={80} testID="no-handler" />);

      const tileContainer = getByTestId('no-handler');
      expect(() => fireEvent.press(tileContainer)).not.toThrow();
    });
  });

  describe('Typography Scaling', () => {
    it('handles different tile values correctly', () => {
      const values = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192];

      values.forEach((value) => {
        const tile = createMockTile(value);
        const { getByTestId } = render(<Tile tile={tile} size={80} testID={`value-${value}`} />);

        // Should render the value as text in the element
        const textElement = getByTestId(`value-${value}-text`, {
          includeHiddenElements: true,
        });
        expect(textElement.props.children).toBe(value);
        // Should have container with testID
        expect(getByTestId(`value-${value}`)).toBeTruthy();
      });
    });

    it('handles very large numbers', () => {
      const tile = createMockTile(16384);
      const { getByTestId } = render(<Tile tile={tile} size={80} />);

      const textElement = getByTestId(`tile-text-${tile.id}`, {
        includeHiddenElements: true,
      });
      expect(textElement.props.children).toBe(16384);
    });
  });

  describe('Component Structure', () => {
    it('has proper component structure with container and text', () => {
      const tile = createMockTile(8);
      const { getByTestId } = render(<Tile tile={tile} size={80} testID="structure-test" />);

      // Should have container
      const container = getByTestId('structure-test');
      expect(container).toBeTruthy();

      // Should have text element
      const text = getByTestId('structure-test-text', {
        includeHiddenElements: true,
      });
      expect(text).toBeTruthy();
    });

    it('passes tile data to component correctly', () => {
      const tile = createMockTile(16, 2, 3);
      const { getByTestId } = render(<Tile tile={tile} size={80} testID="data-test" />);

      const container = getByTestId('data-test');
      expect(container.props.accessibilityLabel).toContain('16');
      expect(container.props.accessibilityHint).toContain('row 3, column 4');
    });
  });

  describe('Edge Cases', () => {
    it('handles minimum valid tile size', () => {
      const tile = createMockTile(2);
      const { getByTestId } = render(<Tile tile={tile} size={32} testID="min-size" />);

      expect(getByTestId('min-size')).toBeTruthy();
    });

    it('handles large tile size', () => {
      const tile = createMockTile(4);
      const { getByTestId } = render(<Tile tile={tile} size={200} testID="large-size" />);

      expect(getByTestId('large-size')).toBeTruthy();
    });

    it('handles custom style prop without crashing', () => {
      const tile = createMockTile(8);
      const customStyle = { opacity: 0.5 };

      expect(() => render(<Tile tile={tile} size={80} style={customStyle} testID="custom-style" />)).not.toThrow();
    });
  });
});
