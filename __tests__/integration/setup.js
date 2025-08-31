/**
 * Integration test setup configuration
 * Extended configuration for integration tests with performance monitoring
 */

import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage for integration tests
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock React Native modules for cross-platform testing
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Global test utilities for integration tests
global.createTestBoard = (config = {}) => {
  const { rows = 4, cols = 4, tiles = [] } = config;
  const board = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null));

  tiles.forEach(({ row, col, value, id }) => {
    board[row][col] = {
      id: id || `test-tile-${row}-${col}`,
      value,
      row,
      col,
      isNew: false,
    };
  });

  return board;
};

// Performance monitoring utilities
global.measureAsync = async (name, asyncOperation) => {
  const startTime = performance.now();
  const result = await asyncOperation();
  const endTime = performance.now();
  const duration = endTime - startTime;

  console.log(`${name} took ${duration.toFixed(2)}ms`);

  return { result, duration };
};

// Statistical test utilities for randomness verification
global.runStatisticalTest = (generator, iterations = 1000) => {
  const results = [];
  for (let i = 0; i < iterations; i++) {
    results.push(generator());
  }
  return results;
};

// Memory usage tracking for memory leak tests
global.trackMemoryUsage = () => {
  if (typeof global.gc === 'function') {
    global.gc();
  }

  return {
    heapUsed: process.memoryUsage().heapUsed,
    heapTotal: process.memoryUsage().heapTotal,
    external: process.memoryUsage().external,
  };
};

// Cleanup utilities for integration tests
global.cleanupIntegrationTest = async () => {
  // Clear all AsyncStorage data
  await mockAsyncStorage.clear();

  // Clear all timers and intervals
  jest.clearAllTimers();
  jest.clearAllMocks();

  // Force garbage collection if available
  if (typeof global.gc === 'function') {
    global.gc();
  }
};

// Extended timeout for integration tests
jest.setTimeout(10000);

// Console suppression for cleaner test output (can be disabled for debugging)
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  // Suppress expected error messages in tests
  console.error = (message, ...args) => {
    if (
      typeof message === 'string' &&
      (message.includes('Warning:') || message.includes('Failed to') || message.includes('Invalid'))
    ) {
      return;
    }
    originalConsoleError(message, ...args);
  };

  console.warn = (message, ...args) => {
    if (typeof message === 'string' && message.includes('Warning:')) {
      return;
    }
    originalConsoleWarn(message, ...args);
  };
});

afterEach(() => {
  // Restore console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});
