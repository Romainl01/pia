import { useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { EmptyFriendsScreen, FriendsList } from '@/src/features/friends';
import { GlassButton } from '@/src/components/GlassButton';
import { CategoryFilterButton } from '@/src/components/CategoryFilterButton';
import { useContacts } from '@/src/hooks/useContacts';
import { useFriendsStore } from '@/src/stores/friendsStore';
import { colors } from '@/src/constants/colors';
import { typography } from '@/src/constants/typography';

/**
 * Friends tab - shows list of friends or empty state
 * Handles the add friend flow: native contact picker → modal sheet
 */
// Standard iOS tab bar height (49px) + safe area bottom inset
const TAB_BAR_HEIGHT = 49;

export default function FriendsScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const tabBarHeight = TAB_BAR_HEIGHT + insets.bottom;
  const friends = useFriendsStore((state) => state.friends);
  const hasFriend = useFriendsStore((state) => state.hasFriend);
  const setPendingContact = useFriendsStore((state) => state.setPendingContact);
  const selectedCategory = useFriendsStore((state) => state.selectedCategory);
  const setSelectedCategory = useFriendsStore((state) => state.setSelectedCategory);
  const { pickContact, isPicking, permissionStatus } = useContacts();

  const handleAddFriend = useCallback(async () => {
    if (isPicking) return;

    const contact = await pickContact();

    if (!contact) {
      if (permissionStatus === 'denied') {
        Alert.alert(
          'Contacts Access Required',
          'Please enable contacts access in Settings to add friends.',
          [{ text: 'OK' }]
        );
      }
      return;
    }

    if (hasFriend(contact.name)) {
      Alert.alert(
        'Already Added',
        `${contact.name} is already in your friends list.`,
        [{ text: 'OK' }]
      );
      return;
    }

    setPendingContact(contact);
    router.push('/add-friend');
  }, [pickContact, isPicking, permissionStatus, hasFriend, setPendingContact]);

  const hasFriends = friends.length > 0;

  if (!hasFriends) {
    return (
      <View style={styles.root}>
        <EmptyFriendsScreen onAddFriend={handleAddFriend} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Pia</Text>
        </View>

        <View style={styles.filterContainer}>
          <CategoryFilterButton
            value={selectedCategory}
            onChange={setSelectedCategory}
          />
        </View>

        <View style={styles.listContainer}>
          <FriendsList onAddFriend={handleAddFriend} />
        </View>
      </View>

      {/* Floating Action Button */}
      <GlassButton
        onPress={handleAddFriend}
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
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  title: {
    ...typography.titleH1,
    color: colors.neutralDark,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 100,
  },
  listContainer: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 20,
  },
});
