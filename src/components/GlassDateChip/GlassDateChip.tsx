import { StyleSheet, Text, View } from 'react-native';
import { GlassView } from 'expo-glass-effect';

import { colors } from '@/src/constants/colors';
import { isToday, formatShortDate } from '@/src/utils/journalDateHelpers';

interface GlassDateChipProps {
  date: string; // YYYY-MM-DD
  testID?: string;
}

/**
 * Non-interactive liquid glass pill showing the date.
 * Displays "Today" for today's date, otherwise shows "Mon, Jan 29" format.
 */
function GlassDateChip({
  date,
  testID,
}: GlassDateChipProps): React.ReactElement {
  const displayText = isToday(date) ? 'Today' : formatShortDate(date);

  return (
    <View testID={testID} style={styles.container}>
      <GlassView style={styles.glass}>
        <Text style={styles.label}>{displayText}</Text>
      </GlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  glass: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    fontWeight: '500',
    color: colors.primary,
  },
});

export { GlassDateChip };
export type { GlassDateChipProps };
