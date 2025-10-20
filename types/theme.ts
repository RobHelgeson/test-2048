export type ThemeType = 'classic' | 'cool';

export interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  surfaceVariant: string;

  // Text colors
  text: string;
  textSecondary: string;
  textOnPrimary: string;

  // UI colors
  primary: string;
  primaryVariant: string;
  secondary: string;
  accent: string;

  // Game board colors
  gameBackground: string;
  tilePlaceholder: string;
  tileBackground: string;

  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Border and shadow colors
  border: string;
  shadow: string;

  // Tile progression colors (2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048+)
  tile2: string;
  tile4: string;
  tile8: string;
  tile16: string;
  tile32: string;
  tile64: string;
  tile128: string;
  tile256: string;
  tile512: string;
  tile1024: string;
  tile2048: string;
  tileSuper: string;
}

export interface TypographyTokens {
  // Font families
  fontFamily: {
    regular: string;
    medium: string;
    bold: string;
  };

  // Font sizes based on 8pt grid
  fontSize: {
    xs: number; // 12pt
    sm: number; // 14pt
    base: number; // 16pt
    lg: number; // 18pt
    xl: number; // 20pt
    '2xl': number; // 24pt
    '3xl': number; // 30pt
    '4xl': number; // 36pt
    '5xl': number; // 48pt
  };

  // Line heights
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };

  // Font weights
  fontWeight: {
    normal: '400';
    medium: '500';
    semibold: '600';
    bold: '700';
  };
}

export interface SpacingTokens {
  // 8pt grid system multipliers
  xs: number; // 4pt (0.5x)
  sm: number; // 8pt (1x)
  base: number; // 12pt (1.5x)
  md: number; // 16pt (2x)
  lg: number; // 24pt (3x)
  xl: number; // 32pt (4x)
  '2xl': number; // 48pt (6x)
  '3xl': number; // 64pt (8x)
}

export interface BorderRadiusTokens {
  none: number;
  sm: number;
  base: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface ShadowTokens {
  sm: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  base: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  lg: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

export interface AnimationTokens {
  duration: {
    fast: number;
    normal: number;
    slow: number;
  };
  easing: {
    linear: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
}

export interface DesignTokens {
  colors: ThemeColors;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  borderRadius: BorderRadiusTokens;
  shadows: ShadowTokens;
  animations: AnimationTokens;
}

export interface Theme {
  type: ThemeType;
  name: string;
  description: string;
  tokens: DesignTokens;
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    colorBlindFriendly: boolean;
  };
}

export interface ThemeContextValue {
  currentTheme: ThemeType;
  theme: Theme;
  colors: ThemeColors;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
  isLoading: boolean;
}

export interface ThemeStorageData {
  selectedTheme: ThemeType;
  accessibility?: {
    highContrast?: boolean;
    reducedMotion?: boolean;
  };
}

// Utility types for styled components
export type ThemedStyleProp<T> = T | ((theme: ThemeColors) => T);

// Platform-specific theme overrides
export interface PlatformThemeOverrides {
  ios?: Partial<DesignTokens>;
  android?: Partial<DesignTokens>;
  web?: Partial<DesignTokens>;
}

// Color contrast validation
export interface ColorContrastResult {
  ratio: number;
  level: 'AA' | 'AAA' | 'fail';
  passes: boolean;
}

// Theme preview data for settings
export interface ThemePreviewData {
  type: ThemeType;
  name: string;
  colors: {
    primary: string;
    background: string;
    tilePreview: string[];
  };
}
