import { useCallback, useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassView } from 'expo-glass-effect';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Avatar } from '@/src/components/Avatar';
import { SettingsRow } from '@/src/components/SettingsRow';
import { GlassMenu, type AnchorPosition } from '@/src/components/GlassMenu';
import { useFriendsStore } from '@/src/stores/friendsStore';
import { useNotificationStateStore } from '@/src/stores/notificationStateStore';
import { colors } from '@/src/constants/colors';
import { typography } from '@/src/constants/typography';
import { getDeviceCornerRadius, getConcentricPadding } from '@/src/utils';
import type { ContactBirthday } from '@/src/hooks/useContacts';

const BUTTON_SIZE = 44;
const BUTTON_RADIUS = BUTTON_SIZE / 2;

type FrequencyOption = 7 | 14 | 30 | 90 | null;

const FREQUENCY_LABELS: Record<number, string> = {
  7: 'Weekly',
  14: 'Bi-weekly',
  30: 'Monthly',
  90: 'Quarterly',
};

const FREQUENCY_MENU_ITEMS = [
  { label: 'Weekly', value: 7 as FrequencyOption },
  { label: 'Bi-weekly', value: 14 as FrequencyOption },
  { label: 'Monthly', value: 30 as FrequencyOption },
  { label: 'Quarterly', value: 90 as FrequencyOption },
  { label: 'None', value: null as FrequencyOption },
];

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
  const { width, height } = useWindowDimensions();
  const pendingContact = useFriendsStore((state) => state.pendingContact);

  // Calculate concentric padding for the save button
  const sheetCornerRadius = getDeviceCornerRadius(width, height);
  const buttonPadding = getConcentricPadding(sheetCornerRadius, BUTTON_RADIUS);
  const setPendingContact = useFriendsStore((state) => state.setPendingContact);
  const addFriend = useFriendsStore((state) => state.addFriend);
  const friendsCount = useFriendsStore((state) => state.friends.length);

  const { hasRequestedPermission, setHasRequestedPermission, setPendingPermissionRequest } = useNotificationStateStore();

  // Form state
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [lastCatchUp, setLastCatchUp] = useState<Date | null>(null);
  const [frequency, setFrequency] = useState<FrequencyOption>(7); // Default: Weekly

  // Picker visibility
  const [showBirthdayPicker, setShowBirthdayPicker] = useState(false);
  const [showLastCatchUpPicker, setShowLastCatchUpPicker] = useState(false);

  // Frequency menu state
  const frequencyRowRef = useRef<View>(null);
  const [showFrequencyMenu, setShowFrequencyMenu] = useState(false);
  const [frequencyMenuAnchor, setFrequencyMenuAnchor] = useState<AnchorPosition | null>(null);

  // Pre-fill birthday from contact if available
  useEffect(() => {
    if (pendingContact?.birthday) {
      setBirthday(birthdayToDate(pendingContact.birthday));
    }
  }, [pendingContact]);

  const isFormValid = birthday !== null && lastCatchUp !== null && frequency !== null;

  const handleSave = useCallback(() => {
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

    // Schedule notification permission request after sheet closes (first friend only)
    if (isFirstFriend && !hasRequestedPermission) {
      setHasRequestedPermission(true);
      setPendingPermissionRequest(true);
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
    setPendingPermissionRequest,
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
    frequencyRowRef.current?.measureInWindow((x, y, width, height) => {
      setFrequencyMenuAnchor({ x, y, width, height });
      setShowFrequencyMenu(true);
    });
  }, []);

  const handleFrequencySelect = useCallback((value: FrequencyOption) => {
    setFrequency(value);
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
      {/* Header with save button - positioned concentrically with sheet corner */}
      <View style={[styles.header, { paddingTop: buttonPadding, paddingRight: buttonPadding }]}>
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
          ref={frequencyRowRef}
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

      {/* Frequency selection menu */}
      <GlassMenu
        visible={showFrequencyMenu}
        onClose={() => setShowFrequencyMenu(false)}
        items={FREQUENCY_MENU_ITEMS}
        selectedValue={frequency}
        onSelect={handleFrequencySelect}
        anchorPosition={frequencyMenuAnchor}
        testID="frequency-menu"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 16,
  },
  headerSpacer: {
    width: BUTTON_SIZE,
  },
  saveButton: {
    zIndex: 1,
  },
  glassButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_RADIUS,
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
