import { useNotificationStateStore } from './notificationStateStore';

describe('notificationStateStore', () => {
  // Reset store state before each test
  beforeEach(() => {
    useNotificationStateStore.setState({
      lastBirthdayNotificationDate: null,
      lastCatchUpNotificationDates: {},
      hasRequestedPermission: false,
      pendingPermissionRequest: false,
    });
  });

  describe('initial state', () => {
    it('should start with null lastBirthdayNotificationDate', () => {
      const { lastBirthdayNotificationDate } = useNotificationStateStore.getState();
      expect(lastBirthdayNotificationDate).toBeNull();
    });

    it('should start with empty lastCatchUpNotificationDates', () => {
      const { lastCatchUpNotificationDates } = useNotificationStateStore.getState();
      expect(lastCatchUpNotificationDates).toEqual({});
    });

    it('should start with hasRequestedPermission as false', () => {
      const { hasRequestedPermission } = useNotificationStateStore.getState();
      expect(hasRequestedPermission).toBe(false);
    });

    it('should start with pendingPermissionRequest as false', () => {
      const { pendingPermissionRequest } = useNotificationStateStore.getState();
      expect(pendingPermissionRequest).toBe(false);
    });
  });

  describe('setLastBirthdayNotificationDate', () => {
    it('should update lastBirthdayNotificationDate', () => {
      const { setLastBirthdayNotificationDate } = useNotificationStateStore.getState();
      const today = '2024-06-15';

      setLastBirthdayNotificationDate(today);

      const { lastBirthdayNotificationDate } = useNotificationStateStore.getState();
      expect(lastBirthdayNotificationDate).toBe(today);
    });

    it('should allow setting to null', () => {
      const { setLastBirthdayNotificationDate } = useNotificationStateStore.getState();

      setLastBirthdayNotificationDate('2024-06-15');
      setLastBirthdayNotificationDate(null);

      const { lastBirthdayNotificationDate } = useNotificationStateStore.getState();
      expect(lastBirthdayNotificationDate).toBeNull();
    });
  });

  describe('setLastCatchUpNotificationDate', () => {
    it('should set notification date for a specific friend', () => {
      const { setLastCatchUpNotificationDate } = useNotificationStateStore.getState();

      setLastCatchUpNotificationDate('friend-1', '2024-06-15');

      const { lastCatchUpNotificationDates } = useNotificationStateStore.getState();
      expect(lastCatchUpNotificationDates['friend-1']).toBe('2024-06-15');
    });

    it('should update existing friend notification date', () => {
      const { setLastCatchUpNotificationDate } = useNotificationStateStore.getState();

      setLastCatchUpNotificationDate('friend-1', '2024-06-14');
      setLastCatchUpNotificationDate('friend-1', '2024-06-15');

      const { lastCatchUpNotificationDates } = useNotificationStateStore.getState();
      expect(lastCatchUpNotificationDates['friend-1']).toBe('2024-06-15');
    });

    it('should handle multiple friends independently', () => {
      const { setLastCatchUpNotificationDate } = useNotificationStateStore.getState();

      setLastCatchUpNotificationDate('friend-1', '2024-06-14');
      setLastCatchUpNotificationDate('friend-2', '2024-06-15');
      setLastCatchUpNotificationDate('friend-3', '2024-06-16');

      const { lastCatchUpNotificationDates } = useNotificationStateStore.getState();
      expect(lastCatchUpNotificationDates['friend-1']).toBe('2024-06-14');
      expect(lastCatchUpNotificationDates['friend-2']).toBe('2024-06-15');
      expect(lastCatchUpNotificationDates['friend-3']).toBe('2024-06-16');
    });
  });

  describe('clearCatchUpNotificationDate', () => {
    it('should remove notification date for a specific friend', () => {
      const { setLastCatchUpNotificationDate, clearCatchUpNotificationDate } =
        useNotificationStateStore.getState();

      setLastCatchUpNotificationDate('friend-1', '2024-06-15');
      clearCatchUpNotificationDate('friend-1');

      const { lastCatchUpNotificationDates } = useNotificationStateStore.getState();
      expect(lastCatchUpNotificationDates['friend-1']).toBeUndefined();
    });

    it('should not affect other friends', () => {
      const { setLastCatchUpNotificationDate, clearCatchUpNotificationDate } =
        useNotificationStateStore.getState();

      setLastCatchUpNotificationDate('friend-1', '2024-06-14');
      setLastCatchUpNotificationDate('friend-2', '2024-06-15');
      clearCatchUpNotificationDate('friend-1');

      const { lastCatchUpNotificationDates } = useNotificationStateStore.getState();
      expect(lastCatchUpNotificationDates['friend-1']).toBeUndefined();
      expect(lastCatchUpNotificationDates['friend-2']).toBe('2024-06-15');
    });
  });

  describe('setHasRequestedPermission', () => {
    it('should set hasRequestedPermission to true', () => {
      const { setHasRequestedPermission } = useNotificationStateStore.getState();

      setHasRequestedPermission(true);

      const { hasRequestedPermission } = useNotificationStateStore.getState();
      expect(hasRequestedPermission).toBe(true);
    });

    it('should set hasRequestedPermission to false', () => {
      const { setHasRequestedPermission } = useNotificationStateStore.getState();

      setHasRequestedPermission(true);
      setHasRequestedPermission(false);

      const { hasRequestedPermission } = useNotificationStateStore.getState();
      expect(hasRequestedPermission).toBe(false);
    });
  });

  describe('setPendingPermissionRequest', () => {
    it('should set pendingPermissionRequest to true', () => {
      const { setPendingPermissionRequest } = useNotificationStateStore.getState();

      setPendingPermissionRequest(true);

      const { pendingPermissionRequest } = useNotificationStateStore.getState();
      expect(pendingPermissionRequest).toBe(true);
    });

    it('should set pendingPermissionRequest to false', () => {
      const { setPendingPermissionRequest } = useNotificationStateStore.getState();

      setPendingPermissionRequest(true);
      setPendingPermissionRequest(false);

      const { pendingPermissionRequest } = useNotificationStateStore.getState();
      expect(pendingPermissionRequest).toBe(false);
    });
  });

  describe('shouldSendBirthdayNotification', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-06-15T09:00:00'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return true if no birthday notification sent today', () => {
      const { shouldSendBirthdayNotification } = useNotificationStateStore.getState();

      expect(shouldSendBirthdayNotification()).toBe(true);
    });

    it('should return false if birthday notification already sent today', () => {
      const { setLastBirthdayNotificationDate, shouldSendBirthdayNotification } =
        useNotificationStateStore.getState();

      setLastBirthdayNotificationDate('2024-06-15');

      expect(shouldSendBirthdayNotification()).toBe(false);
    });

    it('should return true if birthday notification sent on different day', () => {
      const { setLastBirthdayNotificationDate, shouldSendBirthdayNotification } =
        useNotificationStateStore.getState();

      setLastBirthdayNotificationDate('2024-06-14');

      expect(shouldSendBirthdayNotification()).toBe(true);
    });
  });

  describe('shouldSendCatchUpNotification', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-06-15T09:00:00'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return true if friend has never been notified', () => {
      const { shouldSendCatchUpNotification } = useNotificationStateStore.getState();

      // Friend due for catch-up (last contact 7 days ago, frequency 7 days)
      expect(shouldSendCatchUpNotification('friend-1', 7)).toBe(true);
    });

    it('should return false if friend was notified within their frequency period', () => {
      const { setLastCatchUpNotificationDate, shouldSendCatchUpNotification } =
        useNotificationStateStore.getState();

      // Notified 3 days ago
      setLastCatchUpNotificationDate('friend-1', '2024-06-12');

      // Friend has 7-day frequency, so shouldn't notify again until next period
      expect(shouldSendCatchUpNotification('friend-1', 7)).toBe(false);
    });

    it('should return true if friend was notified longer than frequency period ago', () => {
      const { setLastCatchUpNotificationDate, shouldSendCatchUpNotification } =
        useNotificationStateStore.getState();

      // Notified 8 days ago
      setLastCatchUpNotificationDate('friend-1', '2024-06-07');

      // Friend has 7-day frequency, so should notify again
      expect(shouldSendCatchUpNotification('friend-1', 7)).toBe(true);
    });

    it('should handle different frequency periods correctly', () => {
      const { setLastCatchUpNotificationDate, shouldSendCatchUpNotification } =
        useNotificationStateStore.getState();

      // Notified 15 days ago
      setLastCatchUpNotificationDate('friend-1', '2024-05-31');

      // Friend with 14-day frequency should be notified (15 > 14)
      expect(shouldSendCatchUpNotification('friend-1', 14)).toBe(true);

      // Friend with 30-day frequency should NOT be notified yet (15 < 30)
      expect(shouldSendCatchUpNotification('friend-1', 30)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      const {
        setLastBirthdayNotificationDate,
        setLastCatchUpNotificationDate,
        setHasRequestedPermission,
        setPendingPermissionRequest,
        reset,
      } = useNotificationStateStore.getState();

      // Set some state
      setLastBirthdayNotificationDate('2024-06-15');
      setLastCatchUpNotificationDate('friend-1', '2024-06-15');
      setHasRequestedPermission(true);
      setPendingPermissionRequest(true);

      // Reset
      reset();

      // Verify reset
      const state = useNotificationStateStore.getState();
      expect(state.lastBirthdayNotificationDate).toBeNull();
      expect(state.lastCatchUpNotificationDates).toEqual({});
      expect(state.hasRequestedPermission).toBe(false);
      expect(state.pendingPermissionRequest).toBe(false);
    });
  });
});
