# Testing Strategy

## Testing Pyramid

Our testing strategy follows the testing pyramid approach, prioritizing fast, reliable unit tests with comprehensive coverage while including essential integration and end-to-end tests.

```text
         E2E Tests (10%)
        /              \
   Integration Tests (20%)
  /                      \
Component Tests (35%)    Game Logic Tests (35%)
```

**Test Distribution:**

- **Unit Tests (70%):** Game logic, utilities, and component testing
- **Integration Tests (20%):** Component integration and data flow
- **End-to-End Tests (10%):** Critical user journeys across platforms

## Test Organization

### Component Tests Structure

```text
__tests__/
├── components/
│   ├── game/
│   │   ├── GameBoard.test.tsx        # Game board rendering and interaction
│   │   ├── Tile.test.tsx            # Individual tile component
│   │   ├── GameHeader.test.tsx      # Score display and controls
│   │   └── GameOverModal.test.tsx   # Win/lose modal functionality
│   ├── ui/
│   │   ├── Button.test.tsx          # Generic button component
│   │   ├── Modal.test.tsx           # Base modal functionality
│   │   └── Switch.test.tsx          # Settings toggle component
│   └── themed/
│       ├── ThemedText.test.tsx      # Theme-aware text component
│       └── ThemedView.test.tsx      # Theme-aware view component
├── hooks/
│   ├── useGame.test.ts              # Game logic hook tests
│   ├── useAnimations.test.ts        # Animation management tests
│   ├── useGestures.test.ts          # Gesture handling tests
│   └── useTheme.test.ts             # Theme management tests
├── stores/
│   ├── gameStore.test.ts            # Game state management
│   ├── themeStore.test.ts           # Theme state management
│   └── settingsStore.test.ts        # Settings state management
├── services/
│   ├── gameEngine.test.ts           # Core game logic testing
│   ├── storageService.test.ts       # Database operations testing
│   └── animationService.test.ts     # Animation orchestration
└── utils/
    ├── gameUtils.test.ts            # Game utility functions
    └── themeUtils.test.ts           # Theme utility functions
```

### Integration Tests Structure

```text
__tests__/integration/
├── game-flow.test.tsx               # Complete game session flow
├── settings-persistence.test.tsx    # Settings save/load integration
├── theme-switching.test.tsx         # Theme changes across components
├── navigation.test.tsx              # Route navigation and state
└── database-integration.test.tsx    # SQLite operations integration
```

### End-to-End Tests Structure

```text
e2e/
├── game-play.e2e.ts                # Core gameplay scenarios
├── settings-management.e2e.ts      # Settings and preferences
├── app-lifecycle.e2e.ts           # App launch, background, restore
└── cross-platform.e2e.ts          # Platform-specific behavior
```

## Test Examples

### Component Test Example

```typescript
// __tests__/components/game/GameBoard.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { GameBoard } from '@/components/game/GameBoard';
import { useGameStore } from '@/stores/gameStore';

// Mock the game store
jest.mock('@/stores/gameStore');
const mockUseGameStore = useGameStore as jest.MockedFunction<
  typeof useGameStore
>;

describe('GameBoard Component', () => {
  const mockGameState = {
    board: [
      [{ id: '1', value: 2, row: 0, col: 0, isNew: false }, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ],
    score: 0,
    gameStatus: 'playing' as const,
    isAnimating: false,
  };

  const mockActions = {
    makeMove: jest.fn(),
    newGame: jest.fn(),
    setAnimating: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGameStore.mockReturnValue({
      ...mockGameState,
      ...mockActions,
    });
  });

  it('renders the game board with correct tile positions', () => {
    const { getByTestId } = render(<GameBoard />);

    const gameBoard = getByTestId('game-board');
    expect(gameBoard).toBeTruthy();

    const tile = getByTestId('tile-1');
    expect(tile).toBeTruthy();
  });

  it('handles swipe gestures correctly', async () => {
    const { getByTestId } = render(<GameBoard />);
    const gameBoard = getByTestId('game-board');

    // Simulate swipe right gesture
    fireEvent(gameBoard, 'onSwipeRight');

    await waitFor(() => {
      expect(mockActions.makeMove).toHaveBeenCalledWith('right');
    });
  });

  it('prevents moves during animations', () => {
    mockUseGameStore.mockReturnValue({
      ...mockGameState,
      ...mockActions,
      isAnimating: true,
    });

    const { getByTestId } = render(<GameBoard />);
    const gameBoard = getByTestId('game-board');

    fireEvent(gameBoard, 'onSwipeLeft');

    expect(mockActions.makeMove).not.toHaveBeenCalled();
  });
});
```

### Game Logic Test Example

