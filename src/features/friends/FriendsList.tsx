import { useMemo, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { FriendCard } from './FriendCard';
import { FilteredEmptyState } from './FilteredEmptyState';
import { useFriendsStore, Friend } from '@/src/stores/friendsStore';
import { useToastStore } from '@/src/stores/toastStore';
import { getDaysRemaining } from '@/src/utils';
import { colors } from '@/src/constants/colors';
import { typography } from '@/src/constants/typography';

interface FriendsListProps {
  onFriendPress?: (friend: Friend) => void;
  onAddFriend?: () => void;
}

function Separator(): React.ReactElement {
  return <View style={styles.separator} />;
}

function FriendsList({ onFriendPress, onAddFriend }: FriendsListProps): React.ReactElement {
  const friends = useFriendsStore((state) => state.friends);
  const selectedCategory = useFriendsStore((state) => state.selectedCategory);
  const logCatchUp = useFriendsStore((state) => state.logCatchUp);
  const undoCatchUp = useFriendsStore((state) => state.undoCatchUp);
  const showToast = useToastStore((state) => state.showToast);

  // Filter by category and sort by urgency (most urgent/overdue first)
  // Dependencies are primitive/array values that React can compare correctly
  const sortedFriends = useMemo(() => {
    const filtered = selectedCategory
      ? friends.filter((f) => f.category === selectedCategory)
      : friends;
    return [...filtered].sort((a, b) =>
      getDaysRemaining(a.lastContactAt, a.frequencyDays) -
      getDaysRemaining(b.lastContactAt, b.frequencyDays)
    );
  }, [friends, selectedCategory]);

  const handleCatchUp = useCallback((friend: Friend) => {
    const previousDate = logCatchUp(friend.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast(`Caught up with ${friend.name}!`, () => {
      if (previousDate) {
        undoCatchUp(friend.id, previousDate);
      }
    });
  }, [logCatchUp, undoCatchUp, showToast]);

  // Show general empty state when user has no friends at all
  if (friends.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No friends yet</Text>
        <Text style={styles.emptySubtext}>Add your first friend to get started!</Text>
      </View>
    );
  }

  // Show filtered empty state when filter has no matches but friends exist
  if (sortedFriends.length === 0 && selectedCategory !== null) {
    return (
      <FilteredEmptyState
        category={selectedCategory}
        onAddFriend={onAddFriend ?? (() => {})}
      />
    );
  }

  return (
    <FlatList
      data={sortedFriends}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <FriendCard
          friend={item}
          onPress={() => onFriendPress?.(item)}
          onCatchUp={() => handleCatchUp(item)}
        />
      )}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={Separator}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
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
