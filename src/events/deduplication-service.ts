import { createClient } from 'redis';

const redisClient = createClient({
  socket: { host: '127.0.0.1', port: 6379 },
  password: 'redis123',
});

redisClient.connect().catch(console.error);

// Deduplication window - 5 minutes
// Same event within 5 minutes = duplicate
const DEDUP_TTL_SECONDS = 300;

// Creates a unique fingerprint for an event
// Same event_type + user_id + source within time window = duplicate
function createEventFingerprint(
  eventType: string,
  userId: string,
  idempotencyKey: string,
): string {
  return `dedup:${eventType}:${userId}:${idempotencyKey}`;
}

// Returns true if event is a duplicate (already seen)
// Returns false if event is new (first time seen)
export async function isDuplicateEvent(
  eventType: string,
  userId: string,
  idempotencyKey: string,
): Promise<boolean> {
  const fingerprint = createEventFingerprint(eventType, userId, idempotencyKey);

  // SET NX = only set if not exists
  // Returns 1 if set (new event), 0 if already exists (duplicate)
  const result = await redisClient.set(fingerprint, '1', {
    EX: DEDUP_TTL_SECONDS,
    NX: true, // only set if not exists
  });

  if (result === null) {
    // Key already existed = duplicate
    console.log(`🔄 Duplicate event detected: ${fingerprint}`);
    return true;
  }

  // Key was set = new event
  return false;
}