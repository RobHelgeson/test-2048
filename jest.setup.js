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
    View: mockReact.forwardRef((props, ref) =>
      mockReact.createElement('View', { ...props, ref })
    ),
    Text: mockReact.forwardRef((props, ref) =>
      mockReact.createElement('Text', { ...props, ref })
    ),
    Pressable: mockReact.forwardRef((props, ref) =>
      mockReact.createElement('Pressable', { ...props, ref })
    ),
    ScrollView: mockReact.forwardRef((props, ref) =>
      mockReact.createElement('ScrollView', { ...props, ref })
    ),
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
  };
});

// Global test setup
beforeEach(() => {
  jest.clearAllMocks();
});
