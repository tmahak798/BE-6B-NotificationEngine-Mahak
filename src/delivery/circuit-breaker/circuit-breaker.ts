// Circuit Breaker Pattern
// Three states: CLOSED (normal), OPEN (failing), HALF_OPEN (testing recovery)
// 
// CLOSED → OPEN: when failure rate exceeds threshold
// OPEN → HALF_OPEN: after timeout period
// HALF_OPEN → CLOSED: if test request succeeds
// HALF_OPEN → OPEN: if test request fails

export enum CircuitState {
  CLOSED = 'CLOSED',       // normal operation
  OPEN = 'OPEN',           // provider is down, fail fast
  HALF_OPEN = 'HALF_OPEN', // testing if provider recovered
}

export interface CircuitBreakerConfig {
  failureThreshold: number;  // failures before opening
  successThreshold: number;  // successes in half-open before closing
  timeoutMs: number;         // how long to stay open before half-open
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 2,
  timeoutMs: 60000, // 60 seconds
};

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number = 0;
  private providerName: string;
  private config: CircuitBreakerConfig;

  constructor(providerName: string, config: Partial<CircuitBreakerConfig> = {}) {
    this.providerName = providerName;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // Main method - wraps any provider call with circuit breaker logic
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      // Check if timeout has passed - if so move to half-open
      if (Date.now() - this.lastFailureTime >= this.config.timeoutMs) {
        this.transitionTo(CircuitState.HALF_OPEN);
      } else {
        // Still open - fail fast without calling provider
        throw new Error(`Circuit breaker OPEN for ${this.providerName} - failing fast`);
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.config.successThreshold) {
        this.transitionTo(CircuitState.CLOSED);
      }
    }
    // Reset failure count on success in closed state
    if (this.state === CircuitState.CLOSED) {
      this.failureCount = 0;
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      // Failed during test - go back to open
      this.transitionTo(CircuitState.OPEN);
    } else if (this.failureCount >= this.config.failureThreshold) {
      this.transitionTo(CircuitState.OPEN);
    }
  }

  private transitionTo(newState: CircuitState): void {
    console.log(`[CircuitBreaker] ${this.providerName}: ${this.state} -> ${newState}`);
    this.state = newState;

    if (newState === CircuitState.CLOSED) {
      this.failureCount = 0;
      this.successCount = 0;
    }

    if (newState === CircuitState.HALF_OPEN) {
      this.successCount = 0;
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  getStats() {
    return {
      provider: this.providerName,
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

// Global circuit breaker instances - one per provider
export const circuitBreakers = {
  sms_msg91: new CircuitBreaker('sms_msg91', { failureThreshold: 5, timeoutMs: 30000 }),
  sms_twilio: new CircuitBreaker('sms_twilio', { failureThreshold: 5, timeoutMs: 30000 }),
  email: new CircuitBreaker('email', { failureThreshold: 3, timeoutMs: 60000 }),
  push_fcm: new CircuitBreaker('push_fcm', { failureThreshold: 5, timeoutMs: 30000 }),
  whatsapp: new CircuitBreaker('whatsapp', { failureThreshold: 3, timeoutMs: 60000 }),
};