# Code Style and Conventions

## Critical Rules
- **State Management:** All game state updates must go through Zustand stores - never mutate state directly in components
- **Animation Performance:** Always use React Native Reanimated 3 with native driver for animations
- **Database Operations:** All SQLite operations must use the storageService layer
- **Gesture Handling:** Use React Native Gesture Handler for all touch interactions
- **Type Safety:** Never use 'any' type - all interfaces must be properly typed and imported from /types directory
- **Platform Checks:** Use Platform.OS sparingly - prefer universal components
- **Error Boundaries:** All async operations must include proper error handling
- **Memory Management:** Clear intervals, timeouts, and subscriptions in useEffect cleanup functions

## Naming Conventions
- **Components:** PascalCase with .tsx extension (GameBoard.tsx)
- **Hooks:** camelCase with 'use' prefix and .ts extension (useGame.ts)
- **Stores:** camelCase with 'Store' suffix (gameStore.ts)
- **Services:** camelCase with 'Service' suffix (storageService.ts)
- **Types/Interfaces:** PascalCase (GameState)
- **Constants:** SCREAMING_SNAKE_CASE (BOARD_SIZE)
- **Functions:** camelCase (makeMove)
- **Variables:** camelCase (currentScore)
- **Test IDs:** kebab-case (game-board)

## Import Order
1. React and React Native imports
2. Third-party library imports
3. Local imports using @/* path aliases

## Component Structure
1. Props interface first
2. Hooks (state, stores, navigation)
3. Local state and effects  
4. Event handlers
5. Render method

## Prettier Configuration
- Semi-colons: true
- Single quotes: true
- Print width: 120
- Tab width: 2 spaces
- Trailing commas: ES5 style
- Arrow parens: always

## TypeScript Configuration
- Strict mode enabled
- Path aliases: @/* maps to project root
- All interfaces must be properly typed