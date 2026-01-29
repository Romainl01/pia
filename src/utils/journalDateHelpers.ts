/**
 * Date helpers for the journal feature
 */

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Formats a Date object as YYYY-MM-DD string
 */
export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a YYYY-MM-DD string into a Date object at midnight local time
 */
function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Returns the number of days remaining in the year, including today
 */
export function getDaysRemainingInYear(date: Date = new Date()): number {
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31);

  const totalDays = Math.ceil((endOfYear.getTime() - startOfYear.getTime()) / MS_PER_DAY) + 1;
  const daysElapsed = Math.floor((date.getTime() - startOfYear.getTime()) / MS_PER_DAY);

  return totalDays - daysElapsed;
}

/**
 * Generates an array of all dates in a year as YYYY-MM-DD strings
 */
export function generateYearDates(year: number): string[] {
  const dates: string[] = [];
  const date = new Date(year, 0, 1);

  while (date.getFullYear() === year) {
    dates.push(toDateString(date));
    date.setDate(date.getDate() + 1);
  }

  return dates;
}

/**
 * Formats a date string as "Wednesday, January 29, 2026"
 */
export function formatJournalDate(dateStr: string): string {
  const date = parseDateString(dateStr);

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Checks if a date string (YYYY-MM-DD) is today
 */
export function isToday(dateStr: string): boolean {
  return dateStr === toDateString(new Date());
}

/**
 * Checks if a date string (YYYY-MM-DD) is today or in the past
 */
export function isPastOrToday(dateStr: string): boolean {
  const date = parseDateString(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return date.getTime() <= today.getTime();
}
