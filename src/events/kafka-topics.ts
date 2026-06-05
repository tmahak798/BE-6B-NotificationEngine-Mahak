import { Admin } from 'kafkajs';
import kafka from '../config/kafka';

// These are the three topics our system uses
// Think of them as three separate conveyor belts
export const TOPICS = {
  CRITICAL: 'notification-critical',   // margin calls, circuit breakers
  EVENTS: 'notification-events',       // all other events
  DLQ: 'notification-dlq',            // failed notifications land here
} as const;

export async function createTopics() {
  const admin: Admin = kafka.admin();
  
  try {
    await admin.connect();
    console.log('Kafka admin connected');

    await admin.createTopics({
      waitForLeaders: true,
      topics: [
        {
          topic: TOPICS.CRITICAL,
          numPartitions: 3,      // 3 parallel lanes for critical events
          replicationFactor: 1,  // 1 copy (we only have 1 broker in dev)
        },
        {
          topic: TOPICS.EVENTS,
          numPartitions: 6,      // 6 parallel lanes for normal events
          replicationFactor: 1,
        },
        {
          topic: TOPICS.DLQ,
          numPartitions: 1,      // 1 lane is enough for failed messages
          replicationFactor: 1,
        },
      ],
    });

    console.log('Kafka topics created successfully');
  } catch (error) {
    console.error('Error creating topics:', error);
    throw error;
  } finally {
    await admin.disconnect();
  }
}