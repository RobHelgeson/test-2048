import { render, RenderOptions } from '@testing-library/react-native';
import React from 'react';
import { View } from 'react-native';

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withProviders?: boolean;
}

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(View, { testID: 'test-provider-wrapper' }, children);
};

export const customRender = (ui: React.ReactElement, options?: CustomRenderOptions) => {
  const { withProviders = true, ...renderOptions } = options || {};
  const wrapper = withProviders ? AllTheProviders : undefined;
  return render(ui, { wrapper, ...renderOptions });
};

// Mock store creators for Zustand
export const createMockStore = <T extends object>(initialState: T) => {
  let state = { ...initialState };

  const mockStore = {
    getState: () => state,
    setState: (newState: Partial<T> | ((state: T) => Partial<T>)) => {
      if (typeof newState === 'function') {
        state = { ...state, ...newState(state) };
      } else {
        state = { ...state, ...newState };
      }
    },
    subscribe: jest.fn(),
    destroy: jest.fn(),
  };

  return mockStore;
};

// Common test data generators
export const generateMockGameState = () => ({
  board: [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 2, 0],
    [0, 0, 0, 4],
  ],
  score: 0,
  gameStatus: 'playing' as const,
  canUndo: false,
});

// Mock router utilities
export const createMockRouter = () => ({
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(() => false),
  setParams: jest.fn(),
  navigate: jest.fn(),
});

// Test ID helpers
export const getTestId = (component: string, element?: string): string => {
  return element ? `${component}-${element}` : component;
};

// Animation test utilities
export const mockAnimationCallbacks = () => ({
  onStart: jest.fn(),
  onFinish: jest.fn(),
  onCancel: jest.fn(),
});

// Event simulation helpers
export const createMockGesture = (type: 'swipe' | 'tap' = 'tap') => ({
  nativeEvent: {
    x: 100,
    y: 100,
    absoluteX: 100,
    absoluteY: 100,
    translationX: type === 'swipe' ? 50 : 0,
    translationY: type === 'swipe' ? 0 : 0,
    velocityX: type === 'swipe' ? 100 : 0,
    velocityY: type === 'swipe' ? 0 : 0,
    state: type === 'swipe' ? 5 : 4, // END or BEGAN
    oldState: type === 'swipe' ? 4 : 2,
  },
});

// Re-export everything from testing library
export * from '@testing-library/react-native';
export { customRender as render };
