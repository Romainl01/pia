import { useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/hooks/useTheme';

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
  /** Direction the menu opens: 'up' (default) or 'down' */
  direction?: 'up' | 'down';
  /** Horizontal alignment of the menu: 'left' or 'right' (default) */
  alignment?: 'left' | 'right';
  /** Test ID for the menu container */
  testID?: string;
  /** Touch point for scale animation origin (relative to trigger element) */
  anchorPoint?: { x: number; y: number };
}

const MENU_BORDER_RADIUS = 16;
const ITEM_HEIGHT = 48;
const MENU_PADDING_VERTICAL = 6;
const MENU_WIDTH = 160;

// Animation constants
const SCALE_START = 0.85;
const SPRING_CONFIG = { damping: 15, stiffness: 150 };
const CLOSE_DURATION = 100;

const DIRECTION_STYLES = {
  down: { top: '100%' as const, marginTop: 4 },
  up: { bottom: '100%' as const, marginBottom: 4 },
} as const;

function getDirectionStyles(direction: 'up' | 'down') {
  return DIRECTION_STYLES[direction];
}

/**
 * Calculate the transform origin offset for scale animation from anchor point.
 * When no anchorPoint is provided, uses corner-based origin (0 or MENU_WIDTH).
 */
function getAnchorOffset(
  anchorPoint: { x: number; y: number } | undefined,
  direction: 'up' | 'down',
  alignment: 'left' | 'right',
  menuHeight: number
): { offsetX: number; offsetY: number } {
  if (anchorPoint) {
    // Use touch point as origin
    // Clamp X within menu width for predictable behavior
    const offsetX = Math.min(Math.max(anchorPoint.x, 0), MENU_WIDTH);
    // For Y, use the edge closest to the trigger
    const offsetY = direction === 'down' ? 0 : menuHeight;
    return { offsetX, offsetY };
  }

  // Fallback to corner-based origin
  const offsetX = alignment === 'left' ? 0 : MENU_WIDTH;
  const offsetY = direction === 'down' ? 0 : menuHeight;
  return { offsetX, offsetY };
}

export function GlassMenu<T>({
  visible,
  onClose,
  items,
  selectedValue,
  onSelect,
  direction = 'up',
  alignment = 'right',
  testID,
  anchorPoint,
}: GlassMenuProps<T>): React.ReactElement | null {
  const { colors, isDark } = useTheme();

  // Reanimated shared values
  const scale = useSharedValue(SCALE_START);
  const opacity = useSharedValue(0);

  // Calculate menu height for transform origin
  const menuHeight = items.length * ITEM_HEIGHT + MENU_PADDING_VERTICAL * 2;
  const { offsetX, offsetY } = getAnchorOffset(anchorPoint, direction, alignment, menuHeight);

  useEffect(() => {
    if (visible) {
      // Animate in with spring for scale, timing for opacity
      scale.value = withSpring(1, SPRING_CONFIG);
      opacity.value = withTiming(1, { duration: 150 });
    } else {
      // Reset for next open
      scale.value = SCALE_START;
      opacity.value = 0;
    }
  }, [visible, scale, opacity]);

  const handleClose = useCallback(() => {
    // Animate out then call onClose
    scale.value = withTiming(SCALE_START, { duration: CLOSE_DURATION });
    opacity.value = withTiming(0, { duration: CLOSE_DURATION }, (finished) => {
      'worklet';
      if (finished) {
        runOnJS(onClose)();
      }
    });
  }, [scale, opacity, onClose]);

  const handleSelect = useCallback(
    (value: T) => {
      Haptics.selectionAsync();
      onSelect(value);
      handleClose();
    },
    [onSelect, handleClose]
  );

  // Animated style with scale-from-anchor-point using translate-scale-translate pattern
  const animatedStyle = useAnimatedStyle(() => {
    const currentScale = scale.value;
    return {
      opacity: opacity.value,
      transform: [
        // Move origin to anchor point
        { translateX: offsetX },
        { translateY: offsetY },
        // Scale
        { scale: currentScale },
        // Move back, accounting for scale
        { translateX: -offsetX },
        { translateY: -offsetY },
      ],
    };
  });

  if (!visible) {
    return null;
  }

  return (
    <>
      {/* Backdrop - covers parent container to catch outside taps */}
      <Pressable style={styles.backdrop} onPress={handleClose} />

      {/* Menu - positioned absolutely relative to the row */}
      <Animated.View
        style={[
          styles.menuWrapper,
          alignment === 'left' ? { left: 0 } : { right: 0 },
          getDirectionStyles(direction),
          animatedStyle,
        ]}
        testID={testID}
      >
        {/* Inner Pressable prevents taps from bubbling to backdrop */}
        <Pressable>
          <BlurView
            tint={isDark ? 'dark' : 'extraLight'}
            intensity={80}
            style={styles.menuContainer}
          >
            {items.map((item) => {
              const isSelected = selectedValue === item.value;

              return (
                <Pressable
                  key={String(item.value)}
                  style={({ pressed }) => [
                    styles.menuItem,
                    pressed && { backgroundColor: colors.menuItemPressed },
                  ]}
                  onPress={() => handleSelect(item.value)}
                  testID={`${testID}-item-${item.value}`}
                >
                  <Text
                    style={[
                      styles.menuItemText,
                      { color: colors.neutralDark },
                      isSelected && { fontFamily: 'Inter_500Medium', color: colors.primary },
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
          </BlurView>
        </Pressable>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    // Extend far beyond the container to cover the entire screen
    top: -2000,
    left: -2000,
    right: -2000,
    bottom: -2000,
    zIndex: 999,
  },
  menuWrapper: {
    position: 'absolute',
    width: MENU_WIDTH,
    zIndex: 1000,
    // Modern CSS boxShadow syntax
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
  },
  menuContainer: {
    borderRadius: MENU_BORDER_RADIUS,
    overflow: 'hidden',
    paddingVertical: MENU_PADDING_VERTICAL,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: ITEM_HEIGHT,
  },
  menuItemText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
  },
});
