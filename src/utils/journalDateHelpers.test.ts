import {
  getDaysRemainingInYear,
  generateYearDates,
  formatJournalDate,
  isToday,
  isPastOrToday,
  toDateString,
} from './journalDateHelpers';

describe('journalDateHelpers', () => {
  describe('toDateString', () => {
    it('should format date as YYYY-MM-DD', () => {
      expect(toDateString(new Date(2025, 0, 1))).toBe('2025-01-01');
      expect(toDateString(new Date(2025, 11, 31))).toBe('2025-12-31');
    });

    it('should zero-pad single digit months and days', () => {
      expect(toDateString(new Date(2025, 4, 5))).toBe('2025-05-05');
      expect(toDateString(new Date(2025, 8, 9))).toBe('2025-09-09');
    });
  });

  describe('getDaysRemainingInYear', () => {
    it('should return 365 on January 1st of a non-leap year', () => {
      const jan1 = new Date(2025, 0, 1); // 2025 is not a leap year
      expect(getDaysRemainingInYear(jan1)).toBe(365);
    });

    it('should return 366 on January 1st of a leap year', () => {
      const jan1 = new Date(2024, 0, 1); // 2024 is a leap year
      expect(getDaysRemainingInYear(jan1)).toBe(366);
    });

    it('should return 1 on December 31st', () => {
      const dec31 = new Date(2025, 11, 31);
      expect(getDaysRemainingInYear(dec31)).toBe(1);
    });

    it('should return correct value for mid-year date', () => {
      // July 1st, 2025 - day 182, so 365 - 181 = 184 days remaining (including today)
      // Note: actual value may vary by 1 due to DST transitions
      const july1 = new Date(2025, 6, 1);
      const remaining = getDaysRemainingInYear(july1);
      expect(remaining).toBeGreaterThanOrEqual(183);
      expect(remaining).toBeLessThanOrEqual(185);
    });
  });

  describe('generateYearDates', () => {
    it('should generate 365 dates for a non-leap year', () => {
      const dates = generateYearDates(2025);
      expect(dates).toHaveLength(365);
    });

    it('should generate 366 dates for a leap year', () => {
      const dates = generateYearDates(2024);
      expect(dates).toHaveLength(366);
    });

    it('should start with January 1st', () => {
      const dates = generateYearDates(2025);
      expect(dates[0]).toBe('2025-01-01');
    });

    it('should end with December 31st', () => {
      const dates = generateYearDates(2025);
      expect(dates[dates.length - 1]).toBe('2025-12-31');
    });

    it('should format dates as YYYY-MM-DD', () => {
      const dates = generateYearDates(2025);
      // Check a few dates
      expect(dates[0]).toBe('2025-01-01');
      expect(dates[31]).toBe('2025-02-01'); // Feb 1st
      expect(dates[58]).toBe('2025-02-28'); // Feb 28th (no Feb 29 in 2025)
      expect(dates[59]).toBe('2025-03-01'); // Mar 1st
    });

    it('should include Feb 29 in leap years', () => {
      const dates = generateYearDates(2024);
      expect(dates).toContain('2024-02-29');
    });
  });

  describe('formatJournalDate', () => {
    it('should format date as full weekday, month day, year', () => {
      const result = formatJournalDate('2025-01-15');
      expect(result).toBe('Wednesday, January 15, 2025');
    });

    it('should handle single digit days', () => {
      const result = formatJournalDate('2025-03-05');
      expect(result).toBe('Wednesday, March 5, 2025');
    });

    it('should handle different months', () => {
      expect(formatJournalDate('2025-12-25')).toBe('Thursday, December 25, 2025');
      expect(formatJournalDate('2025-07-04')).toBe('Friday, July 4, 2025');
    });
  });

  describe('isToday', () => {
    it('should return true for today', () => {
      expect(isToday(toDateString(new Date()))).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(toDateString(yesterday))).toBe(false);
    });

    it('should return false for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isToday(toDateString(tomorrow))).toBe(false);
    });
  });

  describe('isPastOrToday', () => {
    it('should return true for today', () => {
      expect(isPastOrToday(toDateString(new Date()))).toBe(true);
    });

    it('should return true for past dates', () => {
      expect(isPastOrToday('2020-01-01')).toBe(true);
      expect(isPastOrToday('2000-06-15')).toBe(true);
    });

    it('should return false for future dates', () => {
      expect(isPastOrToday('2099-12-31')).toBe(false);
      expect(isPastOrToday('2030-01-01')).toBe(false);
    });

    it('should return true for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isPastOrToday(toDateString(yesterday))).toBe(true);
    });

    it('should return false for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isPastOrToday(toDateString(tomorrow))).toBe(false);
    });
  });
});
