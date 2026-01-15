import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, ActionSheetIOS } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassView } from 'expo-glass-effect';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Avatar } from '@/src/components/Avatar';
import { SettingsRow } from '@/src/components/SettingsRow';
import { useFriendsStore } from '@/src/stores/friendsStore';
import { useNotificationStateStore } from '@/src/stores/notificationStateStore';
import { useNotificationPermission } from '@/src/hooks/useNotificationPermission';
import { colors } from '@/src/constants/colors';
import { typography } from '@/src/constants/typography';
import type { ContactBirthday } from '@/src/hooks/useContacts';

type FrequencyOption = 7 | 14 | 30 | 90 | null;

const FREQUENCY_LABELS: Record<number, string> = {
  7: 'Weekly',
  14: 'Bi-weekly',
  30: 'Monthly',
  90: 'Quarterly',
};

/**
 * Formats a birthday for display
 * Shows year if available: "Oct 20, 1995", otherwise "Oct 20"
 */
function formatBirthday(birthday: ContactBirthday | null, selectedDate: Date | null): string {
  if (!birthday && !selectedDate) return 'Pick a date';

  if (selectedDate) {
    const month = selectedDate.toLocaleDateString('en-US', { month: 'short' });
    const day = selectedDate.getDate();
    const year = selectedDate.getFullYear();
    const defaultYear = new Date().getFullYear() - 30;
    if (year !== defaultYear) {
      return `${month} ${day}, ${year}`;
    }
    return `${month} ${day}`;
  }

  if (birthday) {
    const date = new Date(2000, birthday.month, birthday.day);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    if (birthday.year) {
      return `${month} ${birthday.day}, ${birthday.year}`;
    }
    return `${month} ${birthday.day}`;
  }

  return 'Pick a date';
}

/**
 * Formats a date for display: "Jan 15, 2025"
 */
function formatDate(date: Date | null): string {
  if (!date) return 'Pick a date';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Returns a date 30 years ago from today (default for birthday picker)
 */
function getDefaultBirthdayDate(): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 30);
  return date;
}

/**
 * Converts ContactBirthday to Date object
 */
function birthdayToDate(birthday: ContactBirthday): Date {
  const year = birthday.year ?? new Date().getFullYear() - 30;
  return new Date(year, birthday.month, birthday.day);
}

