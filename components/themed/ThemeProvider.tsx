import React, { createContext, useContext, useEffect } from 'react';
import { ThemeContextValue, ThemeType } from '@/types/theme';
import {
  useThemeStore,
  useCurrentTheme,
  useThemeColors as useStoreThemeColors,
  useThemeLoading,
  useThemeActions,
} from '@/stores/themeStore';

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: ThemeType;
}

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const currentTheme = useCurrentTheme();
  const colors = useStoreThemeColors();
  const isLoading = useThemeLoading();
  const { setTheme, toggleTheme, initializeTheme } = useThemeActions();

  // Get current theme object from store
  const theme = useThemeStore((state) => state.getCurrentTheme());

  // Initialize theme on mount
  useEffect(() => {
    // If initial theme is provided, set it
    if (initialTheme && initialTheme !== currentTheme) {
      setTheme(initialTheme).catch(console.error);
    } else {
      // Otherwise initialize from storage
      initializeTheme().catch(console.error);
    }
  }, [initialTheme]);

  const contextValue: ThemeContextValue = {
    currentTheme,
    theme,
    colors,
    setTheme,
    toggleTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use theme context
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

// Convenience hook for just colors (most common use case)
export function useThemeColors() {
  const { colors } = useTheme();
  return colors;
}

// Hook for theme type only
export function useCurrentThemeType(): ThemeType {
  const { currentTheme } = useTheme();
  return currentTheme;
}

// Hook for theme switching actions only
export function useThemeControls() {
  const { setTheme, toggleTheme } = useTheme();
  return { setTheme, toggleTheme };
}

// Hook to check if theme is loading
export function useIsThemeLoading(): boolean {
  const { isLoading } = useTheme();
  return isLoading;
}
