import { View, Text, StyleSheet } from 'react-native';
import { GlassButton } from '@/src/components/GlassButton';
import { colors } from '@/src/constants/colors';
import { typography } from '@/src/constants/typography';
import type { FriendCategory } from '@/src/stores/friendsStore';
import { RELATIONSHIP_LABELS } from '@/src/stores/friendsStore';

interface FilteredEmptyStateProps {
  category: FriendCategory;
  onAddFriend: () => void;
}

// Contextual button labels and subtitles for each category
const CATEGORY_CTA_LABELS: Record<FriendCategory, string> = {
  friend: 'Add a friend',
  family: 'Add a family member',
  work: 'Add a colleague',
  partner: 'Add a partner',
  flirt: 'Add a flirt',
};

const CATEGORY_SUBTITLES: Record<FriendCategory, string> = {
  friend: 'Add someone from your contacts',
  family: 'Keep track of birthdays and catch-ups',
  work: 'Stay connected with your professional network',
  partner: 'Never forget important dates',
  flirt: 'Keep the spark alive',
};

function FilteredEmptyState({ category, onAddFriend }: FilteredEmptyStateProps): React.ReactElement {
  const categoryLabel = RELATIONSHIP_LABELS[category];
  const ctaLabel = CATEGORY_CTA_LABELS[category];
  const subtitle = CATEGORY_SUBTITLES[category];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>No {categoryLabel.toLowerCase()} yet</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <GlassButton
        onPress={onAddFriend}
        label={ctaLabel}
        testID="filtered-empty-add-button"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    paddingBottom: 140, // Offset upward to account for header + filter
    gap: 16,
  },
  title: {
    ...typography.titleH2,
    color: colors.neutralGray300,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body1,
    color: colors.neutralGray,
    textAlign: 'center',
  },
});

export { FilteredEmptyState };
export type { FilteredEmptyStateProps };
