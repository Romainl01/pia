import { useEffect, useState, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

import { colors } from '@/src/constants/colors';
import { typography } from '@/src/constants/typography';
import { useJournalStore } from '@/src/stores/journalStore';
import { useToastStore } from '@/src/stores/toastStore';
import { useAutoSave } from '@/src/hooks/useAutoSave';
import { getRandomCongratsMessage } from '@/src/utils/journalMessages';
import { GlassButton } from '@/src/components/GlassButton';
import { GlassDateChip } from '@/src/components/GlassDateChip';
import { FloatingDoneButton } from '@/src/components/FloatingDoneButton';
import { SwipeableJournalContainer } from '@/src/features/journal/SwipeableJournalContainer';

/**
 * Full-screen journal entry editor with liquid glass UI.
 * Features:
 * - Glass back button and date chip header
 * - Swipe left/right to navigate between days
 * - Debounced auto-save with visual feedback
 */
export default function JournalEntryScreen(): React.ReactElement {
  const { date } = useLocalSearchParams<{ date: string }>();
  const insets = useSafeAreaInsets();

  const getEntryByDate = useJournalStore((state) => state.getEntryByDate);
  const upsertEntry = useJournalStore((state) => state.upsertEntry);
  const showToast = useToastStore((state) => state.showToast);

  const [content, setContent] = useState('');

  // Load existing content when screen mounts or date changes
  useEffect(() => {
    if (date) {
      const entry = getEntryByDate(date);
      setContent(entry?.content ?? '');
    }
  }, [date, getEntryByDate]);

  // Auto-save with debounce
  const handleSave = useCallback(
    (contentToSave: string) => {
      if (date) {
        upsertEntry(date, contentToSave);
      }
    },
    [date, upsertEntry]
  );

  const { justSaved, saveNow } = useAutoSave({
    content,
    onSave: handleSave,
    debounceMs: 500,
  });

  const handleBack = useCallback(() => {
    saveNow();
    router.back();
  }, [saveNow]);

  const handleDone = useCallback(() => {
    saveNow();
    showToast(getRandomCongratsMessage());
    router.back();
  }, [saveNow, showToast]);

  const handleDateChange = useCallback(
    (newDate: string) => {
      // Save current content before navigating
      saveNow();
      // Navigate to new date
      router.replace(`/journal-entry/${newDate}`);
    },
    [saveNow]
  );

  if (!date) {
    return <View style={styles.container} />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <GlassButton
          onPress={handleBack}
          icon={
            <SymbolView
              name="chevron.left"
              size={20}
              weight="semibold"
              tintColor={colors.neutralDark}
            />
          }
          size={40}
          testID="back-button"
        />
        <GlassDateChip
          date={date}
          showSavedIndicator={justSaved}
          testID="date-chip"
        />
        {/* Spacer to balance the layout */}
        <View style={styles.spacer} />
      </View>

      {/* Swipeable Editor */}
      <SwipeableJournalContainer
        currentDate={date}
        onDateChange={handleDateChange}
        onSwipeStart={saveNow}
        testID="swipeable-container"
      >
        <KeyboardAvoidingView
          style={styles.editorContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={insets.top + 60}
        >
          <TextInput
            style={styles.textInput}
            value={content}
            onChangeText={setContent}
            placeholder="Write about your day..."
            placeholderTextColor={colors.neutralGray300}
            multiline
            textAlignVertical="top"
            autoFocus
            testID="journal-input"
          />
        </KeyboardAvoidingView>
      </SwipeableJournalContainer>

      {/* Floating Done Button */}
      <FloatingDoneButton
        hasContent={content.trim().length > 0}
        onPress={handleDone}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  spacer: {
    width: 40,
    height: 40,
  },
  editorContainer: {
    flex: 1,
    padding: 16,
  },
  textInput: {
    flex: 1,
    ...typography.mono1,
    color: colors.neutralDark,
    lineHeight: 28,
  },
});
