import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import {StyleSheet} from 'react-native';

export default function SettingsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Settings
        </ThemedText>
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Game Settings</ThemedText>
          <ThemedText style={styles.description}>Game configuration options will be available here.</ThemedText>
        </ThemedView>
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Display Settings</ThemedText>
          <ThemedText style={styles.description}>Theme and display preferences will be configurable here.</ThemedText>
        </ThemedView>
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Audio Settings</ThemedText>
          <ThemedText style={styles.description}>Sound and haptic feedback options will be available here.</ThemedText>
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
  },
  title: {
    marginBottom: 32,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  description: {
    marginTop: 8,
    opacity: 0.7,
    lineHeight: 20,
  },
});
