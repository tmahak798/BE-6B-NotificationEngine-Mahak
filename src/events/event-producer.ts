import { producer } from '../config/kafka';
import { validateEvent, getTopicForEvent } from './validators/event-validator';
import { isKnownEventType } from './validators/event-validator';

// This is what gets called when a financial event happens
// It validates the event, picks the right topic, and sends it to Kafka
export async function publishEvent(rawEvent: unknown): Promise<{
  success: boolean;
  topic: string;
  partition?: number;
  offset?: string;
  error?: string;
}> {
  try {
    // Step 1: Validate the event shape
    const event = validateEvent(rawEvent);

    // Step 2: Warn if event type is unknown but don't reject
    if (!isKnownEventType(event.event_type)) {
      console.warn(`Unknown event type: ${event.event_type}`);
    }

    // Step 3: Pick the right topic based on event type
    const topic = getTopicForEvent(event.event_type);

    // Step 4: Send to Kafka
    // key: user_id ensures all events for same user go to same partition
    // This guarantees ordering of events per user
    const result = await producer.send({
      topic,
      messages: [
        {
          key: event.user_id,
          value: JSON.stringify(event),
          headers: {
            event_type: event.event_type,
            source_system: event.source_system,
            idempotency_key: event.idempotency_key,
          },
        },
      ],
    });

    const metadata = result[0];
    console.log(`Event published to ${topic} partition ${metadata.partition}`);

    return {
      success: true,
      topic,
      partition: metadata.partition,
      offset: metadata.baseOffset,
    };
  } catch (error) {
    console.error('Failed to publish event:', error);
    return {
      success: false,
      topic: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}