import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SelectedContact } from '@/src/hooks/useContacts';

export type FriendCategory = 'friend' | 'family' | 'work' | 'partner' | 'flirt';

export const RELATIONSHIP_LABELS: Record<FriendCategory, string> = {
  friend: 'Friend',
  family: 'Family',
  work: 'Work',
  partner: 'Partner',
  flirt: 'Flirt',
};

export interface Friend {
  id: string;
  name: string;
  photoUrl: string | null;
  birthday: string; // ISO date string (YYYY-MM-DD) or MM-DD if no year
  frequencyDays: number;
  lastContactAt: string; // ISO date string (YYYY-MM-DD)
  category: FriendCategory;
  createdAt: string; // ISO timestamp
}

export type NewFriend = Omit<Friend, 'id' | 'createdAt'>;

interface FriendsState {
  friends: Friend[];
  pendingContact: SelectedContact | null;
  selectedCategory: FriendCategory | null;
  addFriend: (friend: NewFriend) => void;
  removeFriend: (id: string) => void;
  hasFriend: (name: string) => boolean;
  getFriendById: (id: string) => Friend | undefined;
  setPendingContact: (contact: SelectedContact | null) => void;
  logCatchUp: (friendId: string) => string | undefined;
  undoCatchUp: (friendId: string, previousLastContactAt: string) => void;
  setSelectedCategory: (category: FriendCategory | null) => void;
}

/**
 * Generates a unique ID for a friend
 * Uses timestamp + random string for uniqueness
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export const useFriendsStore = create<FriendsState>()(
  persist(
    (set, get) => ({
      friends: [],
      pendingContact: null,
      selectedCategory: null,

      setPendingContact: (contact) => {
        set({ pendingContact: contact });
      },

      addFriend: (newFriend) => {
        const friend: Friend = {
          ...newFriend,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          friends: [...state.friends, friend],
        }));
      },

      removeFriend: (id) => {
        set((state) => ({
          friends: state.friends.filter((friend) => friend.id !== id),
        }));
      },

      hasFriend: (name) => {
        const { friends } = get();
        const normalizedName = name.toLowerCase();
        return friends.some((friend) => friend.name.toLowerCase() === normalizedName);
      },

      getFriendById: (id) => {
        const { friends } = get();
        return friends.find((friend) => friend.id === id);
      },

      logCatchUp: (friendId) => {
        const { friends } = get();
        const friend = friends.find((f) => f.id === friendId);
        if (!friend) return undefined;

        const previousDate = friend.lastContactAt;
        const today = new Date().toISOString().split('T')[0];

        set((state) => ({
          friends: state.friends.map((f) =>
            f.id === friendId ? { ...f, lastContactAt: today } : f
          ),
        }));

        return previousDate;
      },

      undoCatchUp: (friendId, previousLastContactAt) => {
        set((state) => ({
          friends: state.friends.map((f) =>
            f.id === friendId ? { ...f, lastContactAt: previousLastContactAt } : f
          ),
        }));
      },

      setSelectedCategory: (category) => {
        set({ selectedCategory: category });
      },
    }),
    {
      name: 'friends-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        friends: state.friends,
        selectedCategory: state.selectedCategory,
      }),
    }
  )
);
