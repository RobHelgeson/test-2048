# useGame Hook Implementation Analysis

## Overview
The `useGame` hook is a comprehensive React hook that provides the primary API for managing 2048 game state and actions. It implements a layered architecture using useReducer for state management, provides persistence through SQLite, and handles loading states with move validation.

## Architecture Pattern
- **State Management**: Uses `useReducer` with `gameReducer` function
- **Persistence**: Integrates with `storageService` for automatic save/load
- **Performance**: Uses `useCallback` for action creators to prevent unnecessary re-renders
- **Error Handling**: Graceful error handling for persistence failures

## Exported Types and Interfaces

### GameAction Interface
```typescript
interface GameAction {
  type: 'START_NEW_GAME' | 'MAKE_MOVE' | 'RESET_GAME' | 'CONTINUE_AFTER_WIN' | 'SET_ANIMATING' | 'LOAD_GAME';
  payload?: {
    direction?: Direction;
    isAnimating?: boolean;
    gameState?: GameState;
  };
}
```

### UseGameReturn Interface (Public API)
```typescript
interface UseGameReturn {
  gameState: GameState;           // Complete game state
  actions: {                      // Action creators
    startNewGame: () => void;
    makeMove: (direction: Direction) => void;
    resetGame: () => void;
    continueAfterWin: () => void;
  };
  isLoading: boolean;            // Loading state for persistence operations
  canMove: boolean;              // Computed property for move validation
}
```

## Action Creators (Public API Methods)

### Core Actions
1. **startNewGame()**: `() => void`
   - Dispatches `START_NEW_GAME` action
   - Preserves bestScore from current state
   - Creates fresh initial board with two starting tiles

2. **makeMove(direction)**: `(direction: Direction) => void`
   - Validates move using `validateMove()` function
   - Dispatches `MAKE_MOVE` action with direction payload
   - Delegates actual move processing to `gameEngine.processMove()`

3. **resetGame()**: `() => void`
   - Dispatches `RESET_GAME` action
   - Identical to startNewGame (preserves bestScore)

4. **continueAfterWin()**: `() => void`
   - Dispatches `CONTINUE_AFTER_WIN` action
   - Changes gameStatus from WON back to PLAYING

## Persistence Logic Flow

### Automatic Save/Load with StorageService
1. **Load on Initialization** (useEffect dependency: [])
   - Sets `isLoading = true`
   - Calls `storageService.loadGameState()`
   - Dispatches `LOAD_GAME` action if persisted state exists
   - Gracefully continues with initial state if loading fails
   - Sets `isLoading = false`

2. **Auto-save on State Changes** (useEffect dependency: [gameState, isLoading])
   - Only saves when `moveCount > 0` and `!isLoading`
   - Prevents saving during initialization
   - Uses `storageService.saveGameState(gameState)`
   - Graceful error handling - gameplay continues if save fails

### StorageService Integration
- **saveGameState(state)**: JSON serialization to AsyncStorage
- **loadGameState()**: JSON deserialization with validation
- **Data Validation**: `validateGameState()` ensures data integrity
- **Error Recovery**: Falls back to initial state if corrupted data

## Loading State Management

### isLoading State
- **Purpose**: Prevents actions during persistence operations
- **Initialization**: `useState(false)` 
- **Loading Triggers**: Only during initial game state loading
- **Impact on canMove**: `canMove = gameStatus !== GameStatus.LOST && !isLoading`

### Move Validation Logic
```typescript
function validateMove(gameState: GameState, _direction: Direction): boolean {
  // Prevent moves when game is over
  if (gameState.gameStatus === GameStatus.LOST) {
    return false;
  }
  // Allow all moves when game is active (delegates to game engine)
  return true;
}
```

## Game State Initialization

### Helper Functions
1. **createEmptyBoard()**: Creates 4x4 grid filled with null
2. **generateTileId()**: Creates unique tile identifiers using timestamp + random
3. **createInitialTiles()**: Spawns 2 tiles at fixed positions (0,0) and (3,3) with 90% chance of value 2
4. **createInitialGameState()**: Assembles complete initial GameState

### Board Setup
- **Size**: Fixed 4x4 grid
- **Initial Tiles**: Always 2 tiles at opposite corners
- **Values**: 90% chance value=2, 10% chance value=4
- **Metadata**: Sets timestamps, moveCount=0, score=0

## Game Reducer Pattern

### Reducer Actions
1. **START_NEW_GAME**: Reset to initial state, preserve bestScore
2. **MAKE_MOVE**: Delegate to `processMove(state, direction)`  
3. **RESET_GAME**: Identical to START_NEW_GAME
4. **CONTINUE_AFTER_WIN**: Set gameStatus to PLAYING
5. **SET_ANIMATING**: Reserved for future animation state
6. **LOAD_GAME**: Replace entire state with loaded data

### State Immutability
- All actions return new state objects
- Uses object spread for state updates
- Preserves bestScore across game resets

## Dependencies

### External Services
- **gameEngine.processMove()**: Core move logic implementation
- **storageService**: Persistence layer with SQLite backend

### React Dependencies  
- **useReducer**: State management
- **useEffect**: Lifecycle management for persistence
- **useCallback**: Performance optimization for actions
- **useState**: Local loading state

## Error Handling Strategy

### Graceful Degradation
- Persistence failures don't break gameplay
- Corrupted save data falls back to initial state  
- Console logging for debugging
- Continue gameplay even if save/load fails

### Validation
- `validateGameState()` ensures data integrity
- Type checking for all persistence operations
- Boundary checks for scores and move counts

## Performance Considerations

### Optimization Patterns
- `useCallback` for all action creators prevents unnecessary re-renders
- Conditional saving (only when moveCount > 0 and !isLoading)
- Minimal state updates in reducer

### Re-render Triggers
- gameState changes trigger consuming components
- isLoading changes during initialization only
- canMove is computed property (no separate state)

## Current Architecture Issues (Duplication Analysis)

### Duplication with useGameStore
Both `useGame` and `useGameStore` implement:
- Board initialization logic (`createEmptyBoard`, `createInitialBoard`)  
- Game state structure (board, score, gameStatus, etc.)
- Move processing delegation to game engine
- Reset/initialization functionality

### Key Differences
- **useGame**: Has persistence, loading states, comprehensive API
- **useGameStore**: Zustand-based, no persistence, simpler API
- **useGame**: useReducer pattern with actions
- **useGameStore**: Direct state updates

## Migration Considerations

### Features to Preserve
1. **Complete Public API**: All action creators and return interface
2. **Persistence Integration**: Automatic save/load with graceful error handling  
3. **Loading State Management**: isLoading during initialization
4. **Move Validation**: Current validation logic
5. **Performance Optimizations**: useCallback action creators
6. **Error Recovery**: Graceful degradation on persistence failures
7. **bestScore Preservation**: Across game resets
8. **Initialization Logic**: Two-tile spawn pattern and positioning