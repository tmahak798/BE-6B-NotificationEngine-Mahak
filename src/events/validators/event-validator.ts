import { z } from 'zod';
import { CRITICAL_EVENTS, EVENT_TYPES } from '../models/event-types';
import { TOPICS } from '../kafka-topics';

// Zod schema - this validates incoming events before processing
// If an event doesn't match this shape, it gets rejected immediately
export const BaseEventSchema = z.object({
  event_type: z.string().min(1),
  event_id: z.string().min(1),
  source_system: z.string().min(1),
  timestamp: z.string().datetime(),
  priority: z.number().int().min(1).max(5),
  user_id: z.string().uuid(),
  idempotency_key: z.string().min(1),
payload: z.record(z.string(), z.unknown()),});

export type ValidatedEvent = z.infer<typeof BaseEventSchema>;

// Determines which Kafka topic an event should go to
// Critical events get their own fast lane
export function getTopicForEvent(eventType: string): string {
  if (CRITICAL_EVENTS.includes(eventType as any)) {
    return TOPICS.CRITICAL;
  }
  return TOPICS.EVENTS;
}

// Validates an incoming event
// Returns the validated event or throws an error
export function validateEvent(rawEvent: unknown): ValidatedEvent {
  return BaseEventSchema.parse(rawEvent);
}

// Checks if an event type exists in our taxonomy
export function isKnownEventType(eventType: string): boolean {
  return Object.values(EVENT_TYPES).includes(eventType as any);
}