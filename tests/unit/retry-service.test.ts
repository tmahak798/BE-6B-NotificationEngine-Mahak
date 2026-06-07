import { calculateRetryDelay, shouldRetry, getRetryDecision } from '../../src/delivery/retry/retry-service';

describe('Retry Service', () => {
  describe('calculateRetryDelay', () => {
    it('should return delay within bounds for CRITICAL priority', () => {
      const delay = calculateRetryDelay(0, 1);
      expect(delay).toBeGreaterThan(0);
      expect(delay).toBeLessThanOrEqual(60000 + 1000);
    });

    it('should increase delay with each attempt', () => {
      const delay1 = calculateRetryDelay(0, 2);
      const delay2 = calculateRetryDelay(1, 2);
      // delay2 should generally be larger (accounting for jitter)
      expect(delay2).toBeGreaterThan(delay1 - 1000);
    });

    it('should cap delay at maxDelay', () => {
      const delay = calculateRetryDelay(20, 1); // very high attempt
      expect(delay).toBeLessThanOrEqual(61000); // maxDelay + max jitter
    });
  });

  describe('shouldRetry', () => {
    it('should allow retries within limit for CRITICAL', () => {
      expect(shouldRetry(5, 1)).toBe(true);
      expect(shouldRetry(9, 1)).toBe(true);
    });

    it('should stop retrying after max for CRITICAL', () => {
      expect(shouldRetry(10, 1)).toBe(false);
    });

    it('should stop retrying after max for LOW priority', () => {
      expect(shouldRetry(2, 5)).toBe(false);
    });

    it('should allow first retry for LOW priority', () => {
      expect(shouldRetry(0, 5)).toBe(true);
    });
  });

  describe('getRetryDecision', () => {
    it('should not retry permanent errors', () => {
      const result = getRetryDecision(0, 1, 'invalid_recipient');
      expect(result.shouldRetry).toBe(false);
    });

    it('should not retry dnd_blocked errors', () => {
      const result = getRetryDecision(0, 1, 'dnd_blocked');
      expect(result.shouldRetry).toBe(false);
    });

    it('should retry transient errors', () => {
      const result = getRetryDecision(0, 1, 'provider_timeout');
      expect(result.shouldRetry).toBe(true);
      expect(result.nextAttempt).toBe(1);
    });

    it('should stop retrying after max attempts', () => {
      const result = getRetryDecision(10, 1, 'provider_timeout');
      expect(result.shouldRetry).toBe(false);
    });
  });
});