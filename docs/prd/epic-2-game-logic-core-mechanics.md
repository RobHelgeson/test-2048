# Epic 2: Game Logic & Core Mechanics

**Expanded Goal:** Develop a complete, testable 2048 game engine using React patterns and TypeScript. Create custom hooks and utilities that encapsulate all game logic, providing a solid foundation for UI implementation. Focus on learning React state management, custom hooks, and comprehensive testing while building the core game algorithms.

## Story 2.1: Game State Management and TypeScript Interfaces

As a developer,
I want to define comprehensive TypeScript interfaces and state management for the 2048 game,
so that I have type-safe, well-structured game data and state transitions.

### Acceptance Criteria
1. GameState interface defined with board, score, gameStatus, and metadata
2. Tile interface with position, value, and unique identifier properties
3. Direction enum for game moves (UP, DOWN, LEFT, RIGHT)
4. GameStatus enum for different game states (PLAYING, WON, LOST)
5. Board utilities with proper 4x4 grid representation using typed arrays
6. Initial state factory function with proper type annotations
7. All interfaces exported from lib/types with comprehensive JSDoc documentation

## Story 2.2: Core Game Logic Implementation

As a developer,
I want to implement the complete 2048 game algorithm with pure functions,
so that I have testable, predictable game mechanics independent of UI.

### Acceptance Criteria
1. Move function that handles all four directions with proper tile sliding logic
2. Merge function that combines tiles of equal value following 2048 rules
3. Spawn function that adds new tiles (90% chance of 2, 10% chance of 4) to random empty positions
4. Win detection when 2048 tile is created (with option to continue)
5. Game over detection when no valid moves remain
6. Score calculation that awards points equal to merged tile values
7. All functions are pure with no side effects and comprehensive unit tests

## Story 2.3: Game State Hook (useGame)

As a developer,
I want a custom useGame hook that manages game state and actions,
so that I can easily integrate game logic with React components using standard patterns.

### Acceptance Criteria
1. useGame hook using useReducer for predictable state management
2. Game actions: startNewGame, makeMove, resetGame, continueAfterWin
3. Hook returns current game state and action dispatchers
4. Move validation prevents invalid moves and provides user feedback
5. State persistence using AsyncStorage for game resume functionality (FR15)
6. Hook handles all game state transitions following the defined state machine
7. Comprehensive hook testing with React Testing Library and custom test utilities

## Story 2.4: Score and Statistics Management

As a developer,
I want score tracking and high score persistence,
so that I can provide meaningful feedback and progression tracking for players.

### Acceptance Criteria
1. Score calculation logic integrated with tile merging mechanics
2. High score tracking with AsyncStorage persistence (FR9)
3. useScore hook for score state management with current and best scores
4. Score animation states for UI feedback (points gained, new best score)
5. Score reset functionality tied to new game actions
6. Statistics tracking for learning analytics (games played, win rate, average score)
7. Comprehensive score logic testing with various game scenarios

## Story 2.5: Game Logic Integration Testing

As a developer,
I want comprehensive integration tests for the complete game engine,
so that I can ensure all game mechanics work correctly together before UI implementation.

### Acceptance Criteria
1. End-to-end game scenarios tested (full game from start to win/loss)
2. Edge case testing (full board, single tile moves, impossible moves)
3. Score calculation verification across multiple game sessions
4. State persistence testing with various game states
5. Performance testing for game logic execution (should feel snappy to users, under 100ms per move)
6. Randomness testing for tile spawning distribution verification
7. Memory leak testing for state management hooks over extended usage
