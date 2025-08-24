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
jest.mock('react-native', () => ({
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
  View: 'View',
  Text: 'Text',
  Pressable: 'Pressable',
  ScrollView: 'ScrollView',
  StyleSheet: {
    create: (styles) => styles,
    absoluteFill: {},
    flatten: (style) => style,
    compose: (style1, style2) => [style1, style2],
  },
}));

// Global test setup
beforeEach(() => {
  jest.clearAllMocks();
});
