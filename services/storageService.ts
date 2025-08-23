import { GameState } from '@/types';

// Placeholder storage service - will use expo-sqlite in future stories
class StorageService {
  async saveGameState(state: GameState): Promise<void> {
    // TODO: Implement SQLite storage in future story
    console.log('Saving game state:', state);
  }

  async loadGameState(): Promise<GameState | null> {
    // TODO: Implement SQLite loading in future story
    console.log('Loading game state');
    return null;
  }

  async clearGameState(): Promise<void> {
    // TODO: Implement SQLite clearing in future story
    console.log('Clearing game state');
  }
}

export const storageService = new StorageService();
