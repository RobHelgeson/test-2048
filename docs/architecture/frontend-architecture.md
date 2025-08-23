# Frontend Architecture

## Component Architecture

### Component Organization

The React Native application follows Expo Router's file-based routing conventions with feature-based component organization for scalability and maintainability.

```text
src/
├── app/                      # Expo Router pages (file-based routing)
│   ├── (tabs)/              # Tab navigation group
│   │   ├── index.tsx        # Main game screen (/)
│   │   ├── settings.tsx     # Settings screen (/settings)
│   │   └── stats.tsx        # Statistics screen (/stats)
│   ├── _layout.tsx          # Root layout with providers
│   └── +not-found.tsx       # 404 error screen
├── components/              # Reusable UI components
│   ├── game/               # Game-specific components
│   │   ├── GameBoard.tsx   # Main game board container
│   │   ├── Tile.tsx        # Individual tile component
│   │   ├── GameHeader.tsx  # Score display and controls
│   │   └── GameOverModal.tsx # Win/lose modal
│   ├── ui/                 # Generic UI components
│   │   ├── Button.tsx      # Themed button component
│   │   ├── Modal.tsx       # Base modal component
│   │   └── Switch.tsx      # Settings toggle switch
│   └── themed/             # Theme-aware components
│       ├── ThemedText.tsx  # Text with theme colors
│       └── ThemedView.tsx  # View with theme colors
├── hooks/                  # Custom React hooks
│   ├── useGame.ts         # Game logic hook
│   ├── useAnimations.ts   # Animation management hook
│   ├── useGestures.ts     # Gesture handling hook
│   └── useTheme.ts        # Theme management hook
├── stores/                # Zustand state stores
│   ├── gameStore.ts       # Game state management
│   ├── themeStore.ts      # Theme state management
│   └── settingsStore.ts   # Settings state management
├── services/              # Business logic services
│   ├── gameEngine.ts      # Core game logic
│   ├── storageService.ts  # SQLite data operations
│   └── animationService.ts # Animation orchestration
├── types/                 # TypeScript type definitions
│   ├── game.ts           # Game-related types
│   ├── theme.ts          # Theme-related types
│   └── navigation.ts     # Navigation types
└── constants/            # App constants
    ├── Colors.ts         # Theme color definitions
    ├── Animations.ts     # Animation configurations
    └── Game.ts           # Game configuration constants
```

### Component Template

Standard component structure following React Native and TypeScript best practices with theme integration.

```typescript
import React from 'react';
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { ThemedView } from '@/components/themed/ThemedView';
import { ThemedText } from '@/components/themed/ThemedText';

interface ComponentProps {
  title: string;
  variant?: 'primary' | 'secondary';
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export function ComponentTemplate({
  title,
  variant = 'primary',
  onPress,
  disabled = false,
  style,
}: ComponentProps) {
  const theme = useTheme();

  const dynamicStyles = createStyles(theme.colors, variant, disabled);

  return (
    <ThemedView style={[dynamicStyles.container, style]}>
      <ThemedText style={dynamicStyles.title}>{title}</ThemedText>
    </ThemedView>
  );
}

const createStyles = (colors: any, variant: string, disabled: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor:
        variant === 'primary' ? colors.primary : colors.secondary,
      opacity: disabled ? 0.6 : 1.0,
      borderRadius: 8,
      padding: 16,
    } as ViewStyle,
    title: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    } as TextStyle,
  });
```

## State Management Architecture

### State Structure

Zustand stores are organized by domain with clear separation of concerns and type-safe interfaces.

```typescript
// Game Store - Core game state management
interface GameState {
  board: (Tile | null)[][];
  score: number;
  bestScore: number;
  gameStatus: 'playing' | 'won' | 'lost';
  moveCount: number;
  canUndo: boolean;
  isAnimating: boolean;
}

interface GameActions {
  makeMove: (direction: Direction) => void;
  newGame: () => void;
  undoMove: () => void;
  updateScore: (points: number) => void;
  setAnimating: (animating: boolean) => void;
  saveGame: () => Promise<void>;
  loadGame: () => Promise<void>;
}

export const useGameStore = create<GameState & GameActions>()((set, get) => ({
  // State
  board: createEmptyBoard(),
  score: 0,
  bestScore: 0,
  gameStatus: 'playing',
  moveCount: 0,
  canUndo: false,
  isAnimating: false,

  // Actions
  makeMove: direction => {
    const currentState = get();
    if (currentState.isAnimating) return;

    const newState = gameEngine.processMove(currentState, direction);
    set(newState);
  },

  newGame: () => {
    set({
      board: gameEngine.initializeBoard(),
      score: 0,
      gameStatus: 'playing',
      moveCount: 0,
      canUndo: false,
    });
  },

  // Additional actions...
}));

// Theme Store - UI theming state
interface ThemeState {
  currentTheme: ThemeType;
  colors: ThemeColors;
  isDark: boolean;
}

interface ThemeActions {
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState & ThemeActions>()((set, get) => ({
  currentTheme: 'classic',
  colors: classicTheme,
  isDark: false,

  setTheme: theme => {
    const colors = getThemeColors(theme);
    set({ currentTheme: theme, colors, isDark: theme.includes('dark') });
  },

  toggleTheme: () => {
    const current = get().currentTheme;
    const newTheme = current === 'classic' ? 'cool' : 'classic';
    get().setTheme(newTheme);
  },
}));
```

