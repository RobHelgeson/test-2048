# Task Completion Checklist

## Before Committing Code
1. **Run Code Quality Checks:**
   - `npm run lint` - Ensure no ESLint errors
   - `npm run type-check` - Verify TypeScript type safety
   - `npm run format:check` - Confirm code formatting is correct

2. **Run Tests:**
   - `npm test` - Run all unit tests
   - `npm run test:coverage` - Verify test coverage meets 80% threshold
   - Ensure all tests pass

3. **Platform Testing (if applicable):**
   - Test on iOS simulator if iOS-specific changes
   - Test on Android emulator if Android-specific changes  
   - Test web platform if web-specific changes
   - Verify gestures work on actual devices when possible

4. **Performance Checks:**
   - Verify animations use React Native Reanimated 3 with native driver
   - Check for memory leaks in useEffect cleanup functions
   - Ensure no direct state mutations (all through Zustand stores)

## Code Review Checklist
- All new components follow PascalCase naming
- Hooks follow camelCase with 'use' prefix
- All TypeScript interfaces are properly typed (no 'any' types)
- Error handling is implemented for async operations
- State updates go through Zustand stores only
- Import order follows convention (React → third-party → local)
- Components organized by feature, not type

## Testing Requirements
- Unit tests for all game logic in services/gameEngine.ts
- Component tests using React Native Testing Library
- Mock Zustand stores in component tests
- Integration tests for critical user flows
- Maintain minimum 80% test coverage

## Documentation Updates (if applicable)
- Update relevant files in docs/architecture/ for architectural changes
- Update CLAUDE.md if new commands or patterns are introduced
- Document any new design patterns or conventions used