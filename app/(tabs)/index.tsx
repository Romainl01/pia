import { useCallback } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

import { colors } from '@/src/constants/colors';
import { GradientBackground } from '@/src/components/GradientBackground';
import { typography } from '@/src/constants/typography';
import { GlassButton } from '@/src/components/GlassButton';
import { YearGrid, DaysRemainingCounter } from '@/src/features/journal';
import { getDaysRemainingInYear, toDateString } from '@/src/utils/journalDateHelpers';

// Standard iOS tab bar height
const TAB_BAR_HEIGHT = 49;
// Header height (padding + title) + margin below header
const HEADER_HEIGHT = 60 + 16;
// FAB size + margins (16 above tab bar + 16 above FAB for clearance)
const FAB_AREA_HEIGHT = 56 + 16 + 16;
// Horizontal padding for the grid
const HORIZONTAL_PADDING = 16;

/**
 * Journal tab - year view with 365 colored dots representing each day.
 * The entire year fits on one screen without scrolling.
 */
export default function JournalScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const currentYear = new Date().getFullYear();
  const daysRemaining = getDaysRemainingInYear();

  // Calculate available space for the grid
  const availableWidth = screenWidth - HORIZONTAL_PADDING * 2;
  const availableHeight =
    screenHeight -
    insets.top -
    HEADER_HEIGHT -
    FAB_AREA_HEIGHT -
    TAB_BAR_HEIGHT -
    insets.bottom;

  const tabBarHeight = TAB_BAR_HEIGHT + insets.bottom;

  const handleDayPress = useCallback((date: string) => {
    router.push(`/journal-entry/${date}`);
  }, []);

  const handleTodayPress = useCallback(() => {
    handleDayPress(toDateString(new Date()));
  }, [handleDayPress]);

  return (
    <View style={styles.root}>
      <GradientBackground />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Journal</Text>
          <DaysRemainingCounter daysRemaining={daysRemaining} />
        </View>

        <View style={[styles.gridContainer, { height: availableHeight }]}>
          <YearGrid
            year={currentYear}
            availableWidth={availableWidth}
            availableHeight={availableHeight}
            onDayPress={handleDayPress}
          />
        </View>
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
    backgroundColor: colors.surfaceLight,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: 16,
    paddingHorizontal: 16,
    height: HEADER_HEIGHT,
  },
  title: {
    ...typography.titleH1,
    color: colors.neutralDark,
  },
  gridContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
  },
});
