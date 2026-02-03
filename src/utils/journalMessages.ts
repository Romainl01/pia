import { JOURNAL_CONGRATS_MESSAGES } from '@/src/constants/journalMessages';

/**
 * Returns a random congratulatory message for journal completion.
 */
export function getRandomCongratsMessage(): string {
  const randomIndex = Math.floor(Math.random() * JOURNAL_CONGRATS_MESSAGES.length);
  return JOURNAL_CONGRATS_MESSAGES[randomIndex];
}