export default function AddFriendScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const pendingContact = useFriendsStore((state) => state.pendingContact);
  const setPendingContact = useFriendsStore((state) => state.setPendingContact);
  const addFriend = useFriendsStore((state) => state.addFriend);
  const friendsCount = useFriendsStore((state) => state.friends.length);

  const { hasRequestedPermission, setHasRequestedPermission } = useNotificationStateStore();
  const { requestPermission } = useNotificationPermission();

  // Form state
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [lastCatchUp, setLastCatchUp] = useState<Date | null>(null);
  const [frequency, setFrequency] = useState<FrequencyOption>(7); // Default: Weekly

  // Picker visibility
  const [showBirthdayPicker, setShowBirthdayPicker] = useState(false);
  const [showLastCatchUpPicker, setShowLastCatchUpPicker] = useState(false);

  // Pre-fill birthday from contact if available
  useEffect(() => {
    if (pendingContact?.birthday) {
      setBirthday(birthdayToDate(pendingContact.birthday));
    }
  }, [pendingContact]);

  const isFormValid = birthday !== null && lastCatchUp !== null && frequency !== null;

  const handleSave = useCallback(async () => {
    if (!pendingContact || !isFormValid) return;

    // Check if this is the first friend (before adding)
    const isFirstFriend = friendsCount === 0;

    // Success haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Format birthday as ISO string or MM-DD if no year
    let birthdayString: string;
    if (birthday) {
      birthdayString = birthday.toISOString().split('T')[0];
    } else {
      birthdayString = '';
    }

    addFriend({
      name: pendingContact.name,
      photoUrl: pendingContact.imageUri,
      birthday: birthdayString,
      frequencyDays: frequency!,
      lastContactAt: lastCatchUp!.toISOString().split('T')[0],
    });

    // Request notification permission after first friend is added
    if (isFirstFriend && !hasRequestedPermission) {
      setHasRequestedPermission(true);
      await requestPermission();
    }

    setPendingContact(null);
    router.back();
  }, [
    pendingContact,
    birthday,
    lastCatchUp,
    frequency,
    isFormValid,
    addFriend,
    setPendingContact,
    friendsCount,
    hasRequestedPermission,
    setHasRequestedPermission,
    requestPermission,
  ]);

  const handleBirthdayConfirm = useCallback((selectedDate: Date) => {
    setBirthday(selectedDate);
    setShowBirthdayPicker(false);
  }, []);

  const handleBirthdayCancel = useCallback(() => {
    setShowBirthdayPicker(false);
  }, []);

  const handleLastCatchUpConfirm = useCallback((selectedDate: Date) => {
    setLastCatchUp(selectedDate);
    setShowLastCatchUpPicker(false);
  }, []);

  const handleLastCatchUpCancel = useCallback(() => {
    setShowLastCatchUpPicker(false);
  }, []);

  const handleFrequencyPress = useCallback(() => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Weekly', 'Bi-weekly', 'Monthly', 'Quarterly', 'None'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 1:
              setFrequency(7);
              break;
            case 2:
              setFrequency(14);
              break;
            case 3:
              setFrequency(30);
              break;
            case 4:
              setFrequency(90);
              break;
            case 5:
              setFrequency(null);
              break;
          }
        }
      );
    }
  }, []);

  if (!pendingContact) {
    return (
      <View>
        <Text style={styles.emptyText}>No contact selected</Text>
      </View>
    );
  }

  const birthdayDisplayValue = formatBirthday(pendingContact.birthday, birthday);
  const lastCatchUpDisplayValue = formatDate(lastCatchUp);
  const frequencyDisplayValue = frequency ? FREQUENCY_LABELS[frequency] : 'None';

  return (
    <View style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
      {/* Header with close and save buttons */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Pressable
          onPress={handleSave}
          disabled={!isFormValid}
          style={styles.saveButton}
          testID="save-button"
        >
          <GlassView
            style={[styles.glassButton, !isFormValid && styles.glassButtonDisabled]}
            tintColor={isFormValid ? colors.primary : undefined}
          >
            <SymbolView
              name="checkmark"
              size={18}
              weight="semibold"
              tintColor={isFormValid ? colors.neutralWhite : colors.neutralGray300}
            />
          </GlassView>
        </Pressable>
      </View>

      {/* Contact info */}
      <View style={styles.contactSection}>
        <Avatar
          name={pendingContact.name}
          imageUri={pendingContact.imageUri ?? undefined}
          size={72}
        />
        <Text style={styles.contactName}>{pendingContact.name}</Text>
      </View>

      {/* Settings rows */}
      <View style={styles.settingsSection}>
        <SettingsRow
          icon="gift"
          label="Birthday"
          value={birthdayDisplayValue}
          onPress={() => setShowBirthdayPicker(true)}
          chevronType="expand"
          testID="birthday-row"
        />

        <SettingsRow
          icon="calendar"
          label="Last catch-up"
          value={lastCatchUpDisplayValue}
          onPress={() => setShowLastCatchUpPicker(true)}
          chevronType="expand"
          testID="last-catchup-row"
        />

        <SettingsRow
          icon="arrow.trianglehead.2.clockwise"
          label="Frequency"
          value={frequencyDisplayValue}
          onPress={handleFrequencyPress}
          chevronType="dropdown"
          testID="frequency-row"
        />
      </View>

      {/* Date picker modals - inline calendar display */}
      {showBirthdayPicker && (
        <DateTimePickerModal
          testID="birthday-picker"
          isVisible={showBirthdayPicker}
          mode="date"
          display="inline"
          date={birthday ?? getDefaultBirthdayDate()}
          maximumDate={new Date()}
          onConfirm={handleBirthdayConfirm}
          onCancel={handleBirthdayCancel}
        />
      )}

      {showLastCatchUpPicker && (
        <DateTimePickerModal
          testID="last-catchup-picker"
          isVisible={showLastCatchUpPicker}
          mode="date"
          display="inline"
          date={lastCatchUp ?? new Date()}
          maximumDate={new Date()}
          onConfirm={handleLastCatchUpConfirm}
          onCancel={handleLastCatchUpCancel}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerSpacer: {
    width: 36,
  },
  saveButton: {
    zIndex: 1,
  },
  glassButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassButtonDisabled: {
    opacity: 0.5,
  },
  contactSection: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
    paddingBottom: 24,
  },
  contactName: {
    fontFamily: 'CrimsonPro_500Medium',
    fontSize: 32,
    color: colors.neutralDark,
    textAlign: 'center',
  },
  settingsSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  emptyText: {
    ...typography.body1,
    color: colors.neutralGray,
    textAlign: 'center',
    marginTop: 100,
  },
});
