/**
 * Congratulatory messages shown when completing a journal entry.
 *
 * Design philosophy:
 * - Future-self framing: Connect today's writing to tomorrow's memory
 * - Time capsule theme: Emphasize preservation and rediscovery
 * - Warm and personal: Like a friend acknowledging what you did
 * - Brief: Toast messages should be scannable, not essays
 */
export const JOURNAL_CONGRATS_MESSAGES = [
  "One day you'll read this and remember exactly how today felt",
  'Future you will be glad you wrote this down',
  'This moment now has a place to live',
  'You just gave your memory a backup',
  "That feeling? Now it's saved forever",
  'A piece of today, kept safe',
  "You'll forget so much. Not this.",
  'Now you can come back to this day',
  'Your future self just got a gift',
  'This entry will outlast the feeling',
  "Somewhere down the line, you'll thank yourself",
  'Today has a record now',
  'That thought almost slipped away. You caught it.',
  'A snapshot of your mind, saved',
  "One more day you won't forget",
  'Written down. Yours to keep.',
] as const;

export type JournalCongratsMessage = (typeof JOURNAL_CONGRATS_MESSAGES)[number];
