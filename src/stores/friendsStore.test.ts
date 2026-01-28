import { useFriendsStore, Friend, FriendCategory } from './friendsStore';

describe('friendsStore', () => {
  // Reset store state before each test
  beforeEach(() => {
    useFriendsStore.setState({ friends: [], selectedCategory: null });
  });

  // Helper to create test friends
  const createTestFriend = (overrides: Partial<Omit<Friend, 'id' | 'createdAt'>> = {}): Omit<Friend, 'id' | 'createdAt'> => ({
    name: 'Test Friend',
    photoUrl: null,
    birthday: '1990-01-01',
    frequencyDays: 7,
    lastContactAt: '2024-01-01',
    category: 'friend',
    ...overrides,
  });

  describe('initial state', () => {
    it('should start with empty friends list', () => {
      const { friends } = useFriendsStore.getState();
      expect(friends).toEqual([]);
    });
  });

  describe('addFriend', () => {
    it('should add a friend to the list', () => {
      const { addFriend } = useFriendsStore.getState();

      const newFriend: Omit<Friend, 'id' | 'createdAt'> = {
        name: 'John Doe',
        photoUrl: 'https://example.com/photo.jpg',
        birthday: '1992-12-15',
        frequencyDays: 14,
        lastContactAt: '2024-01-10',
        category: 'friend',
      };

      addFriend(newFriend);

      const { friends } = useFriendsStore.getState();
      expect(friends).toHaveLength(1);
      expect(friends[0].name).toBe('John Doe');
      expect(friends[0].photoUrl).toBe('https://example.com/photo.jpg');
      expect(friends[0].birthday).toBe('1992-12-15');
      expect(friends[0].frequencyDays).toBe(14);
      expect(friends[0].lastContactAt).toBe('2024-01-10');
      expect(friends[0].category).toBe('friend');
    });

    it('should generate an id for the new friend', () => {
      const { addFriend } = useFriendsStore.getState();

      addFriend({
        name: 'Jane Doe',
        photoUrl: null,
        birthday: '1990-05-20',
        frequencyDays: 30,
        lastContactAt: '2024-01-15',
        category: 'family',
      });

      const { friends } = useFriendsStore.getState();
      expect(friends[0].id).toBeTruthy();
      expect(typeof friends[0].id).toBe('string');
    });

    it('should add createdAt timestamp', () => {
      const { addFriend } = useFriendsStore.getState();
      const beforeAdd = new Date().toISOString();

      addFriend({
        name: 'Test User',
        photoUrl: null,
        birthday: '1985-03-10',
        frequencyDays: 7,
        lastContactAt: '2024-01-01',
        category: 'work',
      });

      const { friends } = useFriendsStore.getState();
      const afterAdd = new Date().toISOString();

      expect(friends[0].createdAt).toBeTruthy();
      expect(friends[0].createdAt >= beforeAdd).toBe(true);
      expect(friends[0].createdAt <= afterAdd).toBe(true);
    });

    it('should store the category field', () => {
      const { addFriend } = useFriendsStore.getState();

      const categories: FriendCategory[] = ['friend', 'family', 'work', 'partner', 'flirt'];
      categories.forEach((category) => {
        addFriend({ name: `Test ${category}`, photoUrl: null, birthday: '1990-01-01', frequencyDays: 7, lastContactAt: '2024-01-01', category });
      });

      const { friends } = useFriendsStore.getState();
      expect(friends).toHaveLength(5);
      categories.forEach((category, index) => {
        expect(friends[index].category).toBe(category);
      });
    });

    it('should allow adding multiple friends', () => {
      const { addFriend } = useFriendsStore.getState();

      addFriend({ name: 'Friend 1', photoUrl: null, birthday: '1990-01-01', frequencyDays: 7, lastContactAt: '2024-01-01', category: 'friend' });
      addFriend({ name: 'Friend 2', photoUrl: null, birthday: '1991-02-02', frequencyDays: 14, lastContactAt: '2024-01-02', category: 'family' });
      addFriend({ name: 'Friend 3', photoUrl: null, birthday: '1992-03-03', frequencyDays: 30, lastContactAt: '2024-01-03', category: 'work' });

      const { friends } = useFriendsStore.getState();
      expect(friends).toHaveLength(3);
    });
  });

  describe('removeFriend', () => {
    it('should remove a friend by id', () => {
      const { addFriend, removeFriend } = useFriendsStore.getState();

      addFriend({ name: 'To Remove', photoUrl: null, birthday: '1990-01-01', frequencyDays: 7, lastContactAt: '2024-01-01', category: 'friend' });

      const { friends: friendsAfterAdd } = useFriendsStore.getState();
      const friendId = friendsAfterAdd[0].id;

      removeFriend(friendId);

      const { friends: friendsAfterRemove } = useFriendsStore.getState();
      expect(friendsAfterRemove).toHaveLength(0);
    });

    it('should only remove the specified friend', () => {
      const { addFriend, removeFriend } = useFriendsStore.getState();

      addFriend({ name: 'Keep Me', photoUrl: null, birthday: '1990-01-01', frequencyDays: 7, lastContactAt: '2024-01-01', category: 'friend' });
      addFriend({ name: 'Remove Me', photoUrl: null, birthday: '1991-02-02', frequencyDays: 14, lastContactAt: '2024-01-02', category: 'friend' });

      const { friends: friendsAfterAdd } = useFriendsStore.getState();
      const friendToRemove = friendsAfterAdd.find(f => f.name === 'Remove Me')!;

      removeFriend(friendToRemove.id);

      const { friends: friendsAfterRemove } = useFriendsStore.getState();
      expect(friendsAfterRemove).toHaveLength(1);
      expect(friendsAfterRemove[0].name).toBe('Keep Me');
    });
  });

  describe('hasFriend', () => {
    it('should return true if friend with name exists', () => {
      const { addFriend, hasFriend } = useFriendsStore.getState();

      addFriend({ name: 'John Doe', photoUrl: null, birthday: '1990-01-01', frequencyDays: 7, lastContactAt: '2024-01-01', category: 'friend' });

      expect(hasFriend('John Doe')).toBe(true);
    });

    it('should return false if friend with name does not exist', () => {
      const { hasFriend } = useFriendsStore.getState();

      expect(hasFriend('Unknown Person')).toBe(false);
    });

    it('should be case-insensitive', () => {
      const { addFriend, hasFriend } = useFriendsStore.getState();

      addFriend({ name: 'John Doe', photoUrl: null, birthday: '1990-01-01', frequencyDays: 7, lastContactAt: '2024-01-01', category: 'friend' });

      expect(hasFriend('john doe')).toBe(true);
      expect(hasFriend('JOHN DOE')).toBe(true);
    });
  });

  describe('getFriendById', () => {
    it('should return the friend with matching id', () => {
      const { addFriend, getFriendById } = useFriendsStore.getState();

      addFriend({ name: 'John Doe', photoUrl: null, birthday: '1990-01-01', frequencyDays: 7, lastContactAt: '2024-01-01', category: 'friend' });

      const { friends } = useFriendsStore.getState();
      const friend = getFriendById(friends[0].id);

      expect(friend).toBeTruthy();
      expect(friend?.name).toBe('John Doe');
    });

    it('should return undefined for non-existent id', () => {
      const { getFriendById } = useFriendsStore.getState();

      const friend = getFriendById('non-existent-id');
      expect(friend).toBeUndefined();
    });
  });

  describe('logCatchUp', () => {
    it('should update lastContactAt to today', () => {
      const { addFriend, logCatchUp } = useFriendsStore.getState();

      addFriend({ name: 'John Doe', photoUrl: null, birthday: '1990-01-01', frequencyDays: 7, lastContactAt: '2024-01-01', category: 'friend' });

      const { friends: friendsBefore } = useFriendsStore.getState();
      const friendId = friendsBefore[0].id;

      logCatchUp(friendId);

      const { friends: friendsAfter } = useFriendsStore.getState();
      const today = new Date().toISOString().split('T')[0];
      expect(friendsAfter[0].lastContactAt).toBe(today);
    });

    it('should return the previous lastContactAt value', () => {
      const { addFriend, logCatchUp } = useFriendsStore.getState();

      addFriend({ name: 'John Doe', photoUrl: null, birthday: '1990-01-01', frequencyDays: 7, lastContactAt: '2024-01-01', category: 'friend' });

      const { friends } = useFriendsStore.getState();
      const friendId = friends[0].id;

      const previousDate = logCatchUp(friendId);

      expect(previousDate).toBe('2024-01-01');
    });

    it('should return undefined for non-existent friend', () => {
      const { logCatchUp } = useFriendsStore.getState();

      const result = logCatchUp('non-existent-id');

      expect(result).toBeUndefined();
    });

    it('should only update the specified friend', () => {
      const { addFriend, logCatchUp } = useFriendsStore.getState();

      addFriend({ name: 'Friend 1', photoUrl: null, birthday: '1990-01-01', frequencyDays: 7, lastContactAt: '2024-01-01', category: 'friend' });
      addFriend({ name: 'Friend 2', photoUrl: null, birthday: '1991-02-02', frequencyDays: 14, lastContactAt: '2024-01-02', category: 'friend' });

      const { friends: friendsBefore } = useFriendsStore.getState();
      const friend1Id = friendsBefore[0].id;

      logCatchUp(friend1Id);

      const { friends: friendsAfter } = useFriendsStore.getState();
      expect(friendsAfter[1].lastContactAt).toBe('2024-01-02'); // Unchanged
    });
  });

  describe('undoCatchUp', () => {
    it('should restore the previous lastContactAt value', () => {
      const { addFriend, logCatchUp, undoCatchUp } = useFriendsStore.getState();

      addFriend({ name: 'John Doe', photoUrl: null, birthday: '1990-01-01', frequencyDays: 7, lastContactAt: '2024-01-01', category: 'friend' });

      const { friends } = useFriendsStore.getState();
      const friendId = friends[0].id;

      const previousDate = logCatchUp(friendId);
      undoCatchUp(friendId, previousDate!);

      const { friends: friendsAfter } = useFriendsStore.getState();
      expect(friendsAfter[0].lastContactAt).toBe('2024-01-01');
    });

    it('should not throw for non-existent friend', () => {
      const { undoCatchUp } = useFriendsStore.getState();

      expect(() => undoCatchUp('non-existent-id', '2024-01-01')).not.toThrow();
    });
  });

  describe('selectedCategory', () => {
    it('should default to null (All)', () => {
      const { selectedCategory } = useFriendsStore.getState();
      expect(selectedCategory).toBeNull();
    });

    it('should update when setSelectedCategory is called', () => {
      const { setSelectedCategory } = useFriendsStore.getState();

      setSelectedCategory('family');

      const { selectedCategory } = useFriendsStore.getState();
      expect(selectedCategory).toBe('family');
    });

    it('should allow setting back to null', () => {
      const { setSelectedCategory } = useFriendsStore.getState();

      setSelectedCategory('work');
      setSelectedCategory(null);

      const { selectedCategory } = useFriendsStore.getState();
      expect(selectedCategory).toBeNull();
    });
  });
});
