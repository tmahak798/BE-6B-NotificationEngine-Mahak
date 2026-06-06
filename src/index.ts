import { startCriticalConsumer, startStandardConsumer, stopConsumers } from './events/event-consumer';
import { createTopics } from './events/kafka-topics';
import { publishEvent } from './events/event-producer';
import { producer } from './config/kafka';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import pool from './config/database';
import { initDeliveryProviders } from './delivery/delivery-service';
import { metrics } from './analytics/metrics-service';

const app = Fastify({ logger: true });

app.register(cors);
app.register(helmet);

// Health check
app.get('/health', async () => {
  const dbResult = await pool.query('SELECT NOW()');
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'connected',
    db_time: dbResult.rows[0].now,
  };
});

// Prometheus metrics endpoint
app.get('/metrics', async (request, reply) => {
  reply.header('Content-Type', 'text/plain');
  return metrics.format();
});

// Circuit breaker status
app.get('/api/v1/health/providers', async () => {
  const { circuitBreakers } = await import('./delivery/circuit-breaker/circuit-breaker');
  return {
    providers: Object.entries(circuitBreakers).map(([name, cb]) => cb.getStats()),
    timestamp: new Date().toISOString(),
  };
});

// Event ingestion
app.post('/api/v1/events', async (request, reply) => {
  const result = await publishEvent(request.body);
  if (!result.success) {
    return reply.status(400).send({
      error: 'EVENT_PUBLISH_FAILED',
      message: result.error,
    });
  }
  return reply.status(202).send({
    status: 'ACCEPTED',
    topic: result.topic,
    partition: result.partition,
    offset: result.offset,
  });
});

// Get notification status by ID
app.get('/api/v1/notifications/:notificationId', async (request, reply) => {
  const { notificationId } = request.params as { notificationId: string };

  const notification = await pool.query(
    `SELECT * FROM notifications WHERE id = $1`,
    [notificationId]
  );

  if (notification.rows.length === 0) {
    return reply.status(404).send({ error: 'Notification not found' });
  }

  const stateHistory = await pool.query(
    `SELECT from_status, to_status, actor, metadata, created_at 
     FROM notification_state_log 
     WHERE notification_id = $1 
     ORDER BY created_at ASC`,
    [notificationId]
  );

  return {
    ...notification.rows[0],
    state_history: stateHistory.rows,
  };
});

// Get all notifications for a user
app.get('/api/v1/users/:userId/notifications', async (request, reply) => {
  const { userId } = request.params as { userId: string };

  const result = await pool.query(
    `SELECT id, event_type, channel, status, created_at, delivered_at
     FROM notifications 
     WHERE user_id = $1 
     ORDER BY created_at DESC 
     LIMIT 50`,
    [userId]
  );

  return { notifications: result.rows, total: result.rows.length };
});

// User preferences API
app.get('/api/v1/users/:userId/preferences', async (request, reply) => {
  const { userId } = request.params as { userId: string };

  const result = await pool.query(
    `SELECT * FROM user_preferences WHERE user_id = $1`,
    [userId]
  );

  return { user_id: userId, preferences: result.rows };
});

// Update user preferences
app.put('/api/v1/users/:userId/preferences', async (request, reply) => {
  const { userId } = request.params as { userId: string };
  const { category, channels, digest_mode } = request.body as {
    category: string;
    channels: Record<string, boolean>;
    digest_mode: string;
  };

  for (const [channel, enabled] of Object.entries(channels)) {
    await pool.query(
      `INSERT INTO user_preferences 
       (user_id, event_category, channel, enabled, digest_mode)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET enabled = $4, digest_mode = $5, updated_at = NOW()`,
      [userId, category, channel, enabled, digest_mode]
    );
  }

  return {
    status: 'updated',
    category,
    updated_at: new Date().toISOString(),
  };
});

// Analytics - delivery rates
app.get('/api/v1/analytics/delivery-rates', async (request, reply) => {
  const result = await pool.query(`
    SELECT 
      channel,
      COUNT(*) as total_sent,
      COUNT(CASE WHEN status = 'DELIVERED' THEN 1 END) as delivered,
      COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed,
      ROUND(
        COUNT(CASE WHEN status = 'DELIVERED' THEN 1 END)::numeric / 
        NULLIF(COUNT(*), 0) * 100, 2
      ) as delivery_rate_percent
    FROM notifications
    GROUP BY channel
    ORDER BY channel
  `);

  const summary = await pool.query(`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'DELIVERED' THEN 1 END) as delivered,
      COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed
    FROM notifications
  `);

  return {
    summary: summary.rows[0],
    by_channel: result.rows,
    generated_at: new Date().toISOString(),
  };
});

// DLQ management
app.get('/api/v1/dlq', async (request, reply) => {
  const { getDlqEntries } = await import('./delivery/retry/dlq-service');
  const entries = await getDlqEntries();
  return { entries, total: entries.length };
});

// Start server
const start = async () => {
  try {
    await producer.connect();
    console.log('Kafka producer connected');

    await createTopics();
    await initDeliveryProviders();

    await startCriticalConsumer();
    await startStandardConsumer();

    await app.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Notification Engine running on port 3000');

    process.on('SIGTERM', async () => {
      console.log('Shutting down gracefully...');
      await stopConsumers();
      await producer.disconnect();
      await app.close();
      process.exit(0);
    });

  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();