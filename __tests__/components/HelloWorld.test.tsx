import HelloWorldScreen from '@/app/(tabs)/hello-world';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';

// Mock expo-router
jest.mock('expo-router', () => ({
  Link: ({ children }: any) => {
    const MockedComponent = ({ children }: any) => children;
    return <MockedComponent>{children}</MockedComponent>;
  },
}));

// No need to mock themed components - they're mocked globally in jest.setup.js

// Mock useColorScheme hook
jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: () => 'light',
}));

// Mock Colors constants
jest.mock('@/constants/Colors', () => ({
  Colors: {
    light: {
      tint: '#0a7ea4',
    },
    dark: {
      tint: '#fff',
    },
  },
}));

describe('HelloWorldScreen', () => {
  beforeEach(() => {
    // Clear any mocks before each test
    jest.clearAllMocks();
  });

  it('renders Hello World title correctly', () => {
    render(<HelloWorldScreen />);

    const title = screen.getByText('Hello World! 🌍');
    expect(title).toBeTruthy();
  });

  it('renders deployment verification subtitle correctly', () => {
    render(<HelloWorldScreen />);

    const subtitle = screen.getByText('Deployment Verification Screen');
    expect(subtitle).toBeTruthy();
  });

  it('displays platform information correctly', () => {
    render(<HelloWorldScreen />);

    // Check platform name is displayed
    const platformText = screen.getByText(new RegExp(`Platform: ${Platform.OS}`));
    expect(platformText).toBeTruthy();

    // Check version label is displayed (version might be undefined in tests)
    const versionLabel = screen.getByText(/Version:/);
    expect(versionLabel).toBeTruthy();
  });

  it('renders deployment status indicators', () => {
    render(<HelloWorldScreen />);

    expect(screen.getByText('✅ App Successfully Loaded')).toBeTruthy();
    expect(screen.getByText('✅ Platform Detection Working')).toBeTruthy();
    expect(screen.getByText('✅ Interactive Elements Functional')).toBeTruthy();
  });

  it('renders interactive counter button with initial count', () => {
    render(<HelloWorldScreen />);

    const button = screen.getByText(/Tap Count: 0/);
    expect(button).toBeTruthy();
  });

  it('increments counter when button is pressed', () => {
    render(<HelloWorldScreen />);

    const button = screen.getByText(/Tap Count: 0/);

    // Press the button
    fireEvent.press(button);

    // Counter should increment
    expect(screen.getByText(/Tap Count: 1/)).toBeTruthy();

    // Press again
    fireEvent.press(button);
    expect(screen.getByText(/Tap Count: 2/)).toBeTruthy();
  });

  it('renders back navigation link', () => {
    render(<HelloWorldScreen />);

    const backLink = screen.getByText(/← Back to Home/);
    expect(backLink).toBeTruthy();
  });

  it('contains all required sections', () => {
    render(<HelloWorldScreen />);

    // Check all main sections are present
    expect(screen.getByText('Platform Information:')).toBeTruthy();
    expect(screen.getByText('Interactive Elements:')).toBeTruthy();
    expect(screen.getByText('Deployment Status:')).toBeTruthy();
  });

  describe('Platform Detection', () => {
    it('handles different platform types correctly', () => {
      render(<HelloWorldScreen />);

      // Platform.OS should be one of the expected values
      const validPlatforms = ['ios', 'android', 'web', 'windows', 'macos'];
      const platformText = screen.getByText(`Platform: ${Platform.OS}`);

      expect(platformText).toBeTruthy();
      expect(validPlatforms.includes(Platform.OS)).toBe(true);
    });

    it('displays platform version information', () => {
      render(<HelloWorldScreen />);

      const versionLabel = screen.getByText(/Version:/);
      expect(versionLabel).toBeTruthy();
      // Platform.Version might be undefined in test environment
    });
  });

  describe('Interactive Elements', () => {
    it('maintains counter state across multiple interactions', () => {
      render(<HelloWorldScreen />);

      const initialButton = screen.getByText(/Tap Count: 0/);

      // Perform multiple taps
      for (let i = 1; i <= 5; i++) {
        fireEvent.press(initialButton);
        expect(screen.getByText(new RegExp(`Tap Count: ${i}`))).toBeTruthy();
      }
    });
  });

  describe('Accessibility', () => {
    it('provides proper text content for screen readers', () => {
      render(<HelloWorldScreen />);

      // Check that important information is accessible
      expect(screen.getByText(/Hello World! 🌍/)).toBeTruthy();
      expect(screen.getByText(/Deployment Verification Screen/)).toBeTruthy();
      expect(screen.getByText(/Platform Information:/)).toBeTruthy();
      expect(screen.getByText(/Interactive Elements:/)).toBeTruthy();
    });
  });
});
