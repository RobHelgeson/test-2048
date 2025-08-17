# Coding Standards

## Critical Fullstack Rules

These are the essential standards that all AI agents and developers must follow to prevent common mistakes and ensure consistency across the React Native application.

- **State Management Consistency:** All game state updates must go through Zustand stores - never mutate state directly in components
- **Animation Performance:** Always use React Native Reanimated 3 with native driver for animations - avoid JavaScript-based animations
- **Database Operations:** All SQLite operations must use the storageService layer - never access expo-sqlite directly from components
- **Gesture Handling:** Use React Native Gesture Handler for all touch interactions - avoid onPress for swipe gestures
- **Type Safety:** Never use 'any' type - all interfaces must be properly typed and imported from /types directory
- **Platform Checks:** Use Platform.OS sparingly and only for platform-specific features - prefer universal components
- **Error Boundaries:** All async operations must include proper error handling and user feedback
- **Memory Management:** Clear intervals, timeouts, and subscriptions in useEffect cleanup functions
- **Asset Management:** All images and static assets must be imported through require() or asset imports - no hardcoded paths
- **Navigation Consistency:** Use Expo Router's typed navigation - never access navigation object directly without type safety

## Naming Conventions

| Element               | Convention               | Example                  | Notes                     |
| --------------------- | ------------------------ | ------------------------ | ------------------------- |
| Components            | PascalCase               | `GameBoard.tsx`          | React component files     |
| Hooks                 | camelCase with 'use'     | `useGame.ts`             | Custom React hooks        |
| Stores                | camelCase with 'Store'   | `gameStore.ts`           | Zustand store files       |
| Services              | camelCase with 'Service' | `storageService.ts`      | Business logic services   |
| Types/Interfaces      | PascalCase               | `GameState`              | TypeScript definitions    |
| Constants             | SCREAMING_SNAKE_CASE     | `BOARD_SIZE`             | Application constants     |
| Functions             | camelCase                | `makeMove`               | Function and method names |
| Variables             | camelCase                | `currentScore`           | Local variables           |
| Files/Directories     | kebab-case               | `game-over.tsx`          | File and folder names     |
| Test IDs              | kebab-case               | `game-board`             | TestID attributes         |
| Environment Variables | SCREAMING_SNAKE_CASE     | `EXPO_PUBLIC_DEBUG_MODE` | .env variables            |

## Code Organization Standards

### Import Order

```typescript
// 1. React and React Native imports
import React from 'react';
import { View, Text } from 'react-native';

// 2. Third-party library imports
import { useRouter } from 'expo-router';
import { useSharedValue } from 'react-native-reanimated';

// 3. Local imports (relative paths)
import { useGameStore } from '@/stores/gameStore';
import { GameEngine } from '@/services/gameEngine';
import { Button } from '@/components/ui/Button';
import { GameState } from '@/types/game';
```

### Component Structure

```typescript
// Props interface first
interface ComponentProps {
  title: string;
  onPress?: () => void;
}

// Component implementation
export function ComponentName({ title, onPress }: ComponentProps) {
  // 1. Hooks (state, stores, navigation)
  const gameStore = useGameStore();
  const router = useRouter();

  // 2. Local state and effects
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    // Effect implementation
    return () => {
      // Cleanup
    };
  }, []);

  // 3. Event handlers
  const handlePress = () => {
    onPress?.();
  };

  // 4. Render
  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
}
```

### File Naming Standards

- **Components:** PascalCase with `.tsx` extension
- **Hooks:** camelCase starting with 'use' and `.ts` extension
- **Services:** camelCase ending with 'Service' and `.ts` extension
- **Types:** camelCase and `.ts` extension
- **Tests:** Same name as file being tested with `.test.tsx` or `.test.ts`
- **Stories:** Same name as component with `.stories.tsx` (if using Storybook)

## Performance Standards

### Component Optimization

