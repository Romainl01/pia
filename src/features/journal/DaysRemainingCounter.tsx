import { Text, StyleSheet } from 'react-native';

import { colors } from '@/src/constants/colors';
import { typography } from '@/src/constants/typography';

interface DaysRemainingCounterProps {
  daysRemaining: number;
  testID?: string;
}

/**
 * Displays "X days left" in the year using mono font.
 */
function DaysRemainingCounter({
  daysRemaining,
  testID,
}: DaysRemainingCounterProps): React.ReactElement {
  const dayWord = daysRemaining === 1 ? 'day' : 'days';

  return (
    <Text style={styles.text} testID={testID}>
      {daysRemaining} {dayWord} left
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    ...typography.mono2,
    color: colors.neutralGray,
  },
});

export { DaysRemainingCounter };
export type { DaysRemainingCounterProps };
