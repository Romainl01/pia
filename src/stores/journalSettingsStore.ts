import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { JournalColorScheme } from '@/src/constants/colors';

interface JournalSettingsState {
  colorScheme: JournalColorScheme;
  setColorScheme: (scheme: JournalColorScheme) => void;
}

export const useJournalSettingsStore = create<JournalSettingsState>()(
  persist(
    (set) => ({
      colorScheme: 'A',

      setColorScheme: (scheme) => set({ colorScheme: scheme }),
    }),
    {
      name: 'journal-settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        colorScheme: state.colorScheme,
      }),
    }
  )
);
