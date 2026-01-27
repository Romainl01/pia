import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { Avatar } from '@/src/components/Avatar';
import { Friend, RELATIONSHIP_LABELS } from '@/src/stores/friendsStore';
import { getDaysRemaining, getRelativeLastContact } from '@/src/utils';
import { colors } from '@/src/constants/colors';
import { typography } from '@/src/constants/typography';

interface FriendCardProps {
  friend: Friend;
  onPress?: () => void;
  onCatchUp?: () => void;
}

type CheckInStatus = 'on-track' | 'due-soon' | 'due-today' | 'overdue';

function getCheckInStatus(daysRemaining: number): CheckInStatus {
  if (daysRemaining < 0) return 'overdue';
  if (daysRemaining === 0) return 'due-today';
  if (daysRemaining <= 3) return 'due-soon';
  return 'on-track';
}

function getStatusColor(status: CheckInStatus): string {
  switch (status) {
    case 'overdue':
      return colors.feedbackError;
    case 'due-today':
    case 'due-soon':
      return colors.primary;
    case 'on-track':
      return colors.feedbackSuccess;
  }
}

function FriendCard({ friend, onPress, onCatchUp }: FriendCardProps): React.ReactElement {
  const daysRemaining = getDaysRemaining(friend.lastContactAt, friend.frequencyDays);
  const status = getCheckInStatus(daysRemaining);
  const statusColor = getStatusColor(status);
  const relativeDate = getRelativeLastContact(friend.lastContactAt);

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={`${friend.name}, ${relativeDate}`}
      accessibilityRole="button"
      style={styles.shadowWrapper}
    >
      <View style={styles.container}>
        <Avatar
          name={friend.name}
          imageUri={friend.photoUrl ?? undefined}
          size={56}
        />

        <View style={styles.content}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {friend.name}
            </Text>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>
                {RELATIONSHIP_LABELS[friend.category]}
              </Text>
            </View>
          </View>
          <View style={styles.statusContainer}>
            <View
              style={[styles.statusDot, { backgroundColor: statusColor }]}
              testID="status-dot"
            />
            <Text style={styles.statusText}>
              Last seen {relativeDate.toLowerCase()}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={onCatchUp}
          testID="catchup-button"
          accessibilityLabel={`Mark catch up with ${friend.name}`}
          accessibilityRole="button"
          hitSlop={8}
          style={styles.catchUpButton}
        >
          <SymbolView
            name="checkmark.circle.fill"
            size={36}
            tintColor={colors.primary}
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 6,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surfaceCard,
    borderRadius: 16,
    overflow: 'hidden',
    gap: 12,
  },
  content: {
    flex: 1,
    gap: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    ...typography.body1,
    color: colors.neutralDark,
    fontWeight: '600',
    flexShrink: 1,
  },
  categoryPill: {
    borderWidth: 1,
    borderColor: 'rgba(242, 140, 89, 0.4)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.neutralGray,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...typography.body2,
    color: colors.neutralGray,
  },
  catchUpButton: {
    padding: 4,
  },
});

export { FriendCard };
export type { FriendCardProps };
