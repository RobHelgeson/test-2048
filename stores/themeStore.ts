import { ClassicTheme } from '@/constants/themes/ClassicTheme';
import { CoolTheme } from '@/constants/themes/CoolTheme';
import { storageService } from '@/services/storageService';
import { Theme, ThemeColors, ThemeType } from '@/types/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ThemeState {
  currentTheme: ThemeType;
  isLoading: boolean;
  error: string | null;
}

interface ThemeActions {
  setTheme: (theme: ThemeType) => Promise<void>;
  toggleTheme: () => Promise<void>;
  initializeTheme: () => Promise<void>;
  getCurrentTheme: () => Theme;
  getThemeColors: () => ThemeColors;
  resetError: () => void;
}

type ThemeStore = ThemeState & ThemeActions;

const THEMES: Record<ThemeType, Theme> = {
  classic: ClassicTheme,
  cool: CoolTheme,
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentTheme: 'classic' as ThemeType,
      isLoading: false,
      error: null,

      // Actions
      setTheme: async (theme: ThemeType) => {
        set({ isLoading: true, error: null });

        try {
          // Validate theme exists
          if (!THEMES[theme]) {
            throw new Error(`Invalid theme: ${theme}`);
          }

          // Save theme to persistent storage
          await storageService.saveUserPreferences({ theme });

          // Update store state
          set({
            currentTheme: theme,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to set theme';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      toggleTheme: async () => {
        const currentTheme = get().currentTheme;
        const nextTheme: ThemeType =
          currentTheme === 'classic' ? 'cool' : 'classic';
        await get().setTheme(nextTheme);
      },

      initializeTheme: async () => {
        set({ isLoading: true, error: null });

        try {
          // Load saved theme from persistent storage
          const preferences = await storageService.loadUserPreferences();
          const savedTheme = preferences?.theme || 'classic';

          // Validate saved theme
          const theme: ThemeType = THEMES[savedTheme] ? savedTheme : 'classic';

          set({
            currentTheme: theme,
            isLoading: false,
          });
        } catch (error) {
          console.error('Failed to initialize theme:', error);
          // Fallback to classic theme on error
          set({
            currentTheme: 'classic',
            isLoading: false,
            error: 'Failed to load saved theme, using default',
          });
        }
      },

      getCurrentTheme: () => {
        const currentTheme = get().currentTheme;
        return THEMES[currentTheme];
      },

      getThemeColors: () => {
        const currentTheme = get().currentTheme;
        return THEMES[currentTheme].tokens.colors;
      },

      resetError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentTheme: state.currentTheme,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Initialize theme on app startup after hydration
          state.initializeTheme().catch(console.error);
        }
      },
    }
  )
);

// Selector hooks for performance optimization
export const useCurrentTheme = () =>
  useThemeStore((state) => state.currentTheme);
export const useThemeColors = () =>
  useThemeStore((state) => state.getThemeColors());
export const useThemeLoading = () => useThemeStore((state) => state.isLoading);
export const useThemeError = () => useThemeStore((state) => state.error);

// Theme actions
export const useThemeActions = () =>
  useThemeStore((state) => ({
    setTheme: state.setTheme,
    toggleTheme: state.toggleTheme,
    initializeTheme: state.initializeTheme,
    resetError: state.resetError,
  }));
