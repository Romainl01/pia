import { Pressable, View, StyleSheet } from 'react-native';

import { colors } from '@/src/constants/colors';

export type DayDotStatus =
  | 'past-with-entry'
  | 'past-without-entry'
  | 'today'
  | 'future';

interface DayDotProps {
  status: DayDotStatus;
  /** Size of the cell containing the dot */
  size: number;
  onPress?: () => void;
  testID?: string;
}

/**
 * A single dot representing one day in the year grid.
 *
 * Visual states:
 * - past-with-entry: Orange filled (primary)
 * - past-without-entry: Gray filled
 * - today: Larger orange dot with soft glow
 * - future: Faint gray, not pressable
 */
function DayDot({ status, size, onPress, testID }: DayDotProps): React.ReactElement {
  const isFuture = status === 'future';
  const isToday = status === 'today';

  // Dot is 70% of cell size
  const baseDotSize = Math.max(4, size * 0.7);

  // Today's dot is 1.15x larger to make it pop (subtle)
  const todayScale = isToday ? 1.15 : 1;
  const dotSize = baseDotSize * todayScale;

  // Glow is 1.5x the dot size - contained within cell
  const glowSize = dotSize * 1.5;

  return (
    <Pressable
      onPress={onPress}
      disabled={isFuture}
      testID={testID}
      style={[styles.container, { width: size, height: size }]}
      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
    >
      {isToday && (
        <View
          style={[
            styles.todayGlow,
            {
              width: glowSize,
              height: glowSize,
              borderRadius: glowSize / 2,
            },
          ]}
        />
      )}
      <View
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: getDotColor(status),
        }}
      />
    </Pressable>
  );
}

function getDotColor(status: DayDotStatus): string {
  switch (status) {
    case 'past-with-entry':
    case 'today':
      return colors.primary;
    case 'past-without-entry':
      return colors.neutralGray200;
    case 'future':
      return 'rgba(217, 219, 225, 0.5)';
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayGlow: {
    position: 'absolute',
    backgroundColor: 'rgba(242, 140, 89, 0.25)',
  },
});

export { DayDot };
export type { DayDotProps };
