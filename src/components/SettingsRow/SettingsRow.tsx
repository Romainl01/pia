import { forwardRef } from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { SymbolView } from 'expo-symbols';
import type { SFSymbol } from 'sf-symbols-typescript';
import * as Haptics from 'expo-haptics';
import { colors } from '@/src/constants/colors';

interface SettingsRowProps {
  icon: SFSymbol;
  label: string;
  value: string;
  onPress?: () => void;
  chevronType?: 'expand' | 'dropdown';
  /** When true and chevronType is 'expand', hides the '+' icon */
  hasValue?: boolean;
  testID?: string;
}

/**
 * Bordered settings row matching the Figma design.
 * Used in the Add Friend sheet for Birthday, Last catch-up, and Frequency.
 */
const SettingsRow = forwardRef<View, SettingsRowProps>(function SettingsRow(
  {
    icon,
    label,
    value,
    onPress,
    chevronType = 'expand',
    hasValue = false,
    testID,
  },
  ref
) {
  const handlePress = () => {
    Haptics.selectionAsync();
    onPress?.();
  };

  // For 'expand' type: show '+' only when no value, hide when value exists
  // For 'dropdown' type: always show the up/down chevron
  const showChevron = chevronType === 'dropdown' || !hasValue;
  const chevronIcon = chevronType === 'dropdown' ? 'chevron.up.chevron.down' : 'plus';

  return (
    <Pressable
      ref={ref}
      onPress={handlePress}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
    >
      <View style={styles.container}>
        <View style={styles.leftSection}>
          <SymbolView
            name={icon}
            size={24}
            tintColor={colors.neutralDark}
          />
          <Text style={styles.label}>{label}</Text>
        </View>
        <View style={styles.rightSection}>
          <Text style={styles.value}>{value}</Text>
          {showChevron && (
            <SymbolView
              name={chevronIcon}
              size={12}
              tintColor={colors.neutralDark}
            />
          )}
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: colors.neutralGray200,
    borderRadius: 16,
    backgroundColor: colors.surfaceCard,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: colors.neutralDark,
  },
  value: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: colors.neutralDark,
  },
});

export { SettingsRow };
export type { SettingsRowProps };
