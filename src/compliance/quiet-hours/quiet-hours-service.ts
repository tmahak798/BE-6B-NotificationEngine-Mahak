import { CRITICAL_EVENTS } from '../../events/models/event-types';

export function isQuietHours(
  quietHoursStart: string,
  quietHoursEnd: string,
  timezone: string,
): boolean {
  const now = new Date();
  const userTime = new Intl.DateTimeFormat('en-IN', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now);

  const [currentHour, currentMinute] = userTime.split(':').map(Number);
  const currentMinutes = currentHour * 60 + currentMinute;

  const [startHour, startMinute] = quietHoursStart.split(':').map(Number);
  const startMinutes = startHour * 60 + startMinute;

  const [endHour, endMinute] = quietHoursEnd.split(':').map(Number);
  const endMinutes = endHour * 60 + endMinute;

  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

export function shouldHoldForQuietHours(
  eventType: string,
  quietHoursStart: string,
  quietHoursEnd: string,
  timezone: string,
): { hold: boolean; reason: string } {
  if (CRITICAL_EVENTS.includes(eventType as any)) {
    return { hold: false, reason: 'Critical event bypasses quiet hours' };
  }

  const inQuietHours = isQuietHours(quietHoursStart, quietHoursEnd, timezone);

  if (inQuietHours) {
    return { hold: true, reason: `Within quiet hours (${quietHoursStart} - ${quietHoursEnd})` };
  }

  return { hold: false, reason: 'Outside quiet hours' };
}