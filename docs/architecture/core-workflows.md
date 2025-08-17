# Core Workflows

## Game Move Execution Workflow

This sequence diagram illustrates the complete flow when a user makes a swipe gesture to move tiles on the game board.

```mermaid
sequenceDiagram
    participant User
    participant GestureHandler
    participant GameEngine
    participant AnimationController
    participant GameStore
    participant StorageManager
    participant UI

    User->>GestureHandler: Swipe gesture
    GestureHandler->>GestureHandler: Recognize direction
    GestureHandler->>GameEngine: makeMove(direction)

    GameEngine->>GameEngine: Validate move
    alt Valid move
        GameEngine->>GameEngine: Calculate new board state
        GameEngine->>GameEngine: Generate new tile
        GameEngine->>GameStore: Update game state
        GameStore->>AnimationController: Trigger tile animations
        GameStore->>UI: Update score display

        par Animations and Storage
            AnimationController->>AnimationController: animateTileMovement()
            AnimationController->>AnimationController: animateTileMerge()
            AnimationController->>AnimationController: animateNewTile()
            AnimationController->>UI: Update tile positions
        and
            GameStore->>StorageManager: saveGameState()
            StorageManager->>StorageManager: Write to SQLite
        end

        GameEngine->>GameEngine: Check win/lose conditions
        alt Game won or lost
            GameStore->>UI: Show game over modal
            GameStore->>StorageManager: updateStatistics()
        end
    else Invalid move
        GameEngine->>UI: No visual change
        Note over User,UI: Haptic feedback for invalid move
    end
```

## Application Startup and Game Loading Workflow

This diagram shows the initialization sequence when the app launches and restores previous game state.

```mermaid
sequenceDiagram
    participant App
    participant RouteManager
    participant StorageManager
    participant ThemeSystem
    participant GameStore
    participant UI

    App->>RouteManager: Initialize navigation
    App->>StorageManager: Initialize database
    StorageManager->>StorageManager: Create tables if needed

    par Load User Data
        App->>StorageManager: loadUserPreferences()
        StorageManager-->>App: UserPreferences
        App->>ThemeSystem: setTheme(preferences.theme)
    and
        App->>StorageManager: loadGameState()
        StorageManager-->>App: GameState | null
        alt Previous game exists
            App->>GameStore: restoreGameState(state)
            GameStore->>UI: Render saved game
        else No previous game
            App->>GameStore: initializeNewGame()
            GameStore->>UI: Render fresh board
        end
    end

    ThemeSystem->>UI: Apply theme colors
    RouteManager->>UI: Navigate to main screen
    UI->>User: App ready for interaction
```

## Settings Update and Persistence Workflow

This sequence demonstrates how user preference changes are handled and persisted across the application.

```mermaid
sequenceDiagram
    participant User
    participant SettingsScreen
    participant SettingsController
    participant ThemeSystem
    participant StorageManager
    participant UI

    User->>SettingsScreen: Change theme setting
    SettingsScreen->>SettingsController: updatePreference('theme', newTheme)

    SettingsController->>ThemeSystem: setTheme(newTheme)
    ThemeSystem->>ThemeSystem: Update theme state
    ThemeSystem->>UI: Apply new colors globally

    SettingsController->>StorageManager: saveUserPreferences()
    StorageManager->>StorageManager: Update SQLite

    alt Save successful
        StorageManager-->>SettingsController: Success
        SettingsController->>UI: Show success feedback
    else Save failed
        StorageManager-->>SettingsController: Error
        SettingsController->>ThemeSystem: Revert theme
        SettingsController->>UI: Show error message
    end
```

## New Game Initialization Workflow

This diagram shows the process of starting a new game, including state cleanup and initial tile placement.

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant GameEngine
    participant GameStore
    participant AnimationController
    participant StorageManager

    User->>UI: Tap "New Game" button
    UI->>GameEngine: initializeGame()

    GameEngine->>GameEngine: Reset board state
    GameEngine->>GameEngine: Generate 2 initial tiles
    GameEngine->>GameStore: setGameState(newState)

    GameStore->>StorageManager: saveGameState()
    GameStore->>AnimationController: animateNewGame()
    GameStore->>UI: Update all displays

    par Initial Animations
        AnimationController->>AnimationController: Clear previous tiles
        AnimationController->>AnimationController: animateNewTile(tile1)
        AnimationController->>AnimationController: animateNewTile(tile2)
        AnimationController->>UI: Show tile spawn effects
    and
        StorageManager->>StorageManager: Write fresh state to SQLite
        StorageManager-->>GameStore: Persistence complete
    end

    UI->>User: Game ready for play
```
