import { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, StyleProp, ViewStyle, GestureResponderEvent } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';
import { GlassMenu, GlassMenuItem } from '@/src/components/GlassMenu';
import { useTheme } from '@/src/hooks/useTheme';
import type { FriendCategory } from '@/src/stores/friendsStore';
import { RELATIONSHIP_LABELS } from '@/src/stores/friendsStore';

interface CategoryFilterButtonProps {
  /** Currently selected category, null means "All" */
  value: FriendCategory | null;
  /** Callback when selection changes */
  onChange: (category: FriendCategory | null) => void;
  /** Optional style for the container */
  style?: StyleProp<ViewStyle>;
}

type MenuValue = FriendCategory | null;

const CATEGORY_MENU_ITEMS: GlassMenuItem<MenuValue>[] = [
  { label: 'All', value: null },
  { label: RELATIONSHIP_LABELS.friend, value: 'friend' },
  { label: RELATIONSHIP_LABELS.family, value: 'family' },
  { label: RELATIONSHIP_LABELS.work, value: 'work' },
  { label: RELATIONSHIP_LABELS.partner, value: 'partner' },
  { label: RELATIONSHIP_LABELS.flirt, value: 'flirt' },
];

/**
 * A liquid glass pill button that opens a dropdown menu for category filtering.
 * Replaces the horizontal RelationshipFilter pills with a more compact design.
 */
function CategoryFilterButton({
  value,
  onChange,
  style,
}: CategoryFilterButtonProps): React.ReactElement {
  const { colors } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const [anchorPoint, setAnchorPoint] = useState<{ x: number; y: number } | undefined>();

  const selectedLabel = value ? RELATIONSHIP_LABELS[value] : 'All';

  const handlePressIn = useCallback((event: GestureResponderEvent) => {
    // Capture touch point for menu animation origin
    const { locationX, locationY } = event.nativeEvent;
    setAnchorPoint({ x: locationX, y: locationY });
  }, []);

  const handlePress = useCallback(() => {
    Haptics.selectionAsync();
    setShowMenu(true);
  }, []);

  const handleClose = useCallback(() => setShowMenu(false), []);

  return (
    <View style={[styles.container, style]}>
      <Pressable
        onPressIn={handlePressIn}
        onPress={handlePress}
        testID="category-filter-button"
        accessibilityRole="button"
        accessibilityLabel="Filter by category"
        accessibilityState={{ expanded: showMenu }}
      >
        <GlassView isInteractive style={styles.filterPill}>
          <View style={styles.content}>
            <Text style={[styles.label, { color: colors.neutralDark }]}>{selectedLabel}</Text>
            <SymbolView
              name="chevron.down"
              size={12}
              weight="medium"
              tintColor={colors.neutralDark}
            />
          </View>
        </GlassView>
      </Pressable>

      <GlassMenu<MenuValue>
        visible={showMenu}
        onClose={handleClose}
        items={CATEGORY_MENU_ITEMS}
        selectedValue={value}
        onSelect={onChange}
        direction="down"
        alignment="left"
        testID="category-filter-menu"
        anchorPoint={anchorPoint}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    position: 'relative',
    zIndex: 100,
  },
  filterPill: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 1000,
    height: 40,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
  },
});

export { CategoryFilterButton };
export type { CategoryFilterButtonProps };
