import 'react-native-reanimated';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/components/themed/ThemeProvider';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...MaterialIcons.font,
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  // Platform-appropriate StatusBar styling per FR12
  const statusBarStyle = colorScheme === 'dark' ? 'light' : 'dark';

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
            <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: false }} />
          </Stack>
          <StatusBar style={statusBarStyle} translucent={Platform.OS === 'android'} />
        </NavigationThemeProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
