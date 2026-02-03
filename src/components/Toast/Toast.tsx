import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Pressable, LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeInUp,
  FadeOutDown,
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Rect } from 'react-native-svg';
import { useToastStore } from '@/src/stores/toastStore';
import { colors } from '@/src/constants/colors';
import { typography } from '@/src/constants/typography';

const AUTO_DISMISS_MS = 4000;
const TAB_BAR_HEIGHT = 80;
const BORDER_RADIUS = 16;
const BORDER_WIDTH = 2;

const AnimatedRect = Animated.createAnimatedComponent(Rect);

/**
 * Calculates the perimeter of a rounded rectangle.
 * For SVG stroke animations, we need the exact path length.
 */
function calculateRoundedRectPerimeter(
  width: number,
  height: number,
  radius: number
): number {
  // Perimeter = 2 * (width - 2r) + 2 * (height - 2r) + 2 * π * r
  const straightWidth = Math.max(0, width - 2 * radius);
  const straightHeight = Math.max(0, height - 2 * radius);
  const cornerCircumference = 2 * Math.PI * radius;
  return 2 * straightWidth + 2 * straightHeight + cornerCircumference;
}

interface BurningFuseBorderProps {
  width: number;
  height: number;
  duration: number;
  toastId: string;
}

/**
 * Animated SVG border that "burns away" clockwise like a fuse.
 * The border starts full and progressively disappears over the duration.
 */
function BurningFuseBorder({
  width,
  height,
  duration,
  toastId,
}: BurningFuseBorderProps): React.ReactElement {
  const perimeter = calculateRoundedRectPerimeter(
    width - BORDER_WIDTH,
    height - BORDER_WIDTH,
    BORDER_RADIUS - BORDER_WIDTH / 2
  );

  const progress = useSharedValue(0);

  useEffect(() => {
    // Reset and start animation when toast appears
    progress.value = 0;
    progress.value = withTiming(perimeter, {
      duration,
      easing: Easing.linear,
    });
  }, [toastId, perimeter, duration]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: progress.value,
  }));

  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width={width}
      height={height}
    >
      <AnimatedRect
        x={BORDER_WIDTH / 2}
        y={BORDER_WIDTH / 2}
        width={width - BORDER_WIDTH}
        height={height - BORDER_WIDTH}
        rx={BORDER_RADIUS - BORDER_WIDTH / 2}
        ry={BORDER_RADIUS - BORDER_WIDTH / 2}
        stroke={colors.feedbackSuccess}
        strokeWidth={BORDER_WIDTH}
        fill="none"
        strokeDasharray={perimeter}
        animatedProps={animatedProps}
      />
    </Svg>
  );
}

function Toast(): React.ReactElement | null {
  const { visible, message, undoAction, hideToast, toastId } = useToastStore();
  const insets = useSafeAreaInsets();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (visible) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        hideToast();
      }, AUTO_DISMISS_MS);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible, hideToast, toastId]);

  const handleUndo = () => {
    undoAction?.();
    hideToast();
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
  };

  if (!visible) return null;

  return (
    <Animated.View
      key={toastId}
      entering={FadeInUp.duration(200)}
      exiting={FadeOutDown.duration(200)}
      style={[styles.container, { bottom: insets.bottom + TAB_BAR_HEIGHT + 16 }]}
      testID="toast-container"
      onLayout={handleLayout}
    >
      {dimensions.width > 0 && dimensions.height > 0 && (
        <BurningFuseBorder
          width={dimensions.width}
          height={dimensions.height}
          duration={AUTO_DISMISS_MS}
          toastId={String(toastId)}
        />
      )}
      <BlurView tint="extraLight" intensity={100} style={styles.glass}>
        <View style={styles.content}>
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>
          {undoAction && (
            <Pressable
              onPress={handleUndo}
              testID="toast-undo-button"
              hitSlop={8}
            >
              <Text style={styles.undoButton}>Undo</Text>
            </Pressable>
          )}
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 1000,
    borderRadius: BORDER_RADIUS,
    borderCurve: 'continuous',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
  },
  glass: {
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  message: {
    ...typography.body1,
    color: colors.neutralDark,
    flex: 1,
  },
  undoButton: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: '600',
  },
});

export { Toast };
