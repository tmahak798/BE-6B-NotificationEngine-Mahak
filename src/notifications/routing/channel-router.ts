import { REGULATORY_MANDATORY_EVENTS } from '../../events/models/event-types';
import { EnrichedEvent } from '../engine/enrichment-service';

// All available channels
export type Channel = 'sms' | 'email' | 'push' | 'whatsapp' | 'in_app';

// Which channels SEBI mandates for which events
const REGULATORY_CHANNEL_REQUIREMENTS: Record<string, Channel[]> = {
  'RISK-001': ['sms', 'push'],
  'RISK-002': ['sms', 'push', 'email'],
  'RISK-003': ['sms', 'push', 'email'],
  'TXNX-001': ['sms', 'push'],
  'TXNX-002': ['sms', 'push'],
  'TXNX-003': ['push', 'sms'],
  'REGX-001': ['sms', 'email'],
  'REGX-003': ['email'],
  'MKTX-002': ['push', 'sms'],
};

// Default channels per event category when no user preference exists
const DEFAULT_CHANNELS: Record<string, Channel[]> = {
  'TXNX': ['sms', 'push', 'email'],
  'RISK': ['sms', 'push', 'email'],
  'SIPX': ['push', 'email'],
  'MKTX': ['push'],
  'REGX': ['email', 'push'],
};

export interface RoutingDecision {
  channels: Channel[];
  isRegulatoryOverride: boolean;
  reason: string;
}

// Main routing function
// Returns list of channels to send notification on
export function determineChannels(
  enrichedEvent: EnrichedEvent,
): RoutingDecision {
  const { event } = enrichedEvent;
  const eventType = event.event_type;
  const category = eventType.split('-')[0];

  // Priority 1: Regulatory override - SEBI mandates these channels
  // User preferences CANNOT disable these
if (REGULATORY_MANDATORY_EVENTS.includes(eventType as any)) {
        const mandatoryChannels = REGULATORY_CHANNEL_REQUIREMENTS[eventType];
    if (mandatoryChannels) {
      return {
        channels: mandatoryChannels,
        isRegulatoryOverride: true,
        reason: `SEBI mandatory channels for ${eventType}`,
      };
    }
  }

  // Priority 2: Default channels for category
  const defaultChannels = DEFAULT_CHANNELS[category] || ['push'];
  
  return {
    channels: defaultChannels,
    isRegulatoryOverride: false,
    reason: `Default channels for ${category} category`,
  };
}