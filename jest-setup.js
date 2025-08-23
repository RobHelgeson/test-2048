// jest-setup.js

// Basic Expo mocks
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Stack: ({ children }) => children,
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
