# Project Structure

## Root Directory Structure
- `app/` - Expo Router file-based routing (screens and layouts)
- `components/` - Reusable UI components organized by feature
- `stores/` - Zustand stores for global state management
- `services/` - Business logic and game engine
- `hooks/` - Custom React hooks
- `types/` - TypeScript type definitions
- `utils/` - Utility functions and helpers
- `constants/` - App-wide constants (colors, themes, etc.)
- `docs/` - Comprehensive project documentation
- `__tests__/` - Test files organized by component/feature

## Component Organization
```
components/
├── game/
│   ├── GameBoard.tsx         # Main game board component
│   ├── GameHeader/           # Score display and controls
│   ├── Tile.tsx             # Individual tile component
│   └── KeyboardIndicator.tsx # Keyboard control indicator
├── ui/
│   ├── Button.tsx           # Generic button component
│   ├── StatusIndicator.tsx  # Status display component
│   └── ThemePreview.tsx     # Theme selection preview
└── themed/
    ├── ThemedText.tsx       # Theme-aware text component
    ├── ThemedView.tsx       # Theme-aware view component
    └── ThemeProvider.tsx    # Theme context provider
```

## App Structure (Expo Router)
```
app/
├── (tabs)/
│   ├── index.tsx           # Main game screen
│   ├── settings.tsx        # Settings screen
│   ├── hello-world.tsx     # Demo/test screen
│   └── _layout.tsx         # Tab navigation layout
├── modal/
│   └── _layout.tsx         # Modal layout
├── _layout.tsx             # Root layout
└── +not-found.tsx          # 404 error page
```

## Key Architecture Patterns
- **New Architecture:** Uses bridgeless mode for enhanced performance
- **File-based Routing:** Expo Router with automatically generated typed routes
- **Custom Hooks + Zustand:** Game logic in hooks interfacing with Zustand stores
- **Component-based Architecture:** Feature-based organization following Expo conventions
- **SQLite for Persistence:** Structured game data storage with transactions

## Path Aliases
- `@/*` maps to project root for clean imports
- Example: `import { GameState } from '@/types/game'`