### State Management Patterns

- **Single Source of Truth:** Each domain has one Zustand store as the authoritative state source
- **Immutable Updates:** All state updates use immutable patterns to prevent unintended mutations
- **Computed Properties:** Derived state calculated in selectors rather than stored redundantly
- **Action-Based Updates:** All state changes happen through well-defined action methods
- **Async Action Handling:** Promise-based actions for database operations with proper error handling
- **State Persistence:** Automatic persistence to SQLite for game state and user preferences
- **Optimistic Updates:** UI updates immediately with database sync happening asynchronously
- **State Normalization:** Complex nested data structures normalized for efficient updates
- **Selective Subscriptions:** Components subscribe only to specific state slices they need

## Routing Architecture

### Route Organization

File-based routing structure using Expo Router v3 with automatic type generation and deep linking support.

```text
app/
├── _layout.tsx              # Root layout with global providers
├── +not-found.tsx           # Global 404 fallback
├── (tabs)/                  # Tab navigation group
│   ├── _layout.tsx         # Tab navigator configuration
│   ├── index.tsx           # Game screen (/) - default tab
│   ├── settings.tsx        # Settings screen (/settings)
│   ├── stats.tsx           # Statistics screen (/stats)
│   └── about.tsx           # About screen (/about)
├── modal/                  # Modal presentation group
│   ├── game-over.tsx       # Game over modal (/modal/game-over)
│   └── tutorial.tsx        # Tutorial modal (/modal/tutorial)
└── [...missing].tsx        # Dynamic 404 for unmatched routes
```

### Navigation Patterns

Type-safe navigation using Expo Router's generated types and navigation hooks.

```typescript
// Type-safe navigation with generated types
import { router } from 'expo-router';
import type { AppRoutes } from '@/types/navigation';

// Navigation functions with type safety
export const navigationService = {
  navigateToSettings: () => router.push('/settings'),
  navigateToStats: () => router.push('/stats'),
  openGameOverModal: (score: number) =>
    router.push(`/modal/game-over?score=${score}`),
  openTutorial: () => router.push('/modal/tutorial'),
  goBack: () => router.back(),
  canGoBack: () => router.canGoBack(),
};

// Route parameters extraction with type safety
import { useLocalSearchParams } from 'expo-router';

interface GameOverParams {
  score: string;
  highestTile?: string;
}

export function GameOverModal() {
  const { score, highestTile } = useLocalSearchParams<GameOverParams>();

  return (
    // Modal content using typed parameters
  );
}
```

## Frontend Services Layer

### Data Service Architecture

Since this is a client-only application, the services layer handles local data operations, game logic, and device APIs.

```typescript
// Storage Service - SQLite data operations
class StorageService {
  private db: SQLiteDatabase;

  async saveGameState(state: GameState): Promise<void> {
    try {
      await this.db.runAsync(
        'UPDATE game_states SET board_data = ?, score = ?, updated_at = ? WHERE is_current = TRUE',
        [JSON.stringify(state.board), state.score, Date.now()]
      );
    } catch (error) {
      console.error('Failed to save game state:', error);
      throw new Error('Game save failed');
    }
  }

  async loadGameState(): Promise<GameState | null> {
    try {
      const result = await this.db.getFirstAsync<any>(
        'SELECT board_data, score, best_score FROM game_states WHERE is_current = TRUE'
      );

      if (!result) return null;

      return {
        board: JSON.parse(result.board_data),
        score: result.score,
        bestScore: result.best_score,
        // ... other properties
      };
    } catch (error) {
      console.error('Failed to load game state:', error);
      return null;
    }
  }
}

// Game Engine Service - Core game logic
class GameEngineService {
  makeMove(board: Board, direction: Direction): MoveResult {
    const newBoard = this.cloneBoard(board);
    const moved = this.processDirection(newBoard, direction);

    if (!moved) {
      return { board, moved: false, score: 0, mergedTiles: [] };
    }

    const newTile = this.spawnRandomTile(newBoard);
    const score = this.calculateScore(moved.mergedTiles);

    return {
      board: newBoard,
      moved: true,
      score,
      mergedTiles: moved.mergedTiles,
      newTile,
    };
  }

  checkWinCondition(board: Board): boolean {
    return board.some(row => row.some(tile => tile && tile.value >= 2048));
  }

  checkLoseCondition(board: Board): boolean {
    return !this.hasEmptySpace(board) && !this.hasValidMoves(board);
  }
}

// Animation Service - Reanimated 3 integration
class AnimationService {
  animateTileMovement(tileId: string, fromPosition: Position, toPosition: Position): Promise<void> {
    return new Promise(resolve => {
      const translateX = useSharedValue(fromPosition.x);
      const translateY = useSharedValue(fromPosition.y);

      translateX.value = withSpring(toPosition.x, animationConfig, () => {
        translateY.value = withSpring(toPosition.y, animationConfig, () => {
          runOnJS(resolve)();
        });
      });
    });
  }

  animateTileMerge(tiles: Tile[]): Promise<void> {
    return new Promise(resolve => {
      const scale = useSharedValue(1);

      scale.value = withSequence(
        withSpring(1.2, animationConfig),
        withSpring(1.0, animationConfig, () => {
          runOnJS(resolve)();
        })
      );
    });
  }
}
```
