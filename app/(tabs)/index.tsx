import { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

import { colors } from '@/src/constants/colors';
import { typography } from '@/src/constants/typography';
import { GlassButton } from '@/src/components/GlassButton';
import { YearGrid, DaysRemainingCounter } from '@/src/features/journal';
import {
  getDaysRemainingInYear,
  formatJournalDate,
  toDateString,
} from '@/src/utils/journalDateHelpers';

// Standard iOS tab bar height (49px) + safe area bottom inset
const TAB_BAR_HEIGHT = 49;

/**
 * Journal tab - year view with 365 colored dots representing each day.
 * Users can tap any past day to write/edit entries.
 */
export default function JournalScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const tabBarHeight = TAB_BAR_HEIGHT + insets.bottom;
  const currentYear = new Date().getFullYear();
  const daysRemaining = getDaysRemainingInYear();

  const handleDayPress = useCallback((date: string) => {
    const formattedDate = formatJournalDate(date);
    Alert.alert('Journal Entry', formattedDate);
  }, []);

  const handleTodayPress = useCallback(() => {
    handleDayPress(toDateString(new Date()));
  }, [handleDayPress]);

  return (
    <View style={styles.root}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Journal</Text>
          <DaysRemainingCounter daysRemaining={daysRemaining} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <YearGrid year={currentYear} onDayPress={handleDayPress} />
        </ScrollView>
      </View>

      {/* Floating Action Button */}
      <GlassButton
        onPress={handleTodayPress}
        size={56}
        style={[styles.fab, { bottom: tabBarHeight + 16 }]}
        icon={
          <SymbolView
            name="plus.circle.fill"
            size={28}
            weight="semibold"
            tintColor={colors.primary}
          />
        }
        testID="journal-fab"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 4,
  },
  title: {
    ...typography.titleH1,
    color: colors.neutralDark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    right: 20,
  },
});
