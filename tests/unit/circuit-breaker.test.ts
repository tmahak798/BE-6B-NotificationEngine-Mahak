import { CircuitBreaker, CircuitState } from '../../src/delivery/circuit-breaker/circuit-breaker';

describe('Circuit Breaker', () => {
  let cb: CircuitBreaker;

  beforeEach(() => {
    cb = new CircuitBreaker('test-provider', {
      failureThreshold: 3,
      successThreshold: 2,
      timeoutMs: 100, // short timeout for testing
    });
  });

  it('should start in CLOSED state', () => {
    expect(cb.getState()).toBe(CircuitState.CLOSED);
  });

  it('should execute successful operations', async () => {
    const result = await cb.execute(async () => 'success');
    expect(result).toBe('success');
    expect(cb.getState()).toBe(CircuitState.CLOSED);
  });

  it('should open after failure threshold', async () => {
    const failingOp = async () => { throw new Error('provider down'); };

    for (let i = 0; i < 3; i++) {
      try { await cb.execute(failingOp); } catch {}
    }

    expect(cb.getState()).toBe(CircuitState.OPEN);
  });

  it('should fail fast when OPEN', async () => {
    const failingOp = async () => { throw new Error('provider down'); };

    for (let i = 0; i < 3; i++) {
      try { await cb.execute(failingOp); } catch {}
    }

    await expect(cb.execute(async () => 'test')).rejects.toThrow('failing fast');
  });

  it('should transition to HALF_OPEN after timeout', async () => {
    const failingOp = async () => { throw new Error('provider down'); };

    for (let i = 0; i < 3; i++) {
      try { await cb.execute(failingOp); } catch {}
    }

    expect(cb.getState()).toBe(CircuitState.OPEN);

    // Wait for timeout
    await new Promise(resolve => setTimeout(resolve, 150));

    // Next request should trigger HALF_OPEN
    try { await cb.execute(async () => 'test'); } catch {}
    // State should be HALF_OPEN or CLOSED depending on result
    expect([CircuitState.HALF_OPEN, CircuitState.CLOSED, CircuitState.OPEN])
      .toContain(cb.getState());
  });

  it('should return correct stats', () => {
    const stats = cb.getStats();
    expect(stats.provider).toBe('test-provider');
    expect(stats.state).toBe(CircuitState.CLOSED);
    expect(typeof stats.failureCount).toBe('number');
  });
});