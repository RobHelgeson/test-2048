import { ClassicTheme } from '@/constants/themes/ClassicTheme';
import { CoolTheme } from '@/constants/themes/CoolTheme';
import { Theme, ThemeColors, ThemeType } from '@/types/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

interface ThemeState {
  currentTheme: ThemeType;
  isLoading: boolean;
  error: string | null;
}

interface ThemeActions {
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
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

      // Actions - simplified, synchronous operations only
      setTheme: (theme: ThemeType) => {
        if (!THEMES[theme]) {
          set({ error: `Invalid theme: ${theme}` });
          return;
        }
        set({ currentTheme: theme, isLoading: false, error: null });
      },

      toggleTheme: () => {
        const currentTheme = get().currentTheme;
        const nextTheme: ThemeType = currentTheme === 'classic' ? 'cool' : 'classic';
        set({ currentTheme: nextTheme });
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
      // Let persist middleware handle hydration automatically - no manual intervention
    }
  )
);

// External selector functions (not in store to avoid recreating)
export const getCurrentTheme = (state: ThemeStore): Theme => {
  return THEMES[state.currentTheme];
};

export const getThemeColors = (state: ThemeStore): ThemeColors => {
  return THEMES[state.currentTheme].tokens.colors;
};

// Selector hooks for performance optimization
export const useCurrentTheme = () => useThemeStore((state) => state.currentTheme);

export const useThemeColors = () => useThemeStore((state) => getThemeColors(state));

export const useThemeLoading = () => useThemeStore((state) => state.isLoading);

export const useThemeError = () => useThemeStore((state) => state.error);

// Theme actions - using useShallow for stable references
export const useThemeActions = () =>
  useThemeStore(
    useShallow((state) => ({
      setTheme: state.setTheme,
      toggleTheme: state.toggleTheme,
      resetError: state.resetError,
    }))
  );
