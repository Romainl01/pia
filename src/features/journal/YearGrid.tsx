import { View, StyleSheet } from 'react-native';

import { useJournalStore, JournalEntry } from '@/src/stores/journalStore';
import { generateYearDates, isToday, isPastOrToday } from '@/src/utils/journalDateHelpers';
import { DayDot, DayDotStatus } from './DayDot';

const GAP = 2;
const MIN_COLUMNS = 12;
const MAX_COLUMNS = 25;

interface YearGridProps {
  year: number;
  /** Available width for the grid */
  availableWidth: number;
  /** Available height for the grid */
  availableHeight: number;
  onDayPress: (date: string) => void;
  testID?: string;
}

/**
 * Calculates the optimal grid layout to fit all days within available space.
 * Tries different column counts and picks the one that maximizes cell size.
 */
function calculateGridLayout(
  totalDays: number,
  availableWidth: number,
  availableHeight: number
): { columns: number; cellSize: number } {
  let bestColumns = MIN_COLUMNS;
  let bestCellSize = 0;

  for (let cols = MIN_COLUMNS; cols <= MAX_COLUMNS; cols++) {
    const rows = Math.ceil(totalDays / cols);

    // Calculate max cell size that fits in width
    const maxCellFromWidth = (availableWidth - (cols - 1) * GAP) / cols;
    // Calculate max cell size that fits in height
    const maxCellFromHeight = (availableHeight - (rows - 1) * GAP) / rows;

    // Cell size is limited by the smaller dimension
    const cellSize = Math.min(maxCellFromWidth, maxCellFromHeight);

    if (cellSize > bestCellSize) {
      bestCellSize = cellSize;
      bestColumns = cols;
    }
  }

  return { columns: bestColumns, cellSize: Math.floor(bestCellSize) };
}

/**
 * A dense grid showing all 365 days of the year as colored dots.
 * Dynamically calculates layout to fit entire year on screen.
 */
function YearGrid({
  year,
  availableWidth,
  availableHeight,
  onDayPress,
  testID,
}: YearGridProps): React.ReactElement {
  const entries = useJournalStore((state) => state.entries);
  const dates = generateYearDates(year);

  const { columns, cellSize } = calculateGridLayout(
    dates.length,
    availableWidth,
    availableHeight
  );

  const gridWidth = columns * cellSize + (columns - 1) * GAP;

  return (
    <View testID={testID} style={styles.container}>
      <View style={[styles.grid, { width: gridWidth, gap: GAP }]}>
        {dates.map((date) => (
          <DayDot
            key={date}
            size={cellSize}
            status={getDotStatus(date, entries)}
            onPress={() => onDayPress(date)}
            testID={`day-dot-${date}`}
          />
        ))}
      </View>
    </View>
  );
}

function getDotStatus(
  date: string,
  entries: Record<string, JournalEntry>
): DayDotStatus {
  if (isToday(date)) {
    return 'today';
  }

  if (!isPastOrToday(date)) {
    return 'future';
  }

  return date in entries ? 'past-with-entry' : 'past-without-entry';
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export { YearGrid };
export type { YearGridProps };
