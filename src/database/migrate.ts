import { Client } from 'pg';

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'notification_engine',
  user: 'notification_user',
  password: 'pass123' as string,
});

async function migrate() {
  try {
    await client.connect();
    console.log('Connected!');
    await client.end();
  } catch(e) {
    console.error(e);
  }
}

migrate();