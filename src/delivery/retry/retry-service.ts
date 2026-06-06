import { Channel } from '../../notifications/routing/channel-router';

// Retry configuration per priority level
// Higher priority = more retries, shorter delays
const RETRY_CONFIG: Record<number, { maxRetries: number; baseDelayMs: number; maxDelayMs: number }> = {
  1: { maxRetries: 10, baseDelayMs: 500,   maxDelayMs: 60000  }, // CRITICAL
  2: { maxRetries: 5,  baseDelayMs: 1000,  maxDelayMs: 300000 }, // HIGH
  3: { maxRetries: 3,  baseDelayMs: 5000,  maxDelayMs: 1800000}, // MEDIUM
  5: { maxRetries: 2,  baseDelayMs: 30000, maxDelayMs: 7200000}, // LOW
};

// Calculates delay with exponential backoff + random jitter
// Jitter prevents thundering herd - all retries hitting at same time
export function calculateRetryDelay(attempt: number, priority: number): number {
  const config = RETRY_CONFIG[priority] || RETRY_CONFIG[5];
  
  // Exponential backoff: baseDelay * 2^attempt
  const exponentialDelay = config.baseDelayMs * Math.pow(2, attempt);
  
  // Add random jitter (0 to 1000ms)
  const jitter = Math.random() * 1000;
  
  // Cap at maxDelay
  return Math.min(exponentialDelay + jitter, config.maxDelayMs);
}

// Checks if a notification should be retried
export function shouldRetry(attempt: number, priority: number): boolean {
  const config = RETRY_CONFIG[priority] || RETRY_CONFIG[5];
  return attempt < config.maxRetries;
}

export interface RetryResult {
  shouldRetry: boolean;
  delayMs: number;
  nextAttempt: number;
}

// Returns retry decision for a failed delivery
export function getRetryDecision(
  currentAttempt: number,
  priority: number,
  errorCode: string,
): RetryResult {
  // Some errors are permanent - no point retrying
  const permanentErrors = ['invalid_recipient', 'dnd_blocked', 'consent_revoked'];
  if (permanentErrors.includes(errorCode)) {
    return { shouldRetry: false, delayMs: 0, nextAttempt: currentAttempt };
  }

  const canRetry = shouldRetry(currentAttempt, priority);
  
  if (!canRetry) {
    return { shouldRetry: false, delayMs: 0, nextAttempt: currentAttempt };
  }

  const delayMs = calculateRetryDelay(currentAttempt, priority);
  
  return {
    shouldRetry: true,
    delayMs,
    nextAttempt: currentAttempt + 1,
  };
}