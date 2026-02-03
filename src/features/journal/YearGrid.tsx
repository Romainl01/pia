import { View, StyleSheet } from 'react-native';
import { GlassView } from 'expo-glass-effect';

import { useJournalStore, JournalEntry } from '@/src/stores/journalStore';
import { useJournalSettingsStore } from '@/src/stores/journalSettingsStore';
import { generateYearDates, isToday, isPastOrToday } from '@/src/utils/journalDateHelpers';
import { DayDot, DayDotStatus } from './DayDot';

const GAP = 5;
const MIN_COLUMNS = 14;
const MAX_COLUMNS = 28;
const GLASS_PADDING = 16;
const GLASS_BORDER_RADIUS = 16;

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
  const colorScheme = useJournalSettingsStore((state) => state.colorScheme);
  const dates = generateYearDates(year);

  // Subtract glass padding from available space for grid calculation
  const innerWidth = availableWidth - GLASS_PADDING * 2;
  const innerHeight = availableHeight - GLASS_PADDING * 2;

  const { columns, cellSize } = calculateGridLayout(
    dates.length,
    innerWidth,
    innerHeight
  );

  const gridWidth = columns * cellSize + (columns - 1) * GAP;

  return (
    <View testID={testID} style={styles.container}>
      <GlassView style={styles.glassContainer}>
        <View style={[styles.grid, { width: gridWidth, gap: GAP }]}>
          {dates.map((date) => (
            <DayDot
              key={date}
              size={cellSize}
              status={getDotStatus(date, entries)}
              colorScheme={colorScheme}
              onPress={() => onDayPress(date)}
              testID={`day-dot-${date}`}
            />
          ))}
        </View>
      </GlassView>
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
  glassContainer: {
    padding: GLASS_PADDING,
    borderRadius: GLASS_BORDER_RADIUS,
    overflow: 'hidden',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export { YearGrid };
export type { YearGridProps };
