import { getRandomCongratsMessage } from './journalMessages';
import { JOURNAL_CONGRATS_MESSAGES } from '@/src/constants/journalMessages';

describe('getRandomCongratsMessage', () => {
  it('should return a string from the message pool', () => {
    const message = getRandomCongratsMessage();

    expect(typeof message).toBe('string');
    expect(JOURNAL_CONGRATS_MESSAGES).toContain(message);
  });

  it('should return different messages over multiple calls (randomness check)', () => {
    // Call multiple times and collect unique messages
    const messages = new Set<string>();
    for (let i = 0; i < 50; i++) {
      messages.add(getRandomCongratsMessage());
    }

    // With 16 messages and 50 calls, we should get at least 3 unique ones
    // (statistically very unlikely to get fewer)
    expect(messages.size).toBeGreaterThan(2);
  });
});
