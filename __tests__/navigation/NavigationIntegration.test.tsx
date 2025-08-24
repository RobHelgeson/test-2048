import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { fireEvent, render, waitFor } from '../test-utils';

// Mock component that uses navigation
const MockNavigationComponent = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View>
      <Text testID="current-path">{pathname}</Text>
      <Pressable
        testID="navigate-settings"
        onPress={() => router.push('/settings')}
      >
        <Text>Go to Settings</Text>
      </Pressable>
      <Pressable testID="navigate-back" onPress={() => router.back()}>
        <Text>Back</Text>
      </Pressable>
    </View>
  );
};

// Mock the router hooks
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

describe('Navigation Integration', () => {
  let mockRouter: ReturnType<typeof useRouter>;

  beforeEach(() => {
    mockRouter = {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      canGoBack: jest.fn(() => true),
      setParams: jest.fn(),
    } as any;

    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (usePathname as jest.Mock).mockReturnValue('/');
  });

  describe('Navigation Actions', () => {
    it('should navigate to settings when button is pressed', async () => {
      const { getByTestId } = render(<MockNavigationComponent />);

      const settingsButton = getByTestId('navigate-settings');
      fireEvent.press(settingsButton);

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/settings');
      });
    });

    it('should go back when back button is pressed', async () => {
      const { getByTestId } = render(<MockNavigationComponent />);

      const backButton = getByTestId('navigate-back');
      fireEvent.press(backButton);

      await waitFor(() => {
        expect(mockRouter.back).toHaveBeenCalled();
      });
    });

    it('should display current pathname', () => {
      (usePathname as jest.Mock).mockReturnValue('/settings');

      const { getByTestId } = render(<MockNavigationComponent />);

      const pathDisplay = getByTestId('current-path');
      expect(pathDisplay).toHaveTextContent('/settings');
    });
  });

  describe('Router Hook Behavior', () => {
    it('should provide navigation methods', () => {
      expect(mockRouter).toHaveProperty('push');
      expect(mockRouter).toHaveProperty('replace');
      expect(mockRouter).toHaveProperty('back');
      expect(mockRouter).toHaveProperty('canGoBack');
    });

    it('should handle canGoBack state correctly', () => {
      expect(mockRouter.canGoBack()).toBe(true);

      mockRouter.canGoBack = jest.fn(() => false);
      expect(mockRouter.canGoBack()).toBe(false);
    });
  });
});
