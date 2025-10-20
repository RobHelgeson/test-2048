/**
 * Type definitions export barrel for the 2048 game application.
 *
 * This module provides comprehensive TypeScript interfaces, enums, and utility types
 * for the entire 2048 game ecosystem. All game-related types are centralized here
 * for consistent usage throughout the application.
 *
 * ## Game Type System
 *
 * The game type system consists of several core categories:
 *
 * ### Core Game Types
 * - `GameState` - Complete game state with board, scoring, and metadata
 * - `Tile` - Individual tile representation with position and animation support
 * - `Board` - 4x4 game grid type alias for tile placement
 *
 * ### Enums
 * - `Direction` - Movement directions (UP, DOWN, LEFT, RIGHT)
 * - `GameStatus` - Game states (PLAYING, WON, LOST)
 *
 * ### Utility Types
 * - `Position` - Board coordinate representation
 * - `EmptyPosition` - Vacant cell position tracking
 * - `InitialGameStateFactory` - Factory function for game initialization
 *
 * ### UI Types
 * - Component prop interfaces for React components
 * - Theme and styling type definitions
 *
 * @example
 * ```typescript
 * import { GameState, Direction, Tile, GameStatus } from '@/types';
 *
 * const gameState: GameState = {
 *   board: [[null, null, null, null], ...],
 *   score: 1024,
 *   gameStatus: GameStatus.PLAYING,
 *   // ... other properties
 * };
 *
 * const tile: Tile = {
 *   id: 'tile-123',
 *   value: 2,
 *   row: 0,
 *   col: 1,
 *   isNew: true
 * };
 * ```
 *
 * @author James (Full Stack Developer)
 * @version 2.1.0
 */

// Export all game-related types
export * from './game';

// Export all UI-related types
export * from './ui';
