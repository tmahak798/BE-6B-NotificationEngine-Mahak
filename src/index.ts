import { createTopics } from './events/kafka-topics';
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

// Start server
const start = async () => {
  try {
    // Connect Kafka producer
    await producer.connect();
    console.log('Kafka producer connected');

    // Create topics if they dont exist
    await createTopics();

    // Start HTTP server
    await app.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Notification Engine running on port 3000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();