import { Client } from 'pg';

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  database: 'notification_engine',
  user: 'notification_user',
  password: 'notificationengine123',
});

const users = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    name: 'Rahul Sharma',
    phone: '+919876543210',
    email: 'rahul.sharma@example.com',
    language: 'hi',
    timezone: 'Asia/Kolkata',
    dnd_status: 'not_registered',
    account_type: 'premium',
    risk_profile: 'aggressive',
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
  },
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    name: 'Priya Patel',
    phone: '+919765432109',
    email: 'priya.patel@example.com',
    language: 'en',
    timezone: 'Asia/Kolkata',
    dnd_status: 'registered',
    account_type: 'basic',
    risk_profile: 'conservative',
    quiet_hours_start: '21:00',
    quiet_hours_end: '09:00',
  },
  {
    id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    name: 'Amit Kumar',
    phone: '+919654321098',
    email: 'amit.kumar@example.com',
    language: 'mr',
    timezone: 'Asia/Kolkata',
    dnd_status: 'not_registered',
    account_type: 'HNI',
    risk_profile: 'moderate',
    quiet_hours_start: '23:00',
    quiet_hours_end: '07:00',
  },
];

async function seed() {
  await client.connect();
  console.log('Connected to database');

  for (const user of users) {
    await client.query(`
      INSERT INTO users (
        id, name, phone, email, language, timezone,
        dnd_status, account_type, risk_profile,
        quiet_hours_start, quiet_hours_end
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      ON CONFLICT (id) DO NOTHING;
    `, [
      user.id, user.name, user.phone, user.email,
      user.language, user.timezone, user.dnd_status,
      user.account_type, user.risk_profile,
      user.quiet_hours_start, user.quiet_hours_end,
    ]);
  }

  console.log('Seeded 3 test users successfully!');
  await client.end();
}

seed().catch(console.error);