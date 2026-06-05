import { Pool } from 'pg';

const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  database: 'notification_engine',
  user: 'notification_user',
  password: 'notificationengine123',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default pool;