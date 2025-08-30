require('@testing-library/jest-native/extend-expect');

// Suppress React Native warnings for tests
console.warn = jest.fn();
console.error = jest.fn();

// Mock Expo modules
jest.mock('expo-constants', () => ({
  expoConfig: {
    name: 'test-2048',
    slug: 'test-2048',
  },
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => false),
  })),
  useLocalSearchParams: jest.fn(() => ({})),
  usePathname: jest.fn(() => '/'),
  useSegments: jest.fn(() => []),
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => false),
  },
  Stack: {
    Screen: 'Screen',
  },
  Tabs: {
    Screen: 'Screen',
  },
}));

// Mock React Native components and modules
jest.mock('react-native', () => {
  const mockReact = require('react');
  return {
    Platform: {
      OS: 'ios',
      select: jest.fn((config) => config.ios),
    },
    Dimensions: {
      get: jest.fn(() => ({
        width: 375,
        height: 812,
        scale: 2,
        fontScale: 1,
      })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    View: mockReact.forwardRef((props, ref) => mockReact.createElement('View', { ...props, ref })),
    Text: mockReact.forwardRef((props, ref) => mockReact.createElement('Text', { ...props, ref })),
    Pressable: mockReact.forwardRef((props, ref) => mockReact.createElement('Pressable', { ...props, ref })),
    ScrollView: mockReact.forwardRef((props, ref) => mockReact.createElement('ScrollView', { ...props, ref })),
    TouchableOpacity: mockReact.forwardRef((props, ref) => {
      return mockReact.createElement('TouchableOpacity', {
        ...props,
        ref,
        testID: props.testID,
      });
    }),
    StyleSheet: {
      create: (styles) => styles,
      absoluteFill: {},
      flatten: (style) => style,
      compose: (style1, style2) => [style1, style2],
      hairlineWidth: 1,
    },
    useWindowDimensions: jest.fn(() => ({ width: 400, height: 800 })),
  };
});

// Mock themed components globally
jest.mock('@/components/themed/ThemedText', () => ({
  ThemedText: ({ children, testID, style, ...props }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID, style, ...props }, children);
  },
  ThemedHeading: ({ children, testID, style, ...props }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID, style, ...props }, children);
  },
  ThemedSubheading: ({ children, testID, style, ...props }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID, style, ...props }, children);
  },
  ThemedBody: ({ children, testID, style, ...props }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID, style, ...props }, children);
  },
  ThemedCaption: ({ children, testID, style, ...props }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID, style, ...props }, children);
  },
  ThemedScore: ({ children, testID, style, ...props }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID, style, ...props }, children);
  },
  ThemedTileText: ({ children, testID, style, ...props }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID, style, ...props }, children);
  },
  ThemedButtonText: ({ children, testID, style, ...props }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID, style, ...props }, children);
  },
  ThemedLink: ({ children, testID, style, ...props }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID, style, ...props }, children);
  },
}));

// Mock themed view component globally
jest.mock('@/components/themed/ThemedView', () => ({
  ThemedView: ({ children, testID, style, ...props }) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID, style, ...props }, children);
  },
}));

// Mock theme provider and hooks globally
const mockThemeColors = {
  accent: '#007AFF',
  surface: '#f5f5f5',
  text: '#000000',
  textOnPrimary: '#ffffff',
  textSecondary: '#666666',
  primary: '#007AFF',
  secondary: '#5856D6',
  background: '#ffffff',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  textDisabled: '#999999',
  surfaceDisabled: '#e0e0e0',
  border: '#e5e5e7',
  shadow: '#000000',
  gameBackground: '#faf8ef',
  tilePlaceholder: '#cdc1b4',
  tileBackground: '#bbada0',
  tile2: '#eee4da',
  tile4: '#ede0c8',
  tile8: '#f2b179',
  tile16: '#f59563',
  tile32: '#f67c5f',
  tile64: '#f65e3b',
  tile128: '#edcf72',
  tile256: '#edcc61',
  tile512: '#edc850',
  tile1024: '#edc53f',
  tile2048: '#edc22e',
  tileSuper: '#3c3a32',
};

jest.mock('@/components/themed/ThemeProvider', () => ({
  ThemeProvider: ({ children }) => {
    const React = require('react');
    return children;
  },
  useTheme: jest.fn(() => ({
    theme: {
      tokens: {
        typography: {
          fontFamily: {
            regular: 'System',
            medium: 'System',
            bold: 'System',
          },
        },
      },
    },
  })),
  useThemeColors: jest.fn(() => mockThemeColors),
  useThemeControls: jest.fn(() => ({
    setTheme: jest.fn(),
    toggleTheme: jest.fn(),
  })),
  useCurrentThemeType: jest.fn(() => 'classic'),
  useIsThemeLoading: jest.fn(() => false),
  useTileColor: jest.fn(() => (value) => {
    const colorMap = {
      2: '#eee4da',
      4: '#ede0c8',
      8: '#f2b179',
      16: '#f59563',
      32: '#f67c5f',
      64: '#f65e3b',
      128: '#edcf72',
      256: '#edcc61',
      512: '#edc850',
      1024: '#edc53f',
      2048: '#edc22e',
    };
    return colorMap[value] || '#3c3a32';
  }),
  useTileTextColor: jest.fn(() => (value) => {
    return value <= 4 ? '#776e65' : '#ffffff';
  }),
}));

// Mock the hook file directly too
jest.mock('@/hooks/useTheme', () => ({
  useTheme: jest.fn(() => ({
    theme: {
      tokens: {
        typography: {
          fontFamily: {
            regular: 'System',
            medium: 'System',
            bold: 'System',
          },
        },
      },
    },
  })),
  useThemeColors: jest.fn(() => mockThemeColors),
  useThemeControls: jest.fn(() => ({
    setTheme: jest.fn(),
    toggleTheme: jest.fn(),
  })),
  useCurrentThemeType: jest.fn(() => 'classic'),
  useIsThemeLoading: jest.fn(() => false),
  useTileColor: jest.fn(() => (value) => {
    const colorMap = {
      2: '#eee4da',
      4: '#ede0c8',
      8: '#f2b179',
      16: '#f59563',
      32: '#f67c5f',
      64: '#f65e3b',
      128: '#edcf72',
      256: '#edcc61',
      512: '#edc850',
      1024: '#edc53f',
      2048: '#edc22e',
    };
    return colorMap[value] || '#3c3a32';
  }),
  useTileTextColor: jest.fn(() => (value) => {
    return value <= 4 ? '#776e65' : '#ffffff';
  }),
  usePlatformTheme: jest.fn(() => mockThemeColors),
  useIsDarkTheme: jest.fn(() => false),
  useThemedStyles: jest.fn(() => (styleCreator) => styleCreator(mockThemeColors)),
}));

// Global test setup
beforeEach(() => {
  // Don't clear all mocks to preserve theme hook implementations
  // Only clear mock call history but keep implementations
  jest.clearAllTimers();
});
