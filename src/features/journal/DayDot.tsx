import { Pressable, View, StyleSheet } from 'react-native';

import { journalColorSchemes, JournalColorScheme } from '@/src/constants/colors';

export type DayDotStatus =
  | 'past-with-entry'
  | 'past-without-entry'
  | 'today'
  | 'future';

interface DayDotProps {
  status: DayDotStatus;
  /** Size of the cell containing the dot */
  size: number;
  /** Color scheme to use */
  colorScheme?: JournalColorScheme;
  onPress?: () => void;
  testID?: string;
}

/**
 * A single dot representing one day in the year grid.
 *
 * Visual states:
 * - past-with-entry: Filled with scheme's filled color
 * - past-without-entry: Muted gray from scheme
 * - today: Filled dot with contrasting ring border
 * - future: Faint, not pressable
 */
function DayDot({
  status,
  size,
  colorScheme = 'A',
  onPress,
  testID,
}: DayDotProps): React.ReactElement {
  const isFuture = status === 'future';
  const isToday = status === 'today';

  const scheme = journalColorSchemes[colorScheme];

  // Base dot is 60% of cell size
  const baseDotSize = Math.max(4, size * 0.6);

  // Ring border width scales with dot size
  const ringWidth = Math.max(1.5, baseDotSize * 0.15);

  // Today's dot is larger: we increase the inner dot so that
  // dot + ring is approximately 1.3x the normal dot size.
  // The ring draws inward, so we add ringWidth to make the visible
  // colored area match baseDotSize, then scale up by 1.15
  const todayDotSize = (baseDotSize + ringWidth * 2) * 1.15;
  const dotSize = isToday ? todayDotSize : baseDotSize;

  return (
    <Pressable
      onPress={onPress}
      disabled={isFuture}
      testID={testID}
      style={[styles.container, { width: size, height: size }]}
      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
    >
      <View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: getDotColor(status, scheme),
          },
          isToday && {
            borderWidth: ringWidth,
            borderColor: scheme.todayRing,
          },
        ]}
      />
    </Pressable>
  );
}

function getDotColor(
  status: DayDotStatus,
  scheme: (typeof journalColorSchemes)[JournalColorScheme]
): string {
  switch (status) {
    case 'past-with-entry':
    case 'today':
      return scheme.filled;
    case 'past-without-entry':
      return scheme.pastEmpty;
    case 'future':
      return scheme.future;
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    // borderWidth will be added dynamically for today
  },
});

export { DayDot };
export type { DayDotProps };
