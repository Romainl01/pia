import * as Notifications from 'expo-notifications';
import {
  formatBirthdayTitle,
  formatBirthdayBody,
  formatCatchUpTitle,
  formatCatchUpBody,
  isBirthdayToday,
  isBirthdayOnDate,
  getRandomTimeInWindow,
  getDaysSinceLastContact,
  NotificationService,
} from './notificationService';

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  AndroidImportance: {
    MAX: 5,
  },
  SchedulableTriggerInputTypes: {
    DATE: 'date',
  },
}));

describe('notificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset to a fixed date for consistent testing
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-06-15T09:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('formatBirthdayTitle', () => {
    it('should format title for single friend (first name only)', () => {
      const friends = [{ name: 'John Doe' }];
      const title = formatBirthdayTitle(friends as any);
      expect(title).toBe("It's John's birthday 🎉");
    });

    it('should format title for two friends', () => {
      const friends = [{ name: 'John' }, { name: 'Jane' }];
      const title = formatBirthdayTitle(friends as any);
      expect(title).toBe("It's John and Jane's birthday 🎉");
    });

    it('should format title for three friends with "and X others"', () => {
      const friends = [{ name: 'John' }, { name: 'Jane' }, { name: 'Bob' }];
      const title = formatBirthdayTitle(friends as any);
      expect(title).toBe("It's John, Jane and 1 other's birthday 🎉");
    });

    it('should format title for many friends with "and X others"', () => {
      const friends = [
        { name: 'John' },
        { name: 'Jane' },
        { name: 'Bob' },
        { name: 'Alice' },
        { name: 'Charlie' },
      ];
      const title = formatBirthdayTitle(friends as any);
      expect(title).toBe("It's John, Jane and 3 others' birthday 🎉");
    });

    it('should use first name only (split by space)', () => {
      const friends = [{ name: 'John Michael Doe' }];
      const title = formatBirthdayTitle(friends as any);
      expect(title).toBe("It's John's birthday 🎉");
    });
  });

  describe('formatBirthdayBody', () => {
    it('should return the birthday body message', () => {
      const body = formatBirthdayBody();
      expect(body).toBe('Send wishes, make their day!');
    });
  });

  describe('formatCatchUpTitle', () => {
    it('should format catch-up title with friend name', () => {
      const friend = { name: 'John Doe' };
      const title = formatCatchUpTitle(friend as any);
      expect(title).toBe("Catch'up with John Doe");
    });
  });

  describe('formatCatchUpBody', () => {
    it('should format body with singular "day"', () => {
      const body = formatCatchUpBody(1);
      expect(body).toBe('You last checked in 1 day ago');
    });

    it('should format body with plural "days"', () => {
      const body = formatCatchUpBody(7);
      expect(body).toBe('You last checked in 7 days ago');
    });

    it('should handle 0 days (today)', () => {
      const body = formatCatchUpBody(0);
      expect(body).toBe('You last checked in today');
    });
  });

  describe('isBirthdayToday', () => {
    it('should return true when birthday matches today (MM-DD)', () => {
      // Today is June 15
      const result = isBirthdayToday('1990-06-15');
      expect(result).toBe(true);
    });

    it('should return false when birthday does not match today', () => {
      const result = isBirthdayToday('1990-06-16');
      expect(result).toBe(false);
    });

    it('should handle birthday without year (MM-DD format)', () => {
      const result = isBirthdayToday('06-15');
      expect(result).toBe(true);
    });

    it('should handle leap year birthday (Feb 29) on Feb 28 in non-leap year', () => {
      jest.setSystemTime(new Date('2023-02-28T09:00:00')); // Non-leap year
      const result = isBirthdayToday('2000-02-29');
      expect(result).toBe(true);
    });

    it('should not show Feb 29 birthday on Feb 28 in leap year', () => {
      jest.setSystemTime(new Date('2024-02-28T09:00:00')); // Leap year
      const result = isBirthdayToday('2000-02-29');
      expect(result).toBe(false);
    });

    it('should show Feb 29 birthday on Feb 29 in leap year', () => {
      jest.setSystemTime(new Date('2024-02-29T09:00:00')); // Leap year
      const result = isBirthdayToday('2000-02-29');
      expect(result).toBe(true);
    });

    it('should return false for empty birthday', () => {
      const result = isBirthdayToday('');
      expect(result).toBe(false);
    });

    it('should return false for null/undefined birthday', () => {
      const result = isBirthdayToday(null as any);
      expect(result).toBe(false);
    });
  });

  describe('isBirthdayOnDate', () => {
    it('should check if birthday matches specific date', () => {
      const result = isBirthdayOnDate('1990-06-15', new Date('2024-06-15'));
      expect(result).toBe(true);
    });

    it('should return false for non-matching date', () => {
      const result = isBirthdayOnDate('1990-06-15', new Date('2024-06-16'));
      expect(result).toBe(false);
    });
  });

  describe('getRandomTimeInWindow', () => {
    it('should return a time within the 9-10 AM window', () => {
      const time = getRandomTimeInWindow(9, 10);
      const hours = time.getHours();
      const minutes = time.getMinutes();

      expect(hours).toBe(9);
      expect(minutes).toBeGreaterThanOrEqual(0);
      expect(minutes).toBeLessThan(60);
    });

    it('should return different times on multiple calls', () => {
      // Reset random to allow natural randomness
      jest.spyOn(Math, 'random')
        .mockReturnValueOnce(0.1)
        .mockReturnValueOnce(0.9);

      const time1 = getRandomTimeInWindow(9, 10);
      const time2 = getRandomTimeInWindow(9, 10);

      expect(time1.getMinutes()).not.toBe(time2.getMinutes());

      jest.spyOn(Math, 'random').mockRestore();
    });

    it('should set the date to tomorrow', () => {
      const time = getRandomTimeInWindow(9, 10);
      const tomorrow = new Date('2024-06-16');

      expect(time.getDate()).toBe(tomorrow.getDate());
      expect(time.getMonth()).toBe(tomorrow.getMonth());
    });
  });

  describe('getDaysSinceLastContact', () => {
    it('should calculate days since last contact', () => {
      const lastContactAt = '2024-06-08'; // 7 days ago
      const days = getDaysSinceLastContact(lastContactAt);
      expect(days).toBe(7);
    });

    it('should return 0 for today', () => {
      const lastContactAt = '2024-06-15'; // Today
      const days = getDaysSinceLastContact(lastContactAt);
      expect(days).toBe(0);
    });

    it('should handle dates in the future (negative days)', () => {
      const lastContactAt = '2024-06-20'; // 5 days in future
      const days = getDaysSinceLastContact(lastContactAt);
      expect(days).toBe(-5);
    });
  });

  describe('NotificationService', () => {
    describe('initialize', () => {
      it('should set notification handler', async () => {
        await NotificationService.initialize();

        expect(Notifications.setNotificationHandler).toHaveBeenCalledWith({
          handleNotification: expect.any(Function),
        });
      });
    });

    describe('cancelAllScheduled', () => {
      it('should cancel all scheduled notifications', async () => {
        await NotificationService.cancelAllScheduled();

        expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
      });
    });

    describe('scheduleBirthdayNotification', () => {
      it('should schedule a birthday notification', async () => {
        const friends = [{ id: 'friend-1', name: 'John', birthday: '1990-06-16' }];
        const triggerDate = new Date('2024-06-16T09:30:00');

        await NotificationService.scheduleBirthdayNotification(friends as any, triggerDate);

        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
          content: {
            title: "It's John's birthday 🎉",
            body: 'Send wishes, make their day!',
            data: { type: 'birthday', friendIds: ['friend-1'] },
          },
          trigger: {
            type: 'date',
            date: triggerDate,
          },
        });
      });
    });

    describe('scheduleCatchUpNotification', () => {
      it('should schedule a catch-up notification', async () => {
        const friend = {
          id: 'friend-1',
          name: 'John Doe',
          lastContactAt: '2024-06-08',
        };
        const triggerDate = new Date('2024-06-16T09:30:00');

        await NotificationService.scheduleCatchUpNotification(friend as any, triggerDate);

        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
          content: {
            title: "Catch'up with John Doe",
            body: 'You last checked in 7 days ago',
            data: { type: 'catchup', friendId: 'friend-1' },
          },
          trigger: {
            type: 'date',
            date: triggerDate,
          },
        });
      });
    });
  });
});
