import { createClient } from 'redis';
import { CRITICAL_EVENTS } from '../../events/models/event-types';

// Redis client for frequency capping
const redisClient = createClient({
  socket: {
    host: '127.0.0.1',
    port: 6379,
  },
  password: 'redis123',
});

redisClient.connect().catch(console.error);

// Frequency cap limits as defined in project spec
const CAPS = {
  GLOBAL_DAILY: 12,        // max 12 notifications per day
  SMS_DAILY: 5,            // max 5 SMS per day
  PUSH_DAILY: 8,           // max 8 push per day
  EMAIL_DAILY: 3,          // max 3 emails per day
  CATEGORY_HOURLY: 3,      // max 3 per category per hour
  SAME_EVENT_COOLDOWN: 15 * 60, // 15 minutes between same event type
};

// Gets the channel-specific daily cap
function getChannelCap(channel: string): number {
  switch (channel) {
    case 'sms': return CAPS.SMS_DAILY;
    case 'push': return CAPS.PUSH_DAILY;
    case 'email': return CAPS.EMAIL_DAILY;
    default: return 999; // no cap for whatsapp, in-app
  }
}

// Main frequency cap check
// Uses Redis atomic INCR to safely count across multiple workers
export async function checkFrequencyCap(
  userId: string,
  eventType: string,
  channel: string,
  priority: number
): Promise<{ allowed: boolean; reason: string }> {
  // Critical events bypass ALL frequency caps
  if (CRITICAL_EVENTS.includes(eventType as any)) {
    return { allowed: true, reason: 'Critical event bypasses frequency cap' };
  }

  const now = new Date();
  const dateKey = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const hourKey = `${dateKey}-${now.getHours()}`;
  const category = eventType.split('-')[0]; // e.g. TXNX, RISK, MKTX

  // Check 1: Global daily cap
  const globalKey = `cap:global:${userId}:${dateKey}`;
  const globalCount = await redisClient.incr(globalKey);
  await redisClient.expire(globalKey, 86400); // expires in 24 hours

  if (globalCount > CAPS.GLOBAL_DAILY) {
    await redisClient.decr(globalKey); // undo the increment
    return { allowed: false, reason: `Global daily cap of ${CAPS.GLOBAL_DAILY} reached` };
  }

  // Check 2: Channel daily cap
  const channelKey = `cap:channel:${userId}:${channel}:${dateKey}`;
  const channelCount = await redisClient.incr(channelKey);
  await redisClient.expire(channelKey, 86400);

  const channelCap = getChannelCap(channel);
  if (channelCount > channelCap) {
    await redisClient.decr(globalKey);
    await redisClient.decr(channelKey);
    return { allowed: false, reason: `${channel} daily cap of ${channelCap} reached` };
  }

  // Check 3: Category hourly cap
  const categoryKey = `cap:category:${userId}:${category}:${hourKey}`;
  const categoryCount = await redisClient.incr(categoryKey);
  await redisClient.expire(categoryKey, 3600); // expires in 1 hour

  if (categoryCount > CAPS.CATEGORY_HOURLY) {
    await redisClient.decr(globalKey);
    await redisClient.decr(channelKey);
    await redisClient.decr(categoryKey);
    return { allowed: false, reason: `Category hourly cap of ${CAPS.CATEGORY_HOURLY} reached` };
  }

  // Check 4: Same event type cooldown (15 minutes)
  const cooldownKey = `cap:cooldown:${userId}:${eventType}`;
  const cooldownExists = await redisClient.exists(cooldownKey);

  if (cooldownExists) {
    await redisClient.decr(globalKey);
    await redisClient.decr(channelKey);
    await redisClient.decr(categoryKey);
    return { allowed: false, reason: `Cooldown active for ${eventType}` };
  }

  // Set cooldown for this event type
  await redisClient.set(cooldownKey, '1', { EX: CAPS.SAME_EVENT_COOLDOWN });

  return { allowed: true, reason: 'Within frequency limits' };
}