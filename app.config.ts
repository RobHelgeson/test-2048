import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'test-2048',
  slug: 'test-2048',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'test2048',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.rvh.test2048',
    buildNumber: '1.0.0',
    infoPlist: {
      UIRequiredDeviceCapabilities: ['armv7'],
      UIRequiresFullScreen: true,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
    package: 'com.rvh.test2048',
    versionCode: 1,
    permissions: [],
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-updates',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  updates: {
    url: 'https://u.expo.dev/0bc6705f-8659-4ffe-b9b3-f3c2627cbad8',
    fallbackToCacheTimeout: 0,
    checkAutomatically: 'ON_ERROR_RECOVERY',
    enabled: true,
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
  extra: {
    eas: {
      projectId: '0bc6705f-8659-4ffe-b9b3-f3c2627cbad8',
    },
  },
});
