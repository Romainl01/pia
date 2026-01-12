import { useState, useCallback } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  EmptyFriendsScreen,
  AddFriendSheet,
  FriendsList,
} from "@/src/features/friends";
import { GlassButton } from "@/src/components/GlassButton";
import { useContacts, SelectedContact } from "@/src/hooks/useContacts";
import { useFriendsStore } from "@/src/stores/friendsStore";
import { colors } from "@/src/constants/colors";
import { typography } from "@/src/constants/typography";

/**
 * Friends tab - shows list of friends or empty state
 * Handles the add friend flow: native contact picker → form sheet
 */
export default function FriendsScreen() {
  const insets = useSafeAreaInsets();
  const friends = useFriendsStore((state) => state.friends);
  const hasFriend = useFriendsStore((state) => state.hasFriend);
  const { pickContact, isPicking, permissionStatus } = useContacts();

  // Sheet state
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<SelectedContact | null>(null);

  const handleAddFriend = useCallback(async () => {
    if (isPicking) return;

    const contact = await pickContact();

    if (!contact) {
      if (permissionStatus === "denied") {
        Alert.alert(
          "Contacts Access Required",
          "Please enable contacts access in Settings to add friends.",
          [{ text: "OK" }]
        );
      }
      return;
    }

    if (hasFriend(contact.name)) {
      Alert.alert(
        "Already Added",
        `${contact.name} is already in your friends list.`,
        [{ text: "OK" }]
      );
      return;
    }

    setSelectedContact(contact);
    setIsSheetOpen(true);
  }, [pickContact, isPicking, permissionStatus, hasFriend]);

  const handleCloseSheet = useCallback(() => {
    setIsSheetOpen(false);
    setSelectedContact(null);
  }, []);

  const hasFriends = friends.length > 0;

  // Show empty state
  if (!hasFriends) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <EmptyFriendsScreen onAddFriend={handleAddFriend} />
        <AddFriendSheet
          isOpen={isSheetOpen}
          onClose={handleCloseSheet}
          selectedContact={selectedContact}
        />
      </GestureHandlerRootView>
    );
  }

  // Show friends list
  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Pia</Text>
          <GlassButton
            onPress={handleAddFriend}
            size={40}
            icon={
              <SymbolView
                name="plus"
                size={22}
                weight="semibold"
                tintColor={colors.primary}
              />
            }
            testID="add-friend-button"
          />
        </View>

        {/* Friends List */}
        <FriendsList />
      </View>

      <AddFriendSheet
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        selectedContact={selectedContact}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  title: {
    ...typography.titleH1,
    color: colors.neutralDark,
  },
});
