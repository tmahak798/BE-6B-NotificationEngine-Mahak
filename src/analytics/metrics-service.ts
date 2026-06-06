// Prometheus-compatible metrics
// These are real-time counters stored in memory
// In production these would be scraped by Prometheus every 15 seconds

interface Counter {
  value: number;
  labels: Record<string, string>;
}

class MetricsRegistry {
  private counters: Map<string, number> = new Map();

  // Increments a counter
  increment(name: string, labels: Record<string, string> = {}, amount: number = 1): void {
    const key = this.buildKey(name, labels);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + amount);
  }

  // Gets current value of a counter
  get(name: string, labels: Record<string, string> = {}): number {
    const key = this.buildKey(name, labels);
    return this.counters.get(key) || 0;
  }

  private buildKey(name: string, labels: Record<string, string>): string {
    const labelStr = Object.entries(labels)
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    return labelStr ? `${name}{${labelStr}}` : name;
  }

  // Formats all metrics in Prometheus text format
  // This is what the /metrics endpoint returns
  format(): string {
    const lines: string[] = [];

    lines.push('# HELP notification_events_received_total Total events received');
    lines.push('# TYPE notification_events_received_total counter');

    lines.push('# HELP notification_delivery_total Total delivery attempts');
    lines.push('# TYPE notification_delivery_total counter');

    lines.push('# HELP notification_dlq_depth Current DLQ depth');
    lines.push('# TYPE notification_dlq_depth gauge');

    lines.push('# HELP notification_frequency_cap_hits_total Frequency cap hits');
    lines.push('# TYPE notification_frequency_cap_hits_total counter');

    lines.push('# HELP notification_dnd_blocks_total DND blocks');
    lines.push('# TYPE notification_dnd_blocks_total counter');

    // Output all counters
    for (const [key, value] of this.counters.entries()) {
      lines.push(`${key} ${value}`);
    }

    return lines.join('\n') + '\n';
  }
}

// Global metrics registry - single instance
export const metrics = new MetricsRegistry();

// Helper functions for common metrics
export function recordEventReceived(eventType: string, priority: number): void {
  metrics.increment('notification_events_received_total', {
    event_type: eventType,
    priority: priority.toString(),
  });
}

export function recordDelivery(channel: string, status: 'success' | 'failed'): void {
  metrics.increment('notification_delivery_total', { channel, status });
}

export function recordFrequencyCapHit(eventType: string): void {
  metrics.increment('notification_frequency_cap_hits_total', { event_type: eventType });
}

export function recordDndBlock(classification: string): void {
  metrics.increment('notification_dnd_blocks_total', { classification });
}