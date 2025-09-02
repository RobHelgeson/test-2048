import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ClassicTheme } from '@/constants/themes/ClassicTheme';
import { CoolTheme } from '@/constants/themes/CoolTheme';
import { useCurrentTheme, useThemeActions, useThemeColors } from '@/stores/themeStore';
import { ThemeType } from '@/types/theme';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

const THEMES = {
  classic: ClassicTheme,
  cool: CoolTheme,
} as const;

interface ThemePreviewProps {
  themeType: ThemeType;
  isSelected: boolean;
  onSelect: () => void;
}

function ThemePreview({ themeType, isSelected, onSelect }: ThemePreviewProps) {
  const theme = THEMES[themeType];
  const colors = theme.tokens.colors;

  return (
    <TouchableOpacity
      style={[
        styles.themePreview,
        { borderColor: colors.border },
        isSelected && { borderColor: colors.primary, borderWidth: 3 },
      ]}
      onPress={onSelect}
      accessibilityRole="button"
      accessibilityLabel={`Select ${theme.name} theme`}
    >
      <View style={styles.themePreviewHeader}>
        <ThemedText type="defaultSemiBold" style={{ color: colors.text }}>
          {theme.name}
        </ThemedText>
        {isSelected && <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]} />}
      </View>

      <View style={[styles.colorPreview, { backgroundColor: colors.background }]}>
        <View style={[styles.tileRow]}>
          <View style={[styles.tilePreview, { backgroundColor: colors.tile2 }]} />
          <View style={[styles.tilePreview, { backgroundColor: colors.tile4 }]} />
          <View style={[styles.tilePreview, { backgroundColor: colors.tile8 }]} />
        </View>
        <View style={[styles.tileRow]}>
          <View style={[styles.tilePreview, { backgroundColor: colors.tile16 }]} />
          <View style={[styles.tilePreview, { backgroundColor: colors.tile32 }]} />
          <View style={[styles.tilePreview, { backgroundColor: colors.tile64 }]} />
        </View>
      </View>

      <ThemedText style={[styles.themeDescription, { color: colors.textSecondary }]}>{theme.description}</ThemedText>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const currentTheme = useCurrentTheme();
  const { setTheme } = useThemeActions();
  const colors = useThemeColors();

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Settings
        </ThemedText>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Theme</ThemedText>
          <ThemedText style={styles.description}>Choose your preferred visual theme</ThemedText>

          <View style={styles.themeSelector}>
            {Object.entries(THEMES).map(([themeType, theme]) => (
              <ThemePreview
                key={themeType}
                themeType={themeType as ThemeType}
                isSelected={currentTheme === themeType}
                onSelect={() => setTheme(themeType as ThemeType)}
              />
            ))}
          </View>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Game Settings</ThemedText>
          <ThemedText style={styles.description}>Game configuration options will be available here.</ThemedText>
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
  themeSelector: {
    marginTop: 16,
    gap: 16,
  },
  themePreview: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'transparent',
  },
  themePreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  colorPreview: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  tileRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tilePreview: {
    width: 32,
    height: 32,
    borderRadius: 4,
  },
  themeDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
});
