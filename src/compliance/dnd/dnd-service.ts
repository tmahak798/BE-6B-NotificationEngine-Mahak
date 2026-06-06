import { CRITICAL_EVENTS } from '../../events/models/event-types';

// Message classification - TRAI requires this distinction
// TRANSACTIONAL = order confirmations, margin calls, OTPs - exempt from DND
// PROMOTIONAL = recommendations, tips, marketing - blocked by DND
export enum MessageClassification {
  TRANSACTIONAL = 'TRANSACTIONAL',
  PROMOTIONAL = 'PROMOTIONAL',
}

// These event types are always TRANSACTIONAL - cannot be blocked by DND
const TRANSACTIONAL_EVENTS = [
  'TXNX-001', 'TXNX-002', 'TXNX-003', 'TXNX-005',
  'RISK-001', 'RISK-002', 'RISK-003',
  'SIPX-002', 'SIPX-003',
  'MKTX-002',
  'REGX-001', 'REGX-003',
];

// Classifies an event as transactional or promotional
export function classifyMessage(eventType: string): MessageClassification {
  if (TRANSACTIONAL_EVENTS.includes(eventType)) {
    return MessageClassification.TRANSACTIONAL;
  }
  return MessageClassification.PROMOTIONAL;
}

// Checks if a notification should be blocked by DND
// Returns true if we SHOULD send, false if we should block
export function shouldSendDespiteDnd(
  eventType: string,
  userDndStatus: string,
  channel: string
): { allowed: boolean; reason: string } {
  // DND only applies to SMS and voice calls
  // Push, email, WhatsApp, in-app have different rules
  if (channel !== 'sms' && channel !== 'call') {
    return { allowed: true, reason: 'DND does not apply to this channel' };
  }

  // User is not on DND registry - always allowed
  if (userDndStatus === 'not_registered') {
    return { allowed: true, reason: 'User not registered on DND' };
  }

  // Critical events bypass DND completely - SEBI mandate
  if (CRITICAL_EVENTS.includes(eventType as any)) {
    return { allowed: true, reason: 'Critical event bypasses DND' };
  }

  // Transactional messages bypass DND
  const classification = classifyMessage(eventType);
  if (classification === MessageClassification.TRANSACTIONAL) {
    return { allowed: true, reason: 'Transactional message bypasses DND' };
  }

  // Promotional message to DND registered user - BLOCK
  return { allowed: false, reason: 'Promotional message blocked by DND' };
}