# Technical Assumptions

## Repository Structure: Monorepo

Single repository following Expo's recommended structure:
- **app/** - File-based routing directory with layouts and navigation
- **components/** - Reusable UI components and game board elements
- **lib/** - Core game logic, hooks, and utilities (shareable modules)
- **assets/** - Images, fonts, and static resources
- **Root config files** - app.config.ts, tsconfig.json, metro.config.js stay at root

This follows Expo Router's file-based routing conventions while maintaining clean separation of concerns. The structure supports learning Expo's patterns without deviating from their best practices.

## Service Architecture

**Monolith with Component-Based Architecture** - Single deployable application using React Native's component model. Game logic encapsulated in custom hooks (`useGame`, `useScore`, `useTheme`). No backend services for MVP, all state managed locally. This approach prioritizes learning React patterns over distributed system complexity.

## Testing Requirements

**Unit + Integration Testing Pyramid** - Unit tests for game logic and utility functions using Jest. Integration tests for critical user flows (new game, swipe, game over). Component testing with React Native Testing Library. Manual testing convenience methods for rapid development iteration. Documentation of testing decisions for learning retention.

## Additional Technical Assumptions and Requests

- **Framework:** Expo SDK 50+ with managed workflow for maximum learning leverage
- **Language:** TypeScript with strict mode enabled for comprehensive type safety learning
- **Styling:** React Native StyleSheet with TypeScript support for platform-optimized styles
- **State Management:** React Context + useReducer for game state (learning built-in patterns before external libraries)
- **Navigation:** Expo Router for file-based routing and deep linking capabilities
- **Animation Library:** React Native Reanimated 3 for performant gesture-driven animations
- **Gesture Handling:** React Native Gesture Handler for platform-optimized touch handling
- **Build System:** EAS Build configured from Epic 1 for all platforms
- **Development Tools:** Expo Dev Client for enhanced debugging capabilities
- **Code Quality:** Strict ESLint configuration with TypeScript rules, Prettier, and React Native plugins
- **ESLint Rules:** @typescript-eslint/parser, @typescript-eslint/eslint-plugin, eslint-plugin-react-native with strict rules
- **TypeScript Config:** Extends "expo/tsconfig.base" with strict compiler options enabled
- **StyleSheet Linting:** react-native/no-unused-styles and react-native/no-inline-styles enforcement
- **Documentation:** Inline JSDoc comments for all public APIs and complex logic
- **Performance Monitoring:** React DevTools Profiler during development
- **Version Control:** Git with conventional commits for clear history
- **CI/CD:** GitHub Actions for automated testing and EAS Build triggers
