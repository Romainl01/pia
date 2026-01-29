import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

interface JournalState {
  entries: Record<string, JournalEntry>; // keyed by date (YYYY-MM-DD)
  getEntryByDate: (date: string) => JournalEntry | undefined;
  upsertEntry: (date: string, content: string) => void;
  deleteEntry: (date: string) => void;
  hasEntryForDate: (date: string) => boolean;
}

/**
 * Generates a unique ID for an entry
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: {},

      getEntryByDate: (date) => {
        const { entries } = get();
        return entries[date];
      },

      upsertEntry: (date, content) => {
        const { entries } = get();
        const existing = entries[date];
        const now = new Date().toISOString();

        const entry: JournalEntry = existing
          ? { ...existing, content, updatedAt: now }
          : { id: generateId(), date, content, createdAt: now, updatedAt: now };

        set({ entries: { ...entries, [date]: entry } });
      },

      deleteEntry: (date) => {
        const { entries } = get();
        const { [date]: _, ...remaining } = entries;
        set({ entries: remaining });
      },

      hasEntryForDate: (date) => {
        const { entries } = get();
        return date in entries;
      },
    }),
    {
      name: 'journal-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        entries: state.entries,
      }),
    }
  )
);
