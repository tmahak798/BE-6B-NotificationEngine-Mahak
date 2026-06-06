import nodemailer from 'nodemailer';
import { sendEmail, initEmailProvider } from './providers/email-provider';
import { sendSms } from './providers/sms-provider';
import { sendPushNotification } from './providers/push-provider';
import { EnrichedEvent } from '../notifications/engine/enrichment-service';
import { RenderedNotification } from '../templates/engine/notification-renderer';
import { Channel } from '../notifications/routing/channel-router';
import { getRetryDecision } from './retry/retry-service';
import { moveToDlq } from './retry/dlq-service';

export interface DeliveryResult {
  channel: Channel;
  success: boolean;
  messageId?: string;
  previewUrl?: string;
  error?: string;
}

export async function initDeliveryProviders(): Promise<void> {
  await initEmailProvider();
  console.log('All delivery providers initialized');
}

// Attempts delivery with automatic retry logic
export async function deliverWithRetry(
  enrichedEvent: EnrichedEvent,
  channel: Channel,
  rendered: RenderedNotification,
  attempt: number = 0,
): Promise<DeliveryResult> {
  const { user, event } = enrichedEvent;

  // Attempt delivery
  let result: DeliveryResult;

  switch (channel) {
    case 'sms': {
      const r = await sendSms({
        to: user.phone,
        message: rendered.content,
        senderId: 'WLTHBR',
      });
      result = { channel, ...r };
      break;
    }
    case 'email': {
      const r = await sendEmail({
        to: user.email,
        subject: `WealthBridge Alert: ${event.event_type}`,
        text: rendered.content,
      });
      result = { channel, ...r };
      break;
    }
    case 'push': {
      const r = await sendPushNotification({
        userId: user.id,
        title: 'WealthBridge Alert',
        body: rendered.content,
        data: { event_type: event.event_type },
      });
      result = { channel, ...r };
      break;
    }
    default:
      result = { channel, success: false, error: `Channel ${channel} not implemented` };
  }

  // If successful, return
  if (result.success) {
    return result;
  }

  // If failed, check if we should retry
  const retryDecision = getRetryDecision(attempt, event.priority, result.error || 'unknown');

  if (retryDecision.shouldRetry) {
    console.log(`🔄 Retrying ${channel} in ${retryDecision.delayMs}ms (attempt ${retryDecision.nextAttempt})`);
    
    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, retryDecision.delayMs));
    
    // Recursive retry
    return deliverWithRetry(enrichedEvent, channel, rendered, retryDecision.nextAttempt);
  }

  // Max retries exceeded - move to DLQ
  console.error(`💀 Max retries exceeded for ${channel} - moving to DLQ`);
  await moveToDlq({
    notificationId: `${event.event_id}-${channel}`,
    originalEvent: event as unknown as Record<string, unknown>,
    failureReason: `Max retries exceeded for ${channel}`,
    retryCount: attempt,
    lastError: result.error || 'unknown',
  });

  return result;
}

// Main delivery function - uses retry
export async function deliverNotification(
  enrichedEvent: EnrichedEvent,
  channel: Channel,
  rendered: RenderedNotification,
): Promise<DeliveryResult> {
  return deliverWithRetry(enrichedEvent, channel, rendered, 0);
}