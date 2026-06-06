import { startCriticalConsumer, startStandardConsumer, stopConsumers } from './events/event-consumer';
import { createTopics } from './events/kafka-topics';
import { publishEvent } from './events/event-producer';

import { producer } from './config/kafka';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import pool from './config/database';

const app = Fastify({
  logger: true,
});

// Register plugins
app.register(cors);
app.register(helmet);

// Health check endpoint
app.get('/health', async () => {
  const dbResult = await pool.query('SELECT NOW()');
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'connected',
    db_time: dbResult.rows[0].now,
  };
});


// Event ingestion endpoint - this is how external systems send events
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

// Start server
const start = async () => {
  try {
    // Connect Kafka producer
    await producer.connect();
    console.log('Kafka producer connected');

    // Create topics if they dont exist
    await createTopics();

    // Start consumers
    await startCriticalConsumer();
    await startStandardConsumer();

    // Start HTTP server
    await app.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Notification Engine running on port 3000');

    // Graceful shutdown
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