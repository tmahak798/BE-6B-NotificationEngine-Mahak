import { criticalConsumer, standardConsumer } from '../config/kafka';
import { TOPICS } from './kafka-topics';
import { ValidatedEvent } from './validators/event-validator';
import { enrichEvent } from '../notifications/engine/enrichment-service';
import { shouldSendDespiteDnd } from '../compliance/dnd/dnd-service';
import { checkFrequencyCap } from '../compliance/frequency-cap/frequency-cap-service';
import { shouldHoldForQuietHours } from '../compliance/quiet-hours/quiet-hours-service';
import { determineChannels } from '../notifications/routing/channel-router';
import { renderNotification } from '../templates/engine/notification-renderer';

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

  // Step 4 - Check quiet hours
  const quietCheck = shouldHoldForQuietHours(
    event.event_type,
    enrichedEvent.user.quiet_hours_start,
    enrichedEvent.user.quiet_hours_end,
    enrichedEvent.user.timezone,
  );
  console.log(`Quiet hours: ${quietCheck.hold ? 'HELD' : 'ALLOWED'} - ${quietCheck.reason}`);

  // If all checks pass - ready for delivery
  if (dndCheck.allowed && capCheck.allowed && !quietCheck.hold) {
    console.log(`✅ Event ${event.event_type} cleared all compliance checks - ready for delivery`);
  }

// Step 5 - Determine channels
  const routingDecision = determineChannels(enrichedEvent);
  console.log(`Routing to channels: ${routingDecision.channels.join(', ')} - ${routingDecision.reason}`);

  // Step 6 - Render templates for each channel
  for (const channel of routingDecision.channels) {
    const rendered = renderNotification(enrichedEvent, channel);
    if (rendered) {
      console.log(`[${channel.toUpperCase()}] ${rendered.content}`);
    }
  }  // TODO: Step 6 - Update notification state
}

export async function startCriticalConsumer(): Promise<void> {
  await criticalConsumer.connect();
  console.log('Critical consumer connected');

  await criticalConsumer.subscribe({
    topic: TOPICS.CRITICAL,
    fromBeginning: false,
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
      }
    },
  });
}

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

export async function stopConsumers(): Promise<void> {
  await criticalConsumer.disconnect();
  await standardConsumer.disconnect();
  console.log('Consumers disconnected');
}