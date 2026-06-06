// All possible states a notification can be in
export enum NotificationStatus {
  CREATED = 'CREATED',
  ENRICHED = 'ENRICHED',
  ROUTED = 'ROUTED',
  QUEUED = 'QUEUED',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
  RETRYING = 'RETRYING',
  CAPPED = 'CAPPED',       // blocked by frequency cap
  DND = 'DND',             // blocked by DND registry
  QUIET = 'QUIET',         // blocked by quiet hours
  DLQ = 'DLQ',             // dead letter queue - max retries exceeded
}

// Valid transitions - a notification can only move between these pairs
// This prevents invalid state changes
export const VALID_TRANSITIONS: Record<NotificationStatus, NotificationStatus[]> = {
  [NotificationStatus.CREATED]: [NotificationStatus.ENRICHED, NotificationStatus.FAILED],
  [NotificationStatus.ENRICHED]: [NotificationStatus.ROUTED, NotificationStatus.FAILED],
  [NotificationStatus.ROUTED]: [NotificationStatus.QUEUED, NotificationStatus.CAPPED, NotificationStatus.DND, NotificationStatus.QUIET, NotificationStatus.FAILED],
  [NotificationStatus.QUEUED]: [NotificationStatus.SENT, NotificationStatus.FAILED],
  [NotificationStatus.SENT]: [NotificationStatus.DELIVERED, NotificationStatus.FAILED, NotificationStatus.RETRYING],
  [NotificationStatus.DELIVERED]: [NotificationStatus.READ],
  [NotificationStatus.READ]: [],
  [NotificationStatus.FAILED]: [NotificationStatus.RETRYING, NotificationStatus.DLQ],
  [NotificationStatus.RETRYING]: [NotificationStatus.SENT, NotificationStatus.FAILED],
  [NotificationStatus.CAPPED]: [NotificationStatus.QUEUED],
  [NotificationStatus.DND]: [],
  [NotificationStatus.QUIET]: [NotificationStatus.QUEUED],
  [NotificationStatus.DLQ]: [],
};

// Checks if a transition is valid
export function isValidTransition(from: NotificationStatus, to: NotificationStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}