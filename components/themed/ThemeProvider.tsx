import { getCurrentTheme, getThemeColors, useThemeActions, useThemeStore } from '@/stores/themeStore';
import { ThemeContextValue, ThemeType } from '@/types/theme';
import React, { createContext, useContext, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Get all theme data in a single subscription with shallow equality
  const themeData = useThemeStore(
    useShallow((state) => ({
      currentTheme: state.currentTheme,
      theme: getCurrentTheme(state),
      colors: getThemeColors(state),
      isLoading: state.isLoading,
    }))
  );

  // Get stable action functions
  const actions = useThemeActions();

  const contextValue: ThemeContextValue = useMemo(
    () => ({
      currentTheme: themeData.currentTheme,
      theme: themeData.theme,
      colors: themeData.colors,
      setTheme: actions.setTheme,
      toggleTheme: actions.toggleTheme,
      isLoading: themeData.isLoading,
    }),
    [themeData, actions]
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
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
