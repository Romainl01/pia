import { useJournalStore } from './journalStore';

describe('journalStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useJournalStore.setState({ entries: {} });
  });

  describe('getEntryByDate', () => {
    it('should return undefined for non-existent entry', () => {
      const { getEntryByDate } = useJournalStore.getState();
      expect(getEntryByDate('2025-01-15')).toBeUndefined();
    });

    it('should return entry for existing date', () => {
      const { upsertEntry, getEntryByDate } = useJournalStore.getState();
      upsertEntry('2025-01-15', 'My journal entry');

      const entry = getEntryByDate('2025-01-15');
      expect(entry).toBeDefined();
      expect(entry?.content).toBe('My journal entry');
      expect(entry?.date).toBe('2025-01-15');
    });
  });

  describe('upsertEntry', () => {
    it('should create a new entry with correct fields', () => {
      const { upsertEntry, getEntryByDate } = useJournalStore.getState();
      const beforeCreate = new Date().toISOString();

      upsertEntry('2025-01-15', 'New entry content');

      const entry = getEntryByDate('2025-01-15');
      expect(entry).toBeDefined();
      expect(entry?.id).toBeDefined();
      expect(entry?.date).toBe('2025-01-15');
      expect(entry?.content).toBe('New entry content');
      expect(entry?.createdAt).toBeDefined();
      expect(entry?.updatedAt).toBeDefined();
      expect(new Date(entry!.createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(beforeCreate).getTime() - 1000
      );
    });

    it('should update existing entry and preserve createdAt', () => {
      const { upsertEntry, getEntryByDate } = useJournalStore.getState();

      // Create initial entry
      upsertEntry('2025-01-15', 'Original content');
      const originalEntry = getEntryByDate('2025-01-15');
      const originalCreatedAt = originalEntry?.createdAt;
      const originalId = originalEntry?.id;

      // Wait a tiny bit to ensure different timestamps
      const beforeUpdate = new Date().toISOString();

      // Update entry
      upsertEntry('2025-01-15', 'Updated content');

      const updatedEntry = getEntryByDate('2025-01-15');
      expect(updatedEntry?.content).toBe('Updated content');
      expect(updatedEntry?.id).toBe(originalId); // Same ID
      expect(updatedEntry?.createdAt).toBe(originalCreatedAt); // Preserved
      expect(new Date(updatedEntry!.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(beforeUpdate).getTime() - 1000
      );
    });

    it('should handle empty content', () => {
      const { upsertEntry, getEntryByDate } = useJournalStore.getState();

      upsertEntry('2025-01-15', '');

      const entry = getEntryByDate('2025-01-15');
      expect(entry?.content).toBe('');
    });
  });

  describe('deleteEntry', () => {
    it('should remove existing entry', () => {
      const { upsertEntry, deleteEntry, getEntryByDate } = useJournalStore.getState();

      upsertEntry('2025-01-15', 'Content to delete');
      expect(getEntryByDate('2025-01-15')).toBeDefined();

      deleteEntry('2025-01-15');
      expect(getEntryByDate('2025-01-15')).toBeUndefined();
    });

    it('should not throw when deleting non-existent entry', () => {
      const { deleteEntry } = useJournalStore.getState();

      expect(() => deleteEntry('2025-01-15')).not.toThrow();
    });
  });

  describe('hasEntryForDate', () => {
    it('should return false for non-existent entry', () => {
      const { hasEntryForDate } = useJournalStore.getState();
      expect(hasEntryForDate('2025-01-15')).toBe(false);
    });

    it('should return true for existing entry', () => {
      const { upsertEntry, hasEntryForDate } = useJournalStore.getState();

      upsertEntry('2025-01-15', 'Some content');
      expect(hasEntryForDate('2025-01-15')).toBe(true);
    });

    it('should return true even for empty content entry', () => {
      const { upsertEntry, hasEntryForDate } = useJournalStore.getState();

      upsertEntry('2025-01-15', '');
      expect(hasEntryForDate('2025-01-15')).toBe(true);
    });
  });

  describe('multiple entries', () => {
    it('should handle multiple dates independently', () => {
      const { upsertEntry, getEntryByDate, hasEntryForDate, deleteEntry } =
        useJournalStore.getState();

      upsertEntry('2025-01-15', 'Entry 1');
      upsertEntry('2025-01-16', 'Entry 2');
      upsertEntry('2025-01-17', 'Entry 3');

      expect(hasEntryForDate('2025-01-15')).toBe(true);
      expect(hasEntryForDate('2025-01-16')).toBe(true);
      expect(hasEntryForDate('2025-01-17')).toBe(true);
      expect(getEntryByDate('2025-01-15')?.content).toBe('Entry 1');
      expect(getEntryByDate('2025-01-16')?.content).toBe('Entry 2');
      expect(getEntryByDate('2025-01-17')?.content).toBe('Entry 3');

      deleteEntry('2025-01-16');

      expect(hasEntryForDate('2025-01-15')).toBe(true);
      expect(hasEntryForDate('2025-01-16')).toBe(false);
      expect(hasEntryForDate('2025-01-17')).toBe(true);
    });
  });
});
