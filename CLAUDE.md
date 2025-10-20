# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Test 2048 is a cross-platform 2048 puzzle game built with Expo SDK 53+ and React Native, serving as a comprehensive learning project for modern mobile development. The project uses the New Architecture (bridgeless mode) and targets iOS, Android, and web platforms from a single codebase.

## Commands

### Development Commands

- `npm install` - Install dependencies
- `npx expo start` - Start development server with Metro bundler
- `npx expo start --clear` - Start with cleared Metro cache
- `npm run android` - Launch on Android emulator
- `npm run ios` - Launch on iOS simulator
- `npm run web` - Launch web version

### Code Quality

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

### Testing

- `npm test` - Run Jest unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Build Commands

- `npm run build:web` - Build static web export (no auth required)
- `npm run build:ios:dev` - Build iOS development build (requires EAS auth)
- `npm run build:android:dev` - Build Android development build (requires EAS auth)
- `npm run build:all:dev` - Build all platforms development builds (requires EAS auth)

**Note:** Mobile builds require EAS CLI authentication (`eas login`) and project configuration.

## Architecture

### Technology Stack

- **Frontend:** React Native 0.76+ with New Architecture enabled
- **Framework:** Expo SDK 53.0.20 with EAS Build
- **Language:** TypeScript 5.3+ with strict mode
- **State Management:** Zustand 5.0+ for lightweight global state
- **Database:** expo-sqlite 18.1+ for local game persistence
- **Navigation:** Expo Router v3.5+ with typed file-based routing
- **Animations:** React Native Reanimated 3.15+ with native driver
- **Gestures:** React Native Gesture Handler 2.18+ for touch interactions
- **Testing:** Jest + React Native Testing Library

### Project Structure

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

### Key Patterns

- **New Architecture:** Uses bridgeless mode for enhanced performance
- **File-based Routing:** Expo Router with automatically generated typed routes
- **Custom Hooks + Zustand:** Game logic in hooks interfacing with Zustand stores
- **Component-based Architecture:** Feature-based organization following Expo conventions
- **SQLite for Persistence:** Structured game data storage with transactions

### Important Configuration

- **Path Aliases:** `@/*` maps to project root for imports
- **New Architecture:** Enabled via `newArchEnabled: true` in app.config.ts
- **TypeScript:** Strict mode with comprehensive type safety
- **Bundle Identifiers:**
  - Production: `com.rvh.test2048`
  - Preview: `com.rvh.test2048.preview`
  - Development: `com.rvh.test2048.dev`

## Development Guidelines

### Code Style

- Use TypeScript strict mode for all new code
- Follow Expo Router conventions for file-based routing
- Organize components by feature, not by type
- Use Zustand for global state, React state for local component state
- Implement animations with React Native Reanimated 3 and native driver
- Use expo-sqlite for any persistent data storage

### Testing Requirements

- Write unit tests for game logic in `services/gameEngine.ts`
- Test React components with React Native Testing Library
- Mock Zustand stores in component tests
- Maintain test coverage above 80% for critical paths
- Use `jest.setup.js` for test environment configuration

### Platform Considerations

- Code must work across iOS, Android, and web platforms
- Use platform-specific styling when necessary
- Test gesture handling on actual devices when possible
- Ensure responsive design for different screen sizes
- Consider performance implications of animations across platforms

### Documentation

- All major architectural decisions are documented in `docs/architecture/`
- Game requirements and specifications are in `docs/prd/`
- Build and deployment processes are in `docs/BUILD_PROCESS.md`
- This is a learning project - document implementation decisions thoroughly

## Deployment

### Web Deployment

- Web builds generate static files in `dist/` directory
- Can be deployed to any static hosting service (Vercel, Netlify, etc.)
- No authentication required for web builds

### Mobile Deployment

- Uses EAS Build for iOS and Android builds
- Requires EAS CLI authentication: `eas login`
- Development builds support Expo Dev Client for enhanced development
- Multiple environment support via different bundle identifiers

### Updates

- Expo Updates configured for over-the-air updates
- Different channels for development, preview, and production
- Runtime version policy based on app version

## Known Issues & Considerations

- Mobile builds require EAS authentication setup
- Game logic is currently in placeholder state (marked with TODO comments)
- New Architecture requires React Native 0.76+ compatibility
- Platform-specific gesture handling may require device testing
- SQLite migrations should be handled carefully for data persistence

## Learning Focus Areas

This project prioritizes educational value in:

- Expo ecosystem mastery through practical implementation
- React Native patterns and performance optimization
- Cross-platform development and platform-specific considerations
- Complete deployment pipeline from development to production
- Modern React Native architecture patterns with New Architecture
- If you attempt to run the server, and it's already running, don't kill the other server. If you can do your work from that server, do so. if you need a new server (for instance you need to see the logs) then start a new server without killing the existing one.
