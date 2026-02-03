import { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FriendDetailSheet } from '@/src/features/friends';
import { useFriendsStore } from '@/src/stores/friendsStore';
import { colors } from '@/src/constants/colors';
import { typography } from '@/src/constants/typography';

export default function FriendDetailScreen(): React.ReactElement {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  // Select friends array directly to avoid infinite loop from getFriendById
  // creating new object references when migrating notes field
  const friends = useFriendsStore((state) => state.friends);
  const friend = useMemo(() => {
    const found = friends.find((f) => f.id === id);
    if (!found) return undefined;
    // Handle legacy data without notes field
    return found.notes === undefined ? { ...found, notes: '' } : found;
  }, [friends, id]);

  const updateFriendNotes = useFriendsStore((state) => state.updateFriendNotes);
  const setPendingEditFriend = useFriendsStore((state) => state.setPendingEditFriend);

  const handleNotesChange = useCallback(
    (notes: string) => {
      if (id) {
        updateFriendNotes(id, notes);
      }
    },
    [id, updateFriendNotes]
  );

  const handleEdit = useCallback(() => {
    if (friend) {
      setPendingEditFriend(friend);
      router.back();
      // Navigate to add-friend after a slight delay to let the sheet dismiss
      setTimeout(() => {
        router.push('/add-friend');
      }, 300);
    }
  }, [friend, setPendingEditFriend]);

  if (!friend) {
    return (
      <View style={[styles.errorContainer, { paddingBottom: insets.bottom }]}>
        <Text style={styles.errorText}>Friend not found</Text>
      </View>
    );
  }

  return (
    <View style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
      <FriendDetailSheet
        friend={friend}
        onEdit={handleEdit}
        onNotesChange={handleNotesChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    ...typography.body1,
    color: colors.neutralGray,
    textAlign: 'center',
  },
});
