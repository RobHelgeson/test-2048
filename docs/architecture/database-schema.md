# Database Schema

## SQLite Schema Design

Since this application uses expo-sqlite for local data persistence, the database schema is designed for optimal performance with game data operations and cross-platform compatibility.

### Game State Table

Stores the current and previous game states for save/restore and undo functionality.

```sql
CREATE TABLE game_states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    board_data TEXT NOT NULL,              -- JSON serialized board state
    score INTEGER NOT NULL DEFAULT 0,
    best_score INTEGER NOT NULL DEFAULT 0,
    game_status TEXT NOT NULL DEFAULT 'playing',
    move_count INTEGER NOT NULL DEFAULT 0,
    start_time INTEGER NOT NULL,           -- Unix timestamp
    last_move_time INTEGER NOT NULL,       -- Unix timestamp
    can_undo BOOLEAN NOT NULL DEFAULT FALSE,
    previous_board_data TEXT,              -- JSON serialized previous board for undo
    previous_score INTEGER,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Index for quick current game lookup
CREATE INDEX idx_game_states_current ON game_states(is_current);

-- Trigger to ensure only one current game
CREATE TRIGGER ensure_single_current_game
    BEFORE UPDATE OF is_current ON game_states
    WHEN NEW.is_current = TRUE
BEGIN
    UPDATE game_states SET is_current = FALSE WHERE is_current = TRUE;
END;
```

### User Preferences Table

Stores user settings and configuration that persists across app sessions.

```sql
CREATE TABLE user_preferences (
    id INTEGER PRIMARY KEY CHECK (id = 1),  -- Singleton table
    theme TEXT NOT NULL DEFAULT 'classic',
    haptics_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    tutorial_completed BOOLEAN NOT NULL DEFAULT FALSE,
    user_name TEXT,
    sound_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    animation_speed TEXT NOT NULL DEFAULT 'normal',
    last_played_date INTEGER,               -- Unix timestamp
    total_games_played INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Insert default preferences
INSERT OR IGNORE INTO user_preferences (id) VALUES (1);
```

### Game Statistics Table

Tracks long-term player statistics and achievements across multiple game sessions.

```sql
CREATE TABLE game_statistics (
    id INTEGER PRIMARY KEY CHECK (id = 1),  -- Singleton table
    total_games_played INTEGER NOT NULL DEFAULT 0,
    total_score INTEGER NOT NULL DEFAULT 0,
    average_score REAL NOT NULL DEFAULT 0.0,
    best_tile_achieved INTEGER NOT NULL DEFAULT 0,
    total_moves INTEGER NOT NULL DEFAULT 0,
    total_play_time INTEGER NOT NULL DEFAULT 0,  -- Seconds
    win_count INTEGER NOT NULL DEFAULT 0,
    streak_count INTEGER NOT NULL DEFAULT 0,
    last_updated INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Insert default statistics
INSERT OR IGNORE INTO game_statistics (id) VALUES (1);
```

### Achievements Table

Future-proofing for achievement system (optional for MVP).

```sql
CREATE TABLE achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    achievement_key TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT,
    target_value INTEGER NOT NULL,
    current_value INTEGER NOT NULL DEFAULT 0,
    is_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
    unlocked_at INTEGER,                    -- Unix timestamp
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Index for quick achievement lookups
CREATE INDEX idx_achievements_key ON achievements(achievement_key);
CREATE INDEX idx_achievements_unlocked ON achievements(is_unlocked);
```

### Game History Table

Optional table for storing completed game records for detailed statistics.

```sql
CREATE TABLE game_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    final_score INTEGER NOT NULL,
    highest_tile INTEGER NOT NULL,
    total_moves INTEGER NOT NULL,
    play_duration INTEGER NOT NULL,         -- Seconds
    game_status TEXT NOT NULL,              -- 'won', 'lost'
    board_snapshot TEXT,                    -- JSON final board state
    completed_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Indexes for statistics queries
CREATE INDEX idx_game_history_score ON game_history(final_score);
CREATE INDEX idx_game_history_tile ON game_history(highest_tile);
CREATE INDEX idx_game_history_date ON game_history(completed_at);
```

## Database Configuration

### Performance Optimizations

```sql
-- Enable WAL mode for better concurrent access
PRAGMA journal_mode = WAL;

-- Optimize for mobile performance
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 10000;
PRAGMA temp_store = memory;

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;
```

### Data Migration Strategy

```typescript
interface DatabaseMigration {
  version: number;
  sql: string[];
}

const migrations: DatabaseMigration[] = [
  {
    version: 1,
    sql: [
      // Initial schema creation SQL statements
    ],
  },
  {
    version: 2,
    sql: [
      // Future schema updates
      'ALTER TABLE user_preferences ADD COLUMN new_feature_enabled BOOLEAN DEFAULT FALSE;',
    ],
  },
];
```

## Data Access Patterns

### Optimized Queries

```sql
-- Get current game state (most frequent operation)
SELECT board_data, score, best_score, game_status, can_undo, previous_board_data, previous_score
FROM game_states
WHERE is_current = TRUE;

-- Update game state with undo data
UPDATE game_states
SET board_data = ?, score = ?, can_undo = ?, previous_board_data = ?, previous_score = ?,
    last_move_time = ?, move_count = ?, updated_at = strftime('%s', 'now')
WHERE is_current = TRUE;

-- Get user preferences (startup operation)
SELECT theme, haptics_enabled, tutorial_completed, user_name, sound_enabled, animation_speed
FROM user_preferences
WHERE id = 1;

-- Update statistics (after each game)
UPDATE game_statistics
SET total_games_played = total_games_played + 1,
    total_score = total_score + ?,
    average_score = (total_score + ?) / (total_games_played + 1),
    best_tile_achieved = MAX(best_tile_achieved, ?),
    total_moves = total_moves + ?,
    total_play_time = total_play_time + ?,
    win_count = win_count + ?,
    last_updated = strftime('%s', 'now')
WHERE id = 1;
```
