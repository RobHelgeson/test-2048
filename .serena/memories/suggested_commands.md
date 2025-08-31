# Essential Commands for Test 2048

## Development Server
- `npm install` - Install all dependencies
- `npx expo start` - Start development server with Metro bundler
- `npx expo start --clear` - Start with cleared Metro cache
- `npm run android` - Launch on Android emulator
- `npm run ios` - Launch on iOS simulator  
- `npm run web` - Launch web version

## Code Quality & Validation
- `npm run lint` - Run ESLint linting
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting without changes
- `npm run type-check` - Run TypeScript type checking

## Testing
- `npm test` - Run Jest unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run test:ci` - Run tests in CI mode (no watch, with coverage)

## Build & Deployment
- `npm run build:web` - Build static web export (no auth required)
- `npm run build:ios:dev` - Build iOS development build (requires EAS auth)
- `npm run build:android:dev` - Build Android development build (requires EAS auth)
- `npm run build:all:dev` - Build all platforms development builds (requires EAS auth)

## Project Management
- `npm run reset-project` - Move starter code to example and create blank app directory

## System Utilities (Darwin/macOS)
- `ls` - List directory contents
- `find . -name "*.tsx" -type f` - Find TypeScript React files
- `grep -r "pattern" .` - Search for patterns in files
- `git status` - Check git repository status
- `git log --oneline -10` - View recent commits