```typescript
// Use React.memo for expensive components
export const ExpensiveComponent = React.memo(({ data }: Props) => {
  return <ComplexVisualization data={data} />;
});

// Use useMemo for expensive calculations
const expensiveValue = React.useMemo(() => {
  return heavyComputation(data);
}, [data]);

// Use useCallback for event handlers passed to children
const handlePress = React.useCallback(() => {
  doSomething();
}, [dependency]);
```

### Animation Standards

```typescript
// Always use native driver for animations
const animatedValue = useSharedValue(0);

// Use worklets for performance-critical operations
const animateToPosition = () => {
  'worklet';
  animatedValue.value = withSpring(targetValue);
};

// Batch animations when possible
const animateMovement = () => {
  'worklet';
  translateX.value = withSpring(newX);
  translateY.value = withSpring(newY);
  scale.value = withSpring(newScale);
};
```

## Error Handling Standards

### Async Operations

```typescript
// Always wrap async operations in try-catch
const saveGameState = async (state: GameState) => {
  try {
    await storageService.saveGameState(state);
  } catch (error) {
    console.error('Failed to save game:', error);
    // Show user-friendly error message
    showErrorMessage('Failed to save game progress');
  }
};

// Use proper error boundaries for components
class GameErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Game error:', error, errorInfo);
    // Log to error service if available
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}
```

### User Feedback

```typescript
// Provide immediate feedback for user actions
const handleMove = (direction: Direction) => {
  if (gameStore.isAnimating) {
    // Provide haptic feedback for invalid moves
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    return;
  }

  gameStore.makeMove(direction);
};

// Show loading states for async operations
const [isSaving, setIsSaving] = React.useState(false);

const saveGame = async () => {
  setIsSaving(true);
  try {
    await gameStore.saveGame();
    showSuccessMessage('Game saved!');
  } catch (error) {
    showErrorMessage('Failed to save game');
  } finally {
    setIsSaving(false);
  }
};
```

## Security Standards

### Data Validation

```typescript
// Validate all external data
const validateGameState = (state: unknown): state is GameState => {
  if (!state || typeof state !== 'object') return false;

  const s = state as any;
  return (
    Array.isArray(s.board) &&
    typeof s.score === 'number' &&
    s.score >= 0 &&
    ['playing', 'won', 'lost'].includes(s.gameStatus)
  );
};

// Sanitize user inputs
const sanitizeUserName = (name: string): string => {
  return name
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .substring(0, 50); // Limit length
};
```

### Secure Storage

```typescript
// Use expo-secure-store for sensitive data
import * as SecureStore from 'expo-secure-store';

const storeSecurely = async (key: string, value: string) => {
  try {
    await SecureStore.setItemAsync(key, value, {
      requireAuthentication: false,
    });
  } catch (error) {
    console.error('Secure storage failed:', error);
    // Fallback to regular storage for non-sensitive data
  }
};
```

## Testing Standards

### Test Organization

```typescript
// Group related tests using describe blocks
describe('GameEngine', () => {
  describe('makeMove', () => {
    it('should move tiles correctly', () => {
      // Test implementation
    });

    it('should handle invalid moves', () => {
      // Test implementation
    });
  });

  describe('checkWinCondition', () => {
    it('should detect win when 2048 is reached', () => {
      // Test implementation
    });
  });
});

// Use descriptive test names
it('should merge two tiles with same value and update score', () => {
  // Test implementation
});

// Use setup and teardown appropriately
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  cleanup();
});
```

### Mock Standards

```typescript
// Mock external dependencies
jest.mock('@/services/storageService', () => ({
  saveGameState: jest.fn(),
  loadGameState: jest.fn(),
}));

// Use typed mocks
const mockStorageService = storageService as jest.Mocked<typeof storageService>;

beforeEach(() => {
  mockStorageService.saveGameState.mockResolvedValue();
  mockStorageService.loadGameState.mockResolvedValue(mockGameState);
});
```
