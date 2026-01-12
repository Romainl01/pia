import { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { FriendCard } from './FriendCard';
import { useFriendsStore, Friend } from '@/src/stores/friendsStore';
import { colors } from '@/src/constants/colors';
import { typography } from '@/src/constants/typography';

interface FriendsListProps {
  onFriendPress?: (friend: Friend) => void;
}

/**
 * Calculate days remaining until next check-in.
 * Negative values mean overdue.
 */
function getDaysRemaining(friend: Friend): number {
  const lastContact = new Date(friend.lastContactAt);
  const today = new Date();

  lastContact.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const daysSinceContact = Math.floor(
    (today.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24)
  );

  return friend.frequencyDays - daysSinceContact;
}

function Separator(): React.ReactElement {
  return <View style={styles.separator} />;
}

function FriendsList({ onFriendPress }: FriendsListProps): React.ReactElement {
  const friends = useFriendsStore((state) => state.friends);

  // Sort friends by urgency (most urgent/overdue first)
  const sortedFriends = useMemo(() => {
    return [...friends].sort((a, b) => getDaysRemaining(a) - getDaysRemaining(b));
  }, [friends]);

  if (friends.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No friends yet</Text>
        <Text style={styles.emptySubtext}>Add your first friend to get started!</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={sortedFriends}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <FriendCard friend={item} onPress={() => onFriendPress?.(item)} />
      )}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={Separator}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 8,
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    ...typography.titleH2,
    color: colors.neutralGray300,
    marginBottom: 8,
  },
  emptySubtext: {
    ...typography.body1,
    color: colors.neutralGray,
    textAlign: 'center',
  },
});

export { FriendsList };
export type { FriendsListProps };
