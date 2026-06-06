import { sendEmail, initEmailProvider } from './providers/email-provider';
import { sendSms } from './providers/sms-provider';
import { sendPushNotification } from './providers/push-provider';
import { EnrichedEvent } from '../notifications/engine/enrichment-service';
import { RenderedNotification } from '../templates/engine/notification-renderer';
import { Channel } from '../notifications/routing/channel-router';

export interface DeliveryResult {
  channel: Channel;
  success: boolean;
  messageId?: string;
  previewUrl?: string;
  error?: string;
}

// Initialize all providers on startup
export async function initDeliveryProviders(): Promise<void> {
  await initEmailProvider();
  console.log('All delivery providers initialized');
}

// Delivers a rendered notification through the appropriate channel
export async function deliverNotification(
  enrichedEvent: EnrichedEvent,
  channel: Channel,
  rendered: RenderedNotification,
): Promise<DeliveryResult> {
  const { user } = enrichedEvent;

  switch (channel) {
    case 'sms': {
      const result = await sendSms({
        to: user.phone,
        message: rendered.content,
        senderId: 'WLTHBR',
      });
      return { channel, ...result };
    }

    case 'email': {
      const result = await sendEmail({
        to: user.email,
        subject: `WealthBridge: ${enrichedEvent.event.event_type} Alert`,
        text: rendered.content,
      });
      return { channel, ...result };
    }

    case 'push': {
      const result = await sendPushNotification({
        userId: user.id,
        title: 'WealthBridge Alert',
        body: rendered.content,
        data: { event_type: enrichedEvent.event.event_type },
      });
      return { channel, ...result };
    }

    default:
      return {
        channel,
        success: false,
        error: `Channel ${channel} not yet implemented`,
      };
  }
}