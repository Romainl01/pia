import { View, Text, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '@/src/constants/colors';

export type FrequencyOption = 7 | 14 | 30 | 90;

interface FrequencySelectorProps {
  value: FrequencyOption | null;
  onChange: (value: FrequencyOption) => void;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

const FREQUENCY_OPTIONS = [
  { value: 7 as const, label: 'Weekly', accessibilityLabel: 'Check in weekly' },
  { value: 14 as const, label: '2 Weeks', accessibilityLabel: 'Check in every 2 weeks' },
  { value: 30 as const, label: 'Monthly', accessibilityLabel: 'Check in monthly' },
  { value: 90 as const, label: 'Quarterly', accessibilityLabel: 'Check in quarterly' },
];

function FrequencySelector({
  value,
  onChange,
  label,
  style,
}: FrequencySelectorProps): React.ReactElement {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.pillsContainer}>
        {FREQUENCY_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <Pressable
              key={option.value}
              testID={`frequency-pill-${option.value}`}
              style={[styles.pill, isSelected && styles.pillSelected]}
              onPress={() => onChange(option.value)}
              accessibilityRole="button"
              accessibilityLabel={option.accessibilityLabel}
              accessibilityState={{ selected: isSelected }}
            >
              <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: colors.neutralGray,
    marginBottom: 8,
  },
  pillsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.neutralGray200,
  },
  pillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutralDark,
  },
  pillTextSelected: {
    color: colors.neutralWhite,
  },
});

export { FrequencySelector };
export type { FrequencySelectorProps };
