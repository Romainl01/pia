import { useCallback, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { Avatar } from '@/src/components/Avatar';
import { DateInput } from '@/src/components/DateInput';
import { FrequencySelector, FrequencyOption } from '@/src/components/FrequencySelector';
import { useFriendsStore } from '@/src/stores/friendsStore';
import { colors } from '@/src/constants/colors';
import { typography } from '@/src/constants/typography';
import { SelectedContact } from '@/src/hooks/useContacts';

interface AddFriendSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedContact: SelectedContact | null;
}

const SNAP_POINTS = ['70%'];

function Backdrop(props: BottomSheetBackdropProps): React.ReactElement {
  return (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.5}
      pressBehavior="close"
    />
  );
}

function AddFriendSheet({
  isOpen,
  onClose,
  selectedContact,
}: AddFriendSheetProps): React.ReactElement {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const addFriend = useFriendsStore((state) => state.addFriend);

  // Form state
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [lastCheckIn, setLastCheckIn] = useState<Date | null>(null);
  const [frequency, setFrequency] = useState<FrequencyOption | null>(null);

  // Reset form when sheet opens with new contact
  useEffect(() => {
    if (isOpen && selectedContact) {
      setBirthday(null);
      setLastCheckIn(null);
      setFrequency(null);
    }
  }, [isOpen, selectedContact]);

  // Control sheet visibility
  useEffect(() => {
    if (isOpen && selectedContact) {
      // Small delay to ensure the sheet is mounted
      setTimeout(() => {
        bottomSheetRef.current?.snapToIndex(0);
      }, 100);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isOpen, selectedContact]);

  const isFormValid = birthday !== null && lastCheckIn !== null && frequency !== null;

  const handleSave = useCallback(() => {
    if (!selectedContact || !isFormValid) return;

    addFriend({
      name: selectedContact.name,
      photoUrl: selectedContact.imageUri,
      birthday: birthday!.toISOString().split('T')[0],
      frequencyDays: frequency!,
      lastContactAt: lastCheckIn!.toISOString().split('T')[0],
    });

    onClose();
  }, [selectedContact, birthday, lastCheckIn, frequency, isFormValid, addFriend, onClose]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={SNAP_POINTS}
      onChange={handleSheetChanges}
      backdropComponent={Backdrop}
      enablePanDownToClose
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.contentContainer}>
        {selectedContact ? (
          <>
            {/* Contact Info */}
            <View style={styles.contactSection}>
              <Avatar
                name={selectedContact.name}
                imageUri={selectedContact.imageUri ?? undefined}
                size={80}
              />
              <Text style={styles.contactName}>{selectedContact.name}</Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Form Fields */}
            <View style={styles.formSection}>
              <DateInput
                label="Birthday"
                value={birthday}
                onChange={setBirthday}
                placeholder="Select birthday..."
                maximumDate={new Date()} // Can't be born in the future
              />

              <View testID="last-checkin-field">
                <DateInput
                  label="Last check-in"
                  value={lastCheckIn}
                  onChange={setLastCheckIn}
                  placeholder="When did you last talk?"
                  maximumDate={new Date()} // Can't be in the future
                />
              </View>

              <FrequencySelector
                label="Stay in touch"
                value={frequency}
                onChange={setFrequency}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <Pressable
                style={styles.cancelButton}
                onPress={onClose}
                testID="cancel-button"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.saveButton, !isFormValid && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={!isFormValid}
                testID="save-button"
                accessibilityState={{ disabled: !isFormValid }}
              >
                <Text style={[styles.saveButtonText, !isFormValid && styles.saveButtonTextDisabled]}>
                  Save
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Select a contact to continue</Text>
          </View>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors.surfaceLight,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: colors.neutralGray200,
    width: 40,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
  },
  contactSection: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  contactName: {
    ...typography.titleH2,
    color: colors.neutralDark,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutralGray200,
    marginVertical: 16,
  },
  formSection: {
    gap: 20,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.neutralGray200,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutralDark,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.neutralGray200,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutralWhite,
  },
  saveButtonTextDisabled: {
    color: colors.neutralGray300,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body1,
    color: colors.neutralGray,
  },
});

export { AddFriendSheet };
export type { AddFriendSheetProps };