```typescript
// __tests__/services/gameEngine.test.ts
import { GameEngine } from '@/services/gameEngine';
import { GameState, Tile } from '@/types/game';

describe('GameEngine', () => {
  let gameEngine: GameEngine;

  beforeEach(() => {
    gameEngine = new GameEngine();
  });

  describe('makeMove', () => {
    it('should move tiles correctly to the right', () => {
      const board = [
        [createTile(2, 0, 0), createTile(2, 0, 1), null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];

      const result = gameEngine.makeMove(board, 'right');

      expect(result.moved).toBe(true);
      expect(result.board[0][3]?.value).toBe(4); // Merged tile
      expect(result.score).toBe(4);
    });

    it('should not move when no valid moves available', () => {
      const board = [
        [
          createTile(2, 0, 0),
          createTile(4, 0, 1),
          createTile(2, 0, 2),
          createTile(4, 0, 3),
        ],
        [
          createTile(4, 1, 0),
          createTile(2, 1, 1),
          createTile(4, 1, 2),
          createTile(2, 1, 3),
        ],
        [
          createTile(2, 2, 0),
          createTile(4, 2, 1),
          createTile(2, 2, 2),
          createTile(4, 2, 3),
        ],
        [
          createTile(4, 3, 0),
          createTile(2, 3, 1),
          createTile(4, 3, 2),
          createTile(2, 3, 3),
        ],
      ];

      const result = gameEngine.makeMove(board, 'right');

      expect(result.moved).toBe(false);
      expect(result.score).toBe(0);
    });

    it('should detect win condition when 2048 tile is created', () => {
      const board = [
        [createTile(1024, 0, 0), createTile(1024, 0, 1), null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];

      const result = gameEngine.makeMove(board, 'right');

      expect(result.board[0][3]?.value).toBe(2048);
      expect(gameEngine.checkWinCondition(result.board)).toBe(true);
    });
  });

  describe('spawnRandomTile', () => {
    it('should spawn a tile in an empty position', () => {
      const board = [
        [createTile(2, 0, 0), null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];

      const newTile = gameEngine.spawnRandomTile(board);

      expect(newTile).toBeTruthy();
      expect([2, 4]).toContain(newTile!.value);
    });

    it('should return null when board is full', () => {
      const fullBoard = Array(4)
        .fill(null)
        .map((_, row) =>
          Array(4)
            .fill(null)
            .map((_, col) => createTile(2, row, col))
        );

      const newTile = gameEngine.spawnRandomTile(fullBoard);

      expect(newTile).toBeNull();
    });
  });
});

function createTile(value: number, row: number, col: number): Tile {
  return {
    id: `${row}-${col}-${value}`,
    value,
    row,
    col,
    isNew: false,
  };
}
```

### End-to-End Test Example

```typescript
// e2e/game-play.e2e.ts
import { by, device, element, expect as detoxExpect } from 'detox';

describe('Game Play E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete a basic game flow', async () => {
    // Wait for the game board to load
    await detoxExpected(element(by.id('game-board'))).toBeVisible();

    // Check initial game state
    await detoxExpect(element(by.id('current-score'))).toHaveText('0');

    // Make a series of moves
    await element(by.id('game-board')).swipe('right');
    await device.sleep(500); // Wait for animation

    await element(by.id('game-board')).swipe('down');
    await device.sleep(500);

    await element(by.id('game-board')).swipe('left');
    await device.sleep(500);

    await element(by.id('game-board')).swipe('up');
    await device.sleep(500);

    // Verify score has increased
    const scoreElement = element(by.id('current-score'));
    await detoxExpect(scoreElement).not.toHaveText('0');
  });

  it('should handle new game correctly', async () => {
    // Start a game and make some moves
    await element(by.id('game-board')).swipe('right');
    await device.sleep(500);

    // Tap new game button
    await element(by.id('new-game-button')).tap();

    // Verify game reset
    await detoxExpect(element(by.id('current-score'))).toHaveText('0');
    await detoxExpected(element(by.id('game-board'))).toBeVisible();
  });

  it('should navigate to settings and back', async () => {
    // Navigate to settings
    await element(by.id('settings-tab')).tap();
    await detoxExpected(element(by.id('settings-screen'))).toBeVisible();

    // Change theme
    await element(by.id('theme-toggle')).tap();

    // Navigate back to game
    await element(by.id('game-tab')).tap();
    await detoxExpected(element(by.id('game-board'))).toBeVisible();
  });

  it('should persist game state across app lifecycle', async () => {
    // Make some moves to create game state
    await element(by.id('game-board')).swipe('right');
    await device.sleep(500);

    // Get current score
    const initialScore = await element(by.id('current-score')).getAttributes();

    // Background and restore app
    await device.sendToHome();
    await device.sleep(2000);
    await device.launchApp({ newInstance: false });

    // Verify game state persisted
    await detoxExpected(element(by.id('game-board'))).toBeVisible();
    const restoredScore = await element(by.id('current-score')).getAttributes();
    expect(restoredScore.text).toBe(initialScore.text);
  });
});
```

## Test Configuration

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'services/**/*.{ts,tsx}',
    'stores/**/*.{ts,tsx}',
    'utils/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testEnvironment: 'jsdom',
};
```

### Detox Configuration

```json
// .detoxrc.js
module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'e2e/jest.config.js'
    },
    jest: {
      setupTimeout: 120000
    }
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/Test2048.app',
      build: 'xcodebuild -workspace ios/Test2048.xcworkspace -scheme Test2048 -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build'
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug'
    }
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 14'
      }
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_4_API_30'
      }
    }
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug'
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug'
    }
  }
};
```

## Testing Scripts

```json
// package.json scripts
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "test:e2e:ios": "detox test --configuration ios.sim.debug",
    "test:e2e:android": "detox test --configuration android.emu.debug",
    "test:e2e:build:ios": "detox build --configuration ios.sim.debug",
    "test:e2e:build:android": "detox build --configuration android.emu.debug"
  }
}
```
