import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function GameScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          2048 Game
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Game board will be implemented here
        </ThemedText>
        <ThemedView style={styles.placeholder}>
          <ThemedText>Game Board Placeholder</ThemedText>
          <ThemedText style={styles.instructions}>
            This is where the 2048 game board will be displayed.
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
    alignItems: 'center',
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.7,
  },
  placeholder: {
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'center',
  },
  instructions: {
    marginTop: 16,
    textAlign: 'center',
    opacity: 0.6,
  },
});
