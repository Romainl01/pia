import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Avatar } from '@/src/components/Avatar';
import { Friend } from '@/src/stores/friendsStore';
import { colors } from '@/src/constants/colors';
import { typography } from '@/src/constants/typography';

interface FriendCardProps {
  friend: Friend;
  onPress?: () => void;
}

type CheckInStatus = 'on-track' | 'due-soon' | 'due-today' | 'overdue';

/**
 * Calculates days remaining until next check-in.
 * Negative values mean overdue.
 */
function getDaysRemaining(lastContactAt: string, frequencyDays: number): number {
  const lastContact = new Date(lastContactAt);
  const today = new Date();

  lastContact.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const daysSinceContact = Math.floor(
    (today.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24)
  );

  return frequencyDays - daysSinceContact;
}

function getCheckInStatus(daysRemaining: number): CheckInStatus {
  if (daysRemaining < 0) return 'overdue';
  if (daysRemaining === 0) return 'due-today';
  if (daysRemaining <= 3) return 'due-soon';
  return 'on-track';
}

function getStatusLabel(daysRemaining: number, status: CheckInStatus): string {
  if (status === 'overdue') return `${Math.abs(daysRemaining)} days overdue`;
  if (status === 'due-today') return 'Check in today';
  return `${daysRemaining} days`;
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

function FriendCard({ friend, onPress }: FriendCardProps): React.ReactElement {
  const daysRemaining = getDaysRemaining(friend.lastContactAt, friend.frequencyDays);
  const status = getCheckInStatus(daysRemaining);
  const statusLabel = getStatusLabel(daysRemaining, status);
  const statusColor = getStatusColor(status);

  return (
    <Pressable
      style={styles.container}
      onPress={onPress}
      accessibilityLabel={`${friend.name}, ${statusLabel}`}
      accessibilityRole="button"
    >
      <Avatar
        name={friend.name}
        imageUri={friend.photoUrl ?? undefined}
        size={56}
      />

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {friend.name}
        </Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusLabel}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.neutralWhite,
    borderRadius: 16,
    gap: 12,
    // Subtle shadow
    shadowColor: colors.neutralDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  name: {
    ...typography.body1,
    color: colors.neutralDark,
    fontWeight: '600',
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
    fontSize: 14,
  },
});

export { FriendCard };
export type { FriendCardProps };
