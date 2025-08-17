# API Specification

## No External APIs Required

**Architecture Decision:** This 2048 game implementation is designed as a fully client-side application with no backend dependencies. All game logic, state management, and data persistence occurs locally on the device.

**Rationale for API-Free Architecture:**

- **Simplicity:** Eliminates server infrastructure complexity and maintenance
- **Performance:** Zero network latency for all game interactions
- **Offline Support:** Game works completely offline without internet connectivity
- **Privacy:** No user data transmitted or stored externally
- **Cost Efficiency:** No server hosting or API management costs
- **Deployment Speed:** Single-build deployment across all platforms

## Internal Data Layer APIs

While no external APIs exist, the application uses internal data access patterns through Zustand stores and SQLite interfaces:

### Game State Store Interface

```typescript
interface GameStore {
  // State getters
  getGameState: () => GameState;
  getCurrentScore: () => number;
  getBestScore: () => number;

  // Game actions
  makeMove: (direction: Direction) => void;
  newGame: () => void;
  undoMove: () => void;

  // Persistence
  saveGame: () => Promise<void>;
  loadGame: () => Promise<GameState | null>;
}
```

### SQLite Data Access Layer

```typescript
interface GameDatabase {
  // Game state persistence
  saveGameState: (state: GameState) => Promise<void>;
  loadGameState: () => Promise<GameState | null>;

  // Statistics management
  updateStatistics: (stats: Partial<GameStatistics>) => Promise<void>;
  getStatistics: () => Promise<GameStatistics>;

  // User preferences
  savePreferences: (prefs: UserPreferences) => Promise<void>;
  loadPreferences: () => Promise<UserPreferences>;
}
```

### Theme System Interface

```typescript
interface ThemeStore {
  currentTheme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  getThemeColors: () => ThemeColors;
  toggleTheme: () => void;
}
```

These internal interfaces provide type-safe data access patterns throughout the application while maintaining the client-only architecture principle.
