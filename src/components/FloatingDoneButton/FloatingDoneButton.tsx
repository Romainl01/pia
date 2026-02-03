import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassButton } from '@/src/components/GlassButton';
import { colors } from '@/src/constants/colors';

interface FloatingDoneButtonProps {
  hasContent: boolean;
  onPress: () => void;
}

/**
 * Floating "Done" button that appears above the keyboard.
 * Uses liquid glass styling and animates in/out with fade.
 */
function FloatingDoneButton({
  hasContent,
  onPress,
}: FloatingDoneButtonProps): React.ReactElement | null {
  const insets = useSafeAreaInsets();
  const keyboard = useAnimatedKeyboard();

  const animatedStyle = useAnimatedStyle(() => {
    // When keyboard is open, position 8px above it (no safe area needed)
    // When keyboard is closed, include safe area inset
    const keyboardOpen = keyboard.height.value > 0;
    return {
      bottom: keyboardOpen ? 8 : insets.bottom + 8,
      transform: [{ translateY: -keyboard.height.value }],
    };
  });

  if (!hasContent) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(150)}
      style={[styles.container, animatedStyle]}
    >
      <GlassButton
        label="Done"
        onPress={onPress}
        testID="done-button"
        labelColor={colors.primary}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    zIndex: 100,
  },
});

export { FloatingDoneButton };
export type { FloatingDoneButtonProps };
