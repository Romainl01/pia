import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationStateStore {
  // State
  lastBirthdayNotificationDate: string | null;
  lastCatchUpNotificationDates: Record<string, string>; // friendId -> ISO date
  hasRequestedPermission: boolean;
  pendingPermissionRequest: boolean;

  // Actions
  setLastBirthdayNotificationDate: (date: string | null) => void;
  setLastCatchUpNotificationDate: (friendId: string, date: string) => void;
  clearCatchUpNotificationDate: (friendId: string) => void;
  setHasRequestedPermission: (requested: boolean) => void;
  setPendingPermissionRequest: (pending: boolean) => void;

  // Helpers
  shouldSendBirthdayNotification: () => boolean;
  shouldSendCatchUpNotification: (friendId: string, frequencyDays: number) => boolean;

  // Reset
  reset: () => void;
}

const initialState = {
  lastBirthdayNotificationDate: null,
  lastCatchUpNotificationDates: {},
  hasRequestedPermission: false,
  pendingPermissionRequest: false,
};

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Calculate days between two date strings
 */
function daysBetween(dateString1: string, dateString2: string): number {
  const date1 = new Date(dateString1);
  const date2 = new Date(dateString2);

  date1.setHours(0, 0, 0, 0);
  date2.setHours(0, 0, 0, 0);

  const diffTime = date2.getTime() - date1.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export const useNotificationStateStore = create<NotificationStateStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setLastBirthdayNotificationDate: (date) => {
        set({ lastBirthdayNotificationDate: date });
      },

      setLastCatchUpNotificationDate: (friendId, date) => {
        set((state) => ({
          lastCatchUpNotificationDates: {
            ...state.lastCatchUpNotificationDates,
            [friendId]: date,
          },
        }));
      },

      clearCatchUpNotificationDate: (friendId) => {
        set((state) => {
          const { [friendId]: _, ...rest } = state.lastCatchUpNotificationDates;
          return { lastCatchUpNotificationDates: rest };
        });
      },

      setHasRequestedPermission: (requested) => {
        set({ hasRequestedPermission: requested });
      },

      setPendingPermissionRequest: (pending) => {
        set({ pendingPermissionRequest: pending });
      },

      shouldSendBirthdayNotification: () => {
        const { lastBirthdayNotificationDate } = get();
        if (!lastBirthdayNotificationDate) return true;

        const today = getTodayDateString();
        return lastBirthdayNotificationDate !== today;
      },

      shouldSendCatchUpNotification: (friendId, frequencyDays) => {
        const { lastCatchUpNotificationDates } = get();
        const lastNotified = lastCatchUpNotificationDates[friendId];

        if (!lastNotified) return true;

        const today = getTodayDateString();
        const daysSinceNotified = daysBetween(lastNotified, today);

        // Only notify again if enough days have passed (based on frequency)
        return daysSinceNotified >= frequencyDays;
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'notification-state-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
