import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Link } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';

export default function HelloWorldScreen() {
  const [counter, setCounter] = React.useState(0);
  const colorScheme = useColorScheme();

  const handleIncrement = () => {
    setCounter((prev) => prev + 1);
  };

  const getPlatformInfo = () => {
    const platformName = Platform.OS;
    const version = Platform.Version;
    return { platformName, version };
  };

  const { platformName, version } = getPlatformInfo();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Hello World! 🌍
      </ThemedText>

      <ThemedText type="subtitle" style={styles.subtitle}>
        Deployment Verification Screen
      </ThemedText>

      <ThemedView style={styles.infoContainer}>
        <ThemedText type="defaultSemiBold" style={styles.label}>
          Platform Information:
        </ThemedText>

        <ThemedText style={styles.info}>Platform: {platformName}</ThemedText>

        <ThemedText style={styles.info}>Version: {version}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.interactiveContainer}>
        <ThemedText type="defaultSemiBold" style={styles.label}>
          Interactive Elements:
        </ThemedText>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: Colors[colorScheme ?? 'light'].tint },
            pressed && styles.buttonPressed,
          ]}
          onPress={handleIncrement}
        >
          <ThemedText style={styles.buttonText}>Tap Count: {counter}</ThemedText>
        </Pressable>
      </ThemedView>

      <ThemedView style={styles.deploymentInfo}>
        <ThemedText type="defaultSemiBold" style={styles.label}>
          Deployment Status:
        </ThemedText>

        <ThemedText style={styles.info}>✅ App Successfully Loaded</ThemedText>

        <ThemedText style={styles.info}>✅ Platform Detection Working</ThemedText>

        <ThemedText style={styles.info}>✅ Interactive Elements Functional</ThemedText>

        <ThemedText style={styles.info}>🚀 OTA Update Test: {new Date().toLocaleString()}</ThemedText>
      </ThemedView>

      <Link href="/" style={styles.backLink}>
        <ThemedText type="link">← Back to Home</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
  },
  infoContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
    maxWidth: 400,
  },
  interactiveContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  deploymentInfo: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    width: '100%',
    maxWidth: 400,
  },
  label: {
    marginBottom: 10,
  },
  info: {
    marginBottom: 5,
    paddingLeft: 10,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    minWidth: 150,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  backLink: {
    marginTop: 10,
  },
});
