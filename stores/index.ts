// Public store API exports
// This file exports the public API for game state management
// Components should only use the exported hooks, not the internal stores

// Public hook API - use this in components
export { useGame } from '@/hooks/useGame';

// Internal store exports (for internal use only)
// useGameStore is kept internal and should not be imported directly by components
// export { useGameStore } from './gameStore'; // Commented out to prevent direct usage
