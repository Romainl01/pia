import { View, Text, Pressable, Linking, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

import { useNotificationPermission } from '@/src/hooks/useNotificationPermission';
import { useNotificationStateStore } from '@/src/stores/notificationStateStore';
import { useJournalSettingsStore } from '@/src/stores/journalSettingsStore';
import { SettingsToggleRow } from '@/src/components/SettingsToggleRow';
import { SettingsRow } from '@/src/components/SettingsRow/SettingsRow';
import { JournalThemePicker } from '@/src/components/JournalThemePicker';
import { colors } from '@/src/constants/colors';

const appVersion = Constants.expoConfig?.version ?? '0.0.0';

function SettingsScreen(): React.ReactElement {
  const {
    isGranted,
    isDenied,
    requestPermission,
  } = useNotificationPermission();

  const notificationsEnabled = useNotificationStateStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useNotificationStateStore((s) => s.setNotificationsEnabled);

  const colorScheme = useJournalSettingsStore((s) => s.colorScheme);
  const setColorScheme = useJournalSettingsStore((s) => s.setColorScheme);

  const isToggleOn = isGranted && notificationsEnabled;

  const handleNotificationToggle = async (newValue: boolean) => {
    if (!newValue) {
      setNotificationsEnabled(false);
      return;
    }

    // Turning on: re-enable if OS permission already granted, otherwise request it
    if (isGranted) {
      setNotificationsEnabled(true);
      return;
    }

    const granted = await requestPermission();
    if (granted) {
      setNotificationsEnabled(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* Notifications Section */}
      <Text style={styles.sectionHeader}>NOTIFICATIONS</Text>
      <View style={styles.section}>
        <SettingsToggleRow
          icon="bell"
          label="Push Notifications"
          value={isToggleOn}
          onToggle={handleNotificationToggle}
          testID="notifications-toggle"
        />
        {isDenied && (
          <Pressable onPress={Linking.openSettings}>
            <Text style={styles.deniedText}>Denied — tap to open Settings</Text>
          </Pressable>
        )}
      </View>

      {/* Appearance Section */}
      <Text style={styles.sectionHeader}>APPEARANCE</Text>
      <View style={styles.section}>
        <JournalThemePicker
          selectedScheme={colorScheme}
          onSelectScheme={setColorScheme}
          testID="journal-theme-picker"
        />
      </View>

      {/* About Section */}
      <Text style={styles.sectionHeader}>ABOUT</Text>
      <View style={styles.section}>
        <SettingsRow
          icon="info.circle"
          label="Version"
          value={appVersion}
          hasValue
          testID="version-row"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 8,
  },
  sectionHeader: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: colors.neutralGray300,
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  section: {
    gap: 8,
  },
  deniedText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.feedbackError,
    paddingHorizontal: 4,
    paddingTop: 4,
  },
});

export { SettingsScreen };
