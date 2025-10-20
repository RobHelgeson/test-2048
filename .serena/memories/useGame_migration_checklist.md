# useGame Migration Checklist

## Public API Preservation (CRITICAL)

### UseGameReturn Interface - Must Preserve Exactly
- [ ] `gameState: GameState` - Complete game state access
- [ ] `actions.startNewGame: () => void` - Start new game action
- [ ] `actions.makeMove: (direction: Direction) => void` - Move action with direction
- [ ] `actions.resetGame: () => void` - Reset current game action  
- [ ] `actions.continueAfterWin: () => void` - Continue after winning action
- [ ] `isLoading: boolean` - Loading state for persistence operations
- [ ] `canMove: boolean` - Computed move validation state

### Action Creator Signatures - Must Match Exactly
- [ ] `startNewGame()` - No parameters, void return
- [ ] `makeMove(direction: Direction)` - Single Direction parameter, void return
- [ ] `resetGame()` - No parameters, void return  
- [ ] `continueAfterWin()` - No parameters, void return

## Core Functionality Requirements

### State Management
- [ ] useReducer pattern with GameAction types
- [ ] Immutable state updates
- [ ] bestScore preservation across resets
- [ ] Support for all GameAction types:
  - [ ] START_NEW_GAME
  - [ ] MAKE_MOVE  
  - [ ] RESET_GAME
  - [ ] CONTINUE_AFTER_WIN
  - [ ] SET_ANIMATING (reserved)
  - [ ] LOAD_GAME

### Game Initialization
- [ ] createEmptyBoard() - 4x4 grid with null values
- [ ] generateTileId() - Unique tile ID generation
- [ ] createInitialTiles() - Two tiles at (0,0) and (3,3) positions
- [ ] createInitialGameState() - Complete initial state assembly
- [ ] 90% chance value=2, 10% chance value=4 for initial tiles

### Move Validation  
- [ ] validateMove() function behavior
- [ ] Prevent moves when gameStatus === LOST
- [ ] Allow moves for PLAYING and WON states
- [ ] Integration with isLoading state in canMove calculation

## Persistence Integration (CRITICAL)

### Automatic Save/Load
- [ ] Load persisted state on hook initialization (useEffect with [] deps)
- [ ] Auto-save on state changes (useEffect with [gameState, isLoading] deps)  
- [ ] Save only when moveCount > 0 and !isLoading
- [ ] storageService.loadGameState() integration
- [ ] storageService.saveGameState() integration

### Loading State Management
- [ ] isLoading starts as false
- [ ] Set true during initial load operation
- [ ] Set false after load completes (success or failure)
- [ ] Prevent saves during loading
- [ ] Impact canMove calculation: !isLoading && gameStatus !== LOST

### Error Handling
- [ ] Graceful failure for save operations (log error, continue game)
- [ ] Graceful failure for load operations (use initial state)
- [ ] Console error logging for debugging
- [ ] No game interruption on persistence failures

## Performance Optimizations

### useCallback Implementation
- [ ] startNewGame wrapped in useCallback with [] deps
- [ ] makeMove wrapped in useCallback with [gameState] deps  
- [ ] resetGame wrapped in useCallback with [] deps
- [ ] continueAfterWin wrapped in useCallback with [] deps

### Computed Properties
- [ ] canMove derived from gameStatus and isLoading
- [ ] No separate state for canMove

## Integration Requirements

### External Dependencies
- [ ] gameEngine.processMove() delegation for MAKE_MOVE actions
- [ ] storageService integration for all persistence operations
- [ ] GameState, Direction, GameStatus type imports from @/types/game

### Component Compatibility
- [ ] Hook return type matches existing component usage
- [ ] Action creators maintain same call signatures
- [ ] State structure compatible with existing components

## Data Migration (If Needed)

### Existing Save Data
- [ ] Ensure saved game states remain compatible
- [ ] Handle any schema changes gracefully  
- [ ] Validate loaded state structure
- [ ] Fallback to initial state for invalid data

## Testing Checklist

### Unit Tests
- [ ] All action creators produce correct actions
- [ ] Reducer handles all action types correctly
- [ ] State initialization matches current behavior
- [ ] Move validation logic preserved
- [ ] Loading state transitions work correctly

### Integration Tests  
- [ ] Persistence save/load cycles work end-to-end
- [ ] Error handling doesn't break game flow
- [ ] Component integration maintains existing behavior
- [ ] Performance characteristics maintained

### Edge Cases
- [ ] Corrupted save data recovery
- [ ] Storage permission failures  
- [ ] Network connectivity issues (if applicable)
- [ ] Rapid consecutive moves (race conditions)

## Rollback Plan

### Fallback Strategy
- [ ] Keep existing useGame.ts as useGame.backup.ts
- [ ] Document exact revert steps
- [ ] Test rollback procedure
- [ ] Monitor for regressions after deployment

## Architecture Consolidation Goals

### Single Source of Truth
- [ ] Components use only useGame hook
- [ ] useGameStore eliminated or relegated to internal storage
- [ ] No duplication between hook and store logic

### Layered Architecture  
- [ ] useGame provides public API layer
- [ ] Internal store handles pure state management
- [ ] Clear separation of concerns between layers
- [ ] Persistence remains in useGame layer