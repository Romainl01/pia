import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/src/constants/colors';
import { GradientBackground } from '@/src/components/GradientBackground';
import { typography } from '@/src/constants/typography';
import { SettingsScreen as SettingsContent } from '@/src/features/settings/SettingsScreen';

export default function SettingsScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <GradientBackground />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <SettingsContent />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 16,
  },
  title: {
    ...typography.titleH1,
    color: colors.neutralDark,
  },
  content: {
    paddingBottom: 32,
  },
});
