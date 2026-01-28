import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FriendsList } from './FriendsList';
import { useFriendsStore, FriendCategory } from '@/src/stores/friendsStore';

// Helper to format date in local time (avoids UTC timezone issues)
const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

describe('FriendsList', () => {
  beforeEach(() => {
    useFriendsStore.setState({ friends: [], selectedCategory: null });
  });

  describe('empty state', () => {
    it('should render empty message when no friends', () => {
      const { getByText } = render(<FriendsList />);
      expect(getByText(/no friends yet/i)).toBeTruthy();
    });
  });

  describe('with friends', () => {
    const today = toLocalDateString(new Date());

    beforeEach(() => {
      useFriendsStore.setState({
        friends: [
          {
            id: '1',
            name: 'Alice Smith',
            photoUrl: null,
            birthday: '1990-01-01',
            frequencyDays: 7,
            lastContactAt: today,
            category: 'friend',
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Bob Johnson',
            photoUrl: 'https://example.com/bob.jpg',
            birthday: '1985-06-15',
            frequencyDays: 14,
            lastContactAt: today,
            category: 'friend',
            createdAt: new Date().toISOString(),
          },
        ],
      });
    });

    it('should render all friends', () => {
      const { getByText } = render(<FriendsList />);
      expect(getByText('Alice Smith')).toBeTruthy();
      expect(getByText('Bob Johnson')).toBeTruthy();
    });

    it('should not render empty message', () => {
      const { queryByText } = render(<FriendsList />);
      expect(queryByText(/no friends yet/i)).toBeNull();
    });
  });

  describe('sorting', () => {
    it('should sort friends by urgency (most urgent first)', () => {
      const daysAgo = (days: number) => {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return toLocalDateString(date);
      };

      useFriendsStore.setState({
        friends: [
          {
            id: '1',
            name: 'On Track Friend',
            photoUrl: null,
            birthday: '1990-01-01',
            frequencyDays: 30,
            lastContactAt: daysAgo(5), // 25 days remaining
            category: 'friend',
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Overdue Friend',
            photoUrl: null,
            birthday: '1985-06-15',
            frequencyDays: 7,
            lastContactAt: daysAgo(10), // 3 days overdue
            category: 'friend',
            createdAt: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Due Soon Friend',
            photoUrl: null,
            birthday: '1988-03-20',
            frequencyDays: 14,
            lastContactAt: daysAgo(12), // 2 days remaining
            category: 'friend',
            createdAt: new Date().toISOString(),
          },
        ],
      });

      const { getAllByRole } = render(<FriendsList />);
      // Filter to only get card buttons (those with friend name in label)
      const cardButtons = getAllByRole('button').filter(
        (btn) => btn.props.accessibilityLabel && !btn.props.accessibilityLabel.includes('Mark catch up')
      );

      // Should be sorted: Overdue (-3), Due Soon (2), On Track (25)
      expect(cardButtons[0].props.accessibilityLabel).toContain('Overdue Friend');
      expect(cardButtons[1].props.accessibilityLabel).toContain('Due Soon Friend');
      expect(cardButtons[2].props.accessibilityLabel).toContain('On Track Friend');
    });
  });

  describe('filtering', () => {
    const today = toLocalDateString(new Date());

    const createFriend = (overrides: { id: string; name: string; category: FriendCategory }) => ({
      ...overrides,
      photoUrl: null,
      birthday: '1990-01-01',
      frequencyDays: 7,
      lastContactAt: today,
      createdAt: new Date().toISOString(),
    });

    beforeEach(() => {
      useFriendsStore.setState({
        friends: [
          createFriend({ id: '1', name: 'Alice (Friend)', category: 'friend' }),
          createFriend({ id: '2', name: 'Bob (Family)', category: 'family' }),
          createFriend({ id: '3', name: 'Carol (Work)', category: 'work' }),
          createFriend({ id: '4', name: 'Dave (Family)', category: 'family' }),
        ],
        selectedCategory: null,
      });
    });

    it('should show all friends when no filter is selected', () => {
      const { getByText } = render(<FriendsList />);

      expect(getByText('Alice (Friend)')).toBeTruthy();
      expect(getByText('Bob (Family)')).toBeTruthy();
      expect(getByText('Carol (Work)')).toBeTruthy();
      expect(getByText('Dave (Family)')).toBeTruthy();
    });

    it('should show only matching friends when category filter is selected', () => {
      useFriendsStore.setState({ selectedCategory: 'family' });

      const { getByText, queryByText } = render(<FriendsList />);

      expect(getByText('Bob (Family)')).toBeTruthy();
      expect(getByText('Dave (Family)')).toBeTruthy();
      expect(queryByText('Alice (Friend)')).toBeNull();
      expect(queryByText('Carol (Work)')).toBeNull();
    });

    it('should show filtered empty state when filter has no matches', () => {
      useFriendsStore.setState({ selectedCategory: 'partner' });
      const mockOnAddFriend = jest.fn();

      const { getByText } = render(<FriendsList onAddFriend={mockOnAddFriend} />);

      expect(getByText('No partner yet')).toBeTruthy();
      expect(getByText('Never forget important dates')).toBeTruthy();
    });

    it('should call onAddFriend when add button in filtered empty state is pressed', () => {
      useFriendsStore.setState({ selectedCategory: 'partner' });
      const mockOnAddFriend = jest.fn();

      const { getByTestId } = render(<FriendsList onAddFriend={mockOnAddFriend} />);

      fireEvent.press(getByTestId('filtered-empty-add-button'));
      expect(mockOnAddFriend).toHaveBeenCalledTimes(1);
    });

    it('should show general empty state when no friends exist', () => {
      useFriendsStore.setState({ friends: [], selectedCategory: 'family' });

      const { getByText, queryByText } = render(<FriendsList />);

      // Should show general empty state, not filtered empty state
      expect(getByText(/no friends yet/i)).toBeTruthy();
      expect(queryByText('No family yet')).toBeNull();
    });
  });
});
