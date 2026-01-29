import { View, Text, StyleSheet } from 'react-native';

import { colors } from '@/src/constants/colors';
import { typography } from '@/src/constants/typography';
import { useJournalStore } from '@/src/stores/journalStore';
import { generateYearDates, isToday, isPastOrToday } from '@/src/utils/journalDateHelpers';
import { DayDot, DayDotStatus } from './DayDot';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const COLUMNS = 7;

interface YearGridProps {
  year: number;
  onDayPress: (date: string) => void;
  testID?: string;
}

/**
 * A 7-column grid showing all 365 days of the year as colored dots.
 * Each dot's color indicates whether the day has an entry, is today, or is in the future.
 */
function YearGrid({ year, onDayPress, testID }: YearGridProps): React.ReactElement {
  const hasEntryForDate = useJournalStore((state) => state.hasEntryForDate);
  const dates = generateYearDates(year);

  // Calculate padding for first row to align with weekday
  const firstDate = new Date(year, 0, 1);
  const startPadding = firstDate.getDay(); // 0 = Sunday, 6 = Saturday

  return (
    <View testID={testID} style={styles.container}>
      {/* Weekday headers */}
      <View style={styles.headerRow}>
        {WEEKDAYS.map((day, index) => (
          <View key={index} style={styles.headerCell}>
            <Text style={styles.headerText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Days grid */}
      <View style={styles.grid}>
        {/* Empty cells for alignment */}
        {Array.from({ length: startPadding }).map((_, index) => (
          <View key={`pad-${index}`} style={styles.cell} />
        ))}

        {/* Day dots */}
        {dates.map((date) => {
          const status = getDotStatus(date, hasEntryForDate);

          return (
            <View key={date} style={styles.cell}>
              <DayDot
                status={status}
                onPress={() => onDayPress(date)}
                testID={`day-dot-${date}`}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

function getDotStatus(
  date: string,
  hasEntryForDate: (date: string) => boolean
): DayDotStatus {
  if (isToday(date)) {
    return 'today';
  }

  if (!isPastOrToday(date)) {
    return 'future';
  }

  return hasEntryForDate(date) ? 'past-with-entry' : 'past-without-entry';
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  headerCell: {
    flex: 1,
    alignItems: 'center',
  },
  headerText: {
    ...typography.mono2,
    color: colors.neutralGray300,
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / COLUMNS}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export { YearGrid };
export type { YearGridProps };
