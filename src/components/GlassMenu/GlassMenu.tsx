import { useEffect, useRef, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { GlassView } from 'expo-glass-effect';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';
import { colors } from '@/src/constants/colors';

/**
 * Position of the anchor element (trigger) measured with measureInWindow()
 */
export interface AnchorPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * A menu item with a label and value
 */
export interface GlassMenuItem<T> {
  label: string;
  value: T;
}

interface GlassMenuProps<T> {
  /** Whether the menu is visible */
  visible: boolean;
  /** Callback when menu should close */
  onClose: () => void;
  /** Menu items to display */
  items: GlassMenuItem<T>[];
  /** Currently selected value (shows checkmark) */
  selectedValue?: T;
  /** Callback when an item is selected */
  onSelect: (value: T) => void;
  /** Position of the anchor element */
  anchorPosition: AnchorPosition | null;
  /** Test ID for the menu container */
  testID?: string;
}

const MENU_BORDER_RADIUS = 16;
const ITEM_HEIGHT = 48;
const MENU_PADDING_VERTICAL = 6;
const SCREEN_EDGE_PADDING = 16;
const MENU_WIDTH = 160;

/**
 * A dropdown menu with iOS glass effect background.
 * Positions itself relative to an anchor element and animates in/out.
 *
 * @example
 * ```tsx
 * const triggerRef = useRef<View>(null);
 * const [menuVisible, setMenuVisible] = useState(false);
 * const [anchorPosition, setAnchorPosition] = useState<AnchorPosition | null>(null);
 *
 * const openMenu = () => {
 *   triggerRef.current?.measureInWindow((x, y, width, height) => {
 *     setAnchorPosition({ x, y, width, height });
 *     setMenuVisible(true);
 *   });
 * };
 *
 * <Pressable ref={triggerRef} onPress={openMenu}>...</Pressable>
 * <GlassMenu
 *   visible={menuVisible}
 *   onClose={() => setMenuVisible(false)}
 *   items={[{ label: 'Option 1', value: 1 }]}
 *   selectedValue={selectedValue}
 *   onSelect={setSelectedValue}
 *   anchorPosition={anchorPosition}
 * />
 * ```
 */
export function GlassMenu<T>({
  visible,
  onClose,
  items,
  selectedValue,
  onSelect,
  anchorPosition,
  testID,
}: GlassMenuProps<T>): React.ReactElement | null {
  const scaleAnim = useRef(new Animated.Value(0.97)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 300,
          friction: 25,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset for next open
      scaleAnim.setValue(0.97);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);

  const handleClose = useCallback(() => {
    // Animate out
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [scaleAnim, opacityAnim, onClose]);

  const handleSelect = useCallback(
    (value: T) => {
      Haptics.selectionAsync();
      onSelect(value);
      handleClose();
    },
    [onSelect, handleClose]
  );

  if (!visible || !anchorPosition) {
    return null;
  }

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const menuHeight = items.length * ITEM_HEIGHT + MENU_PADDING_VERTICAL * 2;

  // Calculate available space above and below the anchor
  const spaceBelow = screenHeight - (anchorPosition.y + anchorPosition.height);
  const spaceAbove = anchorPosition.y;
  const showAbove = spaceBelow < menuHeight + SCREEN_EDGE_PADDING && spaceAbove > spaceBelow;

  // Position menu ABOVE the anchor, with bottom of menu near top of anchor
  const menuTop = anchorPosition.y - menuHeight - 4;

  // Fixed width menu, aligned to right edge of anchor
  const anchorRight = anchorPosition.x + anchorPosition.width;
  const menuLeft = Math.max(
    SCREEN_EDGE_PADDING,
    anchorRight - MENU_WIDTH
  );

  // Unused but kept for potential future use
  void showAbove;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Animated.View
          style={[
            styles.menuWrapper,
            {
              top: menuTop,
              left: menuLeft,
              width: MENU_WIDTH,
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
          testID={testID}
        >
          {/* Prevent press events from bubbling to backdrop */}
          <Pressable>
            <GlassView style={styles.menuContainer} glassEffectStyle="regular">
              {/* Fallback background for non-iOS 26 */}
              <View style={styles.fallbackBackground} />

              {items.map((item, index) => {
                const isSelected = selectedValue === item.value;
                const isLast = index === items.length - 1;

                return (
                  <Pressable
                    key={String(item.value)}
                    style={({ pressed }) => [
                      styles.menuItem,
                      !isLast && styles.menuItemWithBorder,
                      pressed && styles.menuItemPressed,
                    ]}
                    onPress={() => handleSelect(item.value)}
                    testID={`${testID}-item-${item.value}`}
                  >
                    <Text
                      style={[
                        styles.menuItemText,
                        isSelected && styles.menuItemTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <SymbolView
                        name="checkmark"
                        size={18}
                        weight="semibold"
                        tintColor={colors.primary}
                      />
                    )}
                  </Pressable>
                );
              })}
            </GlassView>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  menuWrapper: {
    position: 'absolute',
    // Scale from bottom-right since menu appears above and aligns to right
    transformOrigin: 'bottom right',
  },
  menuContainer: {
    borderRadius: MENU_BORDER_RADIUS,
    overflow: 'hidden',
    paddingVertical: MENU_PADDING_VERTICAL,
    // Shadow for depth
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fallbackBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    // Only visible on non-iOS 26 where GlassView falls back to View
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: ITEM_HEIGHT,
  },
  menuItemWithBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  menuItemPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  menuItemText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    color: colors.neutralDark,
  },
  menuItemTextSelected: {
    fontFamily: 'Inter_500Medium',
    color: colors.primary,
  },
});
