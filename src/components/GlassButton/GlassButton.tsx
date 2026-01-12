import { Pressable, StyleSheet, Text, View, ViewStyle, StyleProp } from "react-native";
import { GlassView } from "expo-glass-effect";
import { colors } from "@/src/constants/colors";

interface GlassButtonProps {
  onPress: () => void;
  label?: string;
  icon?: React.ReactNode;
  size?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Liquid Glass button component using iOS 26+ GlassView.
 * Supports both icon-only (circular) and text (pill) variants.
 */
function GlassButton({
  onPress,
  label,
  icon,
  size = 40,
  style,
  testID,
}: GlassButtonProps): React.ReactElement {
  const isIconOnly = !label && icon;

  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [pressed && styles.pressed, style]}
    >
      <GlassView
        isInteractive
        style={[
          styles.glass,
          isIconOnly
            ? { width: size, height: size, borderRadius: size / 2 }
            : styles.pillShape,
        ]}
      >
        <View style={styles.content}>
          {icon}
          {label && <Text style={styles.label}>{label}</Text>}
        </View>
      </GlassView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.8,
  },
  glass: {
    justifyContent: "center",
    alignItems: "center",
  },
  pillShape: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 1000,
    height: 48,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 36,
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 17,
    fontWeight: "500",
    color: colors.neutralDark,
    textAlign: "center",
  },
});

export { GlassButton };
export type { GlassButtonProps };
