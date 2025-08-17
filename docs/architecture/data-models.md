# Data Models

Define the core data models/entities that will be shared between frontend and backend. Since this is a client-only application, these models represent the game's core data structures used throughout the application.

## GameState

**Purpose:** Primary game state container that tracks the complete 2048 game session including board state, score, and game status.

**Key Attributes:**

- board: Tile[][] - 4x4 grid of tiles representing the game board
- score: number - Current game score based on tile merges
- bestScore: number - Highest score achieved across all sessions
- gameStatus: GameStatus - Current state (playing, won, lost)
- moveCount: number - Number of moves made in current session
- startTime: number - Timestamp when current game started
- lastMoveTime: number - Timestamp of most recent move

### TypeScript Interface

```typescript
interface GameState {
  board: (Tile | null)[][];
  score: number;
  bestScore: number;
  gameStatus: GameStatus;
  moveCount: number;
  startTime: number;
  lastMoveTime: number;
  canUndo: boolean;
  previousBoard?: (Tile | null)[][];
  previousScore?: number;
}
```

### Relationships

- Contains multiple Tile entities in board array
- References GameStatus enum for current state
- Persisted to SQLite for game resumption

## Tile

**Purpose:** Individual game piece representing a numbered tile on the 2048 board with position and value data.

**Key Attributes:**

- id: string - Unique identifier for tracking animations
- value: number - Tile value (2, 4, 8, 16, etc.)
- row: number - Current row position (0-3)
- col: number - Current column position (0-3)
- isNew: boolean - Flag indicating newly spawned tile
- mergedFrom: string[] - IDs of tiles that merged to create this tile

### TypeScript Interface

```typescript
interface Tile {
  id: string;
  value: number;
  row: number;
  col: number;
  isNew: boolean;
  mergedFrom?: string[];
  previousPosition?: {
    row: number;
    col: number;
  };
}
```

### Relationships

- Contained within GameState board array
- Referenced by animation system for movement tracking
- Historical references through mergedFrom array

## UserPreferences

**Purpose:** User settings and preferences that persist across app sessions including theme, haptics, and tutorial completion.

**Key Attributes:**

- theme: ThemeType - Selected color theme (Classic or Cool)
- hapticsEnabled: boolean - Haptic feedback preference (mobile only)
- tutorialCompleted: boolean - Whether user has completed tutorial
- userName: string - Optional user name for personalization
- soundEnabled: boolean - Sound effects preference (future feature)
- animationSpeed: AnimationSpeed - Animation timing preference

### TypeScript Interface

```typescript
interface UserPreferences {
  theme: ThemeType;
  hapticsEnabled: boolean;
  tutorialCompleted: boolean;
  userName?: string;
  soundEnabled: boolean;
  animationSpeed: AnimationSpeed;
  lastPlayedDate: number;
  totalGamesPlayed: number;
}
```

### Relationships

- Used by Theme Context Provider
- Persisted to SQLite for session restoration
- Referenced by Settings screen components

## GameStatistics

**Purpose:** Long-term statistics and achievements tracking across multiple game sessions for player progress.

**Key Attributes:**

- totalGamesPlayed: number - Lifetime game count
- totalScore: number - Cumulative score across all games
- averageScore: number - Calculated average score per game
- bestTileAchieved: number - Highest tile value ever reached
- totalMoves: number - Lifetime move count
- totalPlayTime: number - Cumulative time spent playing
- winCount: number - Number of games where 2048 was reached
- streakCount: number - Current consecutive games played

### TypeScript Interface

```typescript
interface GameStatistics {
  totalGamesPlayed: number;
  totalScore: number;
  averageScore: number;
  bestTileAchieved: number;
  totalMoves: number;
  totalPlayTime: number;
  winCount: number;
  streakCount: number;
  lastUpdated: number;
  achievements: Achievement[];
}
```

### Relationships

- Updated by GameState changes through Zustand store
- Persisted to SQLite for long-term tracking
- Used by future statistics/achievements screen
