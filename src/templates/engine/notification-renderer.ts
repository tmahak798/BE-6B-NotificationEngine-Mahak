import { renderTemplate, truncateSms } from './template-engine';
import { getTemplate } from '../definitions/templates';
import { EnrichedEvent } from '../../notifications/engine/enrichment-service';

export interface RenderedNotification {
  channel: string;
  locale: string;
  content: string;
  truncated: boolean;
}

// Renders a notification for a specific channel
export function renderNotification(
  enrichedEvent: EnrichedEvent,
  channel: string
): RenderedNotification | null {
  const { event, user } = enrichedEvent;
  const locale = user.language || 'en';

  // Get the right template
  const template = getTemplate(event.event_type, channel, locale);
  
  if (!template) {
    console.warn(`No template found for ${event.event_type}/${channel}/${locale}`);
    return null;
  }

  // Merge event payload with user context for personalisation
  const data = {
    ...event.payload as Record<string, unknown>,
    user_name: user.name,
    app_name: 'WealthBridge',
  };

  // Render the template
  let content = renderTemplate(template, data);
  let truncated = false;

  // SMS has 160 char limit
  if (channel === 'sms' && content.length > 160) {
    content = truncateSms(content);
    truncated = true;
  }

  return { channel, locale, content, truncated };
}