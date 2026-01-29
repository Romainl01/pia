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
  const label = daysRemaining === 1 ? 'day' : 'days';

  return (
    <Text style={styles.text} testID={testID}>
      {daysRemaining} {label} left
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    ...typography.mono2,
    color: colors.neutralGray,
    textAlign: 'center',
  },
});

export { DaysRemainingCounter };
export type { DaysRemainingCounterProps };
