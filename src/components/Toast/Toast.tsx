import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { useToastStore } from '@/src/stores/toastStore';
import { colors } from '@/src/constants/colors';
import { typography } from '@/src/constants/typography';

const AUTO_DISMISS_MS = 4000;
const TAB_BAR_HEIGHT = 80;

function Toast(): React.ReactElement | null {
  const { visible, message, undoAction, hideToast, toastId } = useToastStore();
  const insets = useSafeAreaInsets();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  if (!visible) return null;

  return (
    <Animated.View
      key={toastId}
      entering={FadeInUp.duration(200)}
      exiting={FadeOutDown.duration(200)}
      style={[styles.container, { bottom: insets.bottom + TAB_BAR_HEIGHT + 16 }]}
      testID="toast-container"
    >
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
    borderRadius: 16,
    borderCurve: 'continuous',
    borderWidth: 2,
    borderColor: `${colors.primary}40`,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  glass: {
    borderRadius: 15,
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
