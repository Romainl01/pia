import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors } from '@/src/constants/colors';

interface DateInputProps {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  maximumDate?: Date;
  minimumDate?: Date;
  style?: StyleProp<ViewStyle>;
}

/**
 * Formats a date to a readable string
 * e.g., "December 15, 1992"
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function DateInput({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  maximumDate,
  minimumDate,
  style,
}: DateInputProps): React.ReactElement {
  const [showPicker, setShowPicker] = useState(false);

  function handleChange(event: DateTimePickerEvent, selectedDate?: Date): void {
    // On Android, the picker closes automatically
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (event.type === 'set' && selectedDate) {
      onChange(selectedDate);
      // Close picker on iOS after selection
      if (Platform.OS === 'ios') {
        setShowPicker(false);
      }
    } else if (event.type === 'dismissed') {
      setShowPicker(false);
    }
  }

  const displayValue = value ? formatDate(value) : placeholder;
  const isPlaceholder = !value;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        testID="date-input-field"
        style={styles.inputField}
        onPress={() => setShowPicker(true)}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={isPlaceholder ? 'Tap to select a date' : `Current value: ${displayValue}`}
      >
        <Text style={[styles.inputText, isPlaceholder && styles.placeholderText]}>
          {displayValue}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          testID="date-picker"
          value={value || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
        />
      )}
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
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.neutralGray200,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputText: {
    fontSize: 16,
    color: colors.neutralDark,
  },
  placeholderText: {
    color: colors.neutralGray300,
  },
  chevron: {
    fontSize: 14,
    color: colors.neutralGray300,
  },
});

export { DateInput };
export type { DateInputProps };
