import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';

import { colors, journalColorSchemes, JournalColorScheme } from '@/src/constants/colors';

interface JournalThemePickerProps {
  selectedScheme: JournalColorScheme;
  onSelectScheme: (scheme: JournalColorScheme) => void;
  testID?: string;
}

const schemeLabels: Record<JournalColorScheme, string> = {
  A: 'Warm',
  B: 'Pastel',
  C: 'Contrast',
};

/**
 * A picker component for selecting journal dot color schemes.
 * Shows color swatches for each scheme option.
 */
function JournalThemePicker({
  selectedScheme,
  onSelectScheme,
  testID,
}: JournalThemePickerProps): React.ReactElement {
  const handleSelect = (scheme: JournalColorScheme) => {
    Haptics.selectionAsync();
    onSelectScheme(scheme);
  };

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.header}>
        <SymbolView
          name="paintpalette"
          size={24}
          tintColor={colors.neutralDark}
        />
        <Text style={styles.label}>Journal Theme</Text>
      </View>
      <View style={styles.options}>
        {(Object.keys(journalColorSchemes) as JournalColorScheme[]).map((scheme) => (
          <ThemeOption
            key={scheme}
            scheme={scheme}
            label={schemeLabels[scheme]}
            isSelected={selectedScheme === scheme}
            onSelect={() => handleSelect(scheme)}
          />
        ))}
      </View>
    </View>
  );
}

interface ThemeOptionProps {
  scheme: JournalColorScheme;
  label: string;
  isSelected: boolean;
  onSelect: () => void;
}

function ThemeOption({ scheme, label, isSelected, onSelect }: ThemeOptionProps) {
  const schemeColors = journalColorSchemes[scheme];

  return (
    <Pressable
      onPress={onSelect}
      style={[styles.option, isSelected && styles.optionSelected]}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`${label} theme`}
    >
      <View style={styles.swatchRow}>
        <View style={[styles.swatch, { backgroundColor: schemeColors.filled }]} />
        <View style={[styles.swatch, { backgroundColor: schemeColors.pastEmpty }]} />
        <View style={[styles.swatch, { backgroundColor: schemeColors.future }]} />
        <View
          style={[
            styles.swatch,
            styles.todaySwatch,
            {
              backgroundColor: schemeColors.filled,
              borderColor: schemeColors.todayRing,
            },
          ]}
        />
      </View>
      <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.neutralWhite,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: colors.neutralDark,
  },
  options: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.surfaceLight,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 8,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 4,
  },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  todaySwatch: {
    borderWidth: 2,
  },
  optionLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colors.neutralGray,
  },
  optionLabelSelected: {
    color: colors.neutralDark,
  },
});

export { JournalThemePicker };
export type { JournalThemePickerProps };
