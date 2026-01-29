import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";
import { GlassButton } from "@/src/components/GlassButton";
import { colors } from "@/src/constants/colors";
import { typography } from "@/src/constants/typography";

interface EmptyFriendsScreenProps {
  onAddFriend: () => void;
}

// Standard iOS tab bar height (49px) + safe area bottom inset
const TAB_BAR_HEIGHT = 49;

/**
 * Empty state screen shown when the user has no friends added yet.
 * Features liquid glass buttons for the + icon and "Add a friend" CTA.
 *
 * TODO: Add fallback icon for Android/Web using @expo/vector-icons
 * The SymbolView "plus" icon only works on iOS.
 */
export function EmptyFriendsScreen({ onAddFriend }: EmptyFriendsScreenProps) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = TAB_BAR_HEIGHT + insets.bottom;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pia</Text>
      </View>

      {/* Hero Section */}
      <View style={styles.heroContainer}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Keep your closest within reach</Text>
          <Text style={styles.heroSubtitle}>
            Add friends to stay in touch, share memories, and never miss a
            birthday
          </Text>
          <GlassButton
            onPress={onAddFriend}
            label="Add a friend"
            testID="add-friend-cta"
          />
        </View>
      </View>

      {/* Floating Action Button */}
      <GlassButton
        onPress={onAddFriend}
        size={56}
        style={[styles.fab, { bottom: tabBarHeight + 16 }]}
        icon={
          <SymbolView
            name="person.fill.badge.plus"
            size={28}
            weight="semibold"
            tintColor={colors.primary}
          />
        }
        testID="add-friend-button"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 16,
  },
  title: {
    ...typography.titleH1,
    color: colors.neutralDark,
  },
  heroContainer: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 120,
  },
  hero: {
    alignItems: "center",
    gap: 16,
  },
  heroTitle: {
    ...typography.titleH1,
    color: colors.neutralGray300,
    textAlign: "center",
  },
  heroSubtitle: {
    ...typography.body1,
    color: colors.neutralGray300,
    textAlign: "center",
    lineHeight: 24,
  },
  fab: {
    position: "absolute",
    right: 20,
  },
});
