import { Kafka, Partitioners } from 'kafkajs';

// This creates a Kafka client that knows where our Kafka broker is
// The clientId identifies our application to Kafka
const kafka = new Kafka({
  clientId: 'notification-engine',
  brokers: ['localhost:9092'],
  retry: {
    initialRetryTime: 300,
    retries: 10,
  },
});

// Producer: sends events INTO Kafka topics
export const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
  idempotent: true, // prevents duplicate messages if producer retries
});

// Two consumer groups:
// 1. For critical events (margin calls) - dedicated, fast
// 2. For normal events - shared, standard
export const criticalConsumer = kafka.consumer({
  groupId: 'critical-notification-consumer',
  sessionTimeout: 30000,
  heartbeatInterval: 3000,
});

export const standardConsumer = kafka.consumer({
  groupId: 'standard-notification-consumer',
  sessionTimeout: 30000,
  heartbeatInterval: 3000,
});

export default kafka;