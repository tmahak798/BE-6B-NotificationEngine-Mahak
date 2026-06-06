import { criticalConsumer, standardConsumer } from '../config/kafka';
import { TOPICS } from './kafka-topics';
import { ValidatedEvent } from './validators/event-validator';

// This function processes each event after it comes off the Kafka belt
// For now it just logs - we'll add routing logic here soon
import { enrichEvent } from '../notifications/engine/enrichment-service';

import { shouldSendDespiteDnd } from '../compliance/dnd/dnd-service';
import { checkFrequencyCap } from '../compliance/frequency-cap/frequency-cap-service';

async function processEvent(event: ValidatedEvent, topic: string): Promise<void> {
  console.log(`Processing event: ${event.event_type} for user: ${event.user_id}`);

  // Step 1 - Enrich with user data
  const enrichedEvent = await enrichEvent(event);
  if (!enrichedEvent) {
    console.error(`Could not enrich event ${event.event_id} - user not found`);
    return;
  }
  console.log(`Enriched for user: ${enrichedEvent.user.name}, language: ${enrichedEvent.user.language}`);

  // Step 2 - Check DND (for SMS channel)
  const dndCheck = shouldSendDespiteDnd(
    event.event_type,
    enrichedEvent.user.dnd_status,
    'sms'
  );
  console.log(`DND check: ${dndCheck.allowed ? 'ALLOWED' : 'BLOCKED'} - ${dndCheck.reason}`);

  // Step 3 - Check frequency cap
  const capCheck = await checkFrequencyCap(
    event.user_id,
    event.event_type,
    'sms',
    event.priority
  );
  console.log(`Frequency cap: ${capCheck.allowed ? 'ALLOWED' : 'BLOCKED'} - ${capCheck.reason}`);

  // TODO: Step 4 - Route to delivery channel
  // TODO: Step 5 - Update notification state
}

// Starts the critical consumer - listens to notification-critical topic
// This handles margin calls, circuit breakers - must be fast
export async function startCriticalConsumer(): Promise<void> {
  await criticalConsumer.connect();
  console.log('Critical consumer connected');

  await criticalConsumer.subscribe({
    topic: TOPICS.CRITICAL,
    fromBeginning: false, // only process new events, not old ones
  });

  await criticalConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        if (!message.value) return;

        const event: ValidatedEvent = JSON.parse(message.value.toString());
        console.log(`[CRITICAL] Received from partition ${partition}, offset ${message.offset}`);
        
        await processEvent(event, topic);
      } catch (error) {
        console.error('[CRITICAL] Error processing message:', error);
        // Don't throw - we don't want to crash the consumer
        // Failed events will be handled by DLQ later
      }
    },
  });
}

// Starts the standard consumer - listens to notification-events topic
// This handles all non-critical events
export async function startStandardConsumer(): Promise<void> {
  await standardConsumer.connect();
  console.log('Standard consumer connected');

  await standardConsumer.subscribe({
    topic: TOPICS.EVENTS,
    fromBeginning: false,
  });

  await standardConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        if (!message.value) return;

        const event: ValidatedEvent = JSON.parse(message.value.toString());
        console.log(`[STANDARD] Received from partition ${partition}, offset ${message.offset}`);
        
        await processEvent(event, topic);
      } catch (error) {
        console.error('[STANDARD] Error processing message:', error);
      }
    },
  });
}

// Graceful shutdown - drain in-flight messages before stopping
export async function stopConsumers(): Promise<void> {
  await criticalConsumer.disconnect();
  await standardConsumer.disconnect();
  console.log('Consumers disconnected');
}