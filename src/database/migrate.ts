import { Client } from 'pg';

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  database: 'notification_engine',
  user: 'notification_user',
  password: 'notificationengine123',
});

async function migrate() {
  await client.connect();
  console.log('Connected to database successfully!');

  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(255) NOT NULL,
      language VARCHAR(10) DEFAULT 'en',
      timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
      dnd_status VARCHAR(20) DEFAULT 'not_registered',
      account_type VARCHAR(20) DEFAULT 'basic',
      risk_profile VARCHAR(20) DEFAULT 'moderate',
      quiet_hours_start VARCHAR(10) DEFAULT '21:00',
      quiet_hours_end VARCHAR(10) DEFAULT '08:00',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_type VARCHAR(10) NOT NULL,
      event_id VARCHAR(50) NOT NULL,
      user_id UUID NOT NULL REFERENCES users(id),
      channel VARCHAR(20) NOT NULL,
      priority INTEGER DEFAULT 5,
      status VARCHAR(20) DEFAULT 'CREATED',
      template_id VARCHAR(50) NOT NULL,
      template_version INTEGER DEFAULT 1,
      personalisation_data JSONB NOT NULL,
      rendered_content JSONB,
      provider VARCHAR(30),
      external_id VARCHAR(100),
      delivery_attempts INTEGER DEFAULT 0,
      max_retries INTEGER DEFAULT 3,
      next_retry_at TIMESTAMPTZ,
      delivered_at TIMESTAMPTZ,
      read_at TIMESTAMPTZ,
      failed_reason TEXT,
      cost_paisa INTEGER,
      metadata JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS notification_state_log (
      id BIGSERIAL PRIMARY KEY,
      notification_id UUID NOT NULL,
      from_status VARCHAR(20),
      to_status VARCHAR(20) NOT NULL,
      actor VARCHAR(50) NOT NULL,
      metadata JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS dead_letter_queue (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      notification_id UUID NOT NULL,
      original_event JSONB NOT NULL,
      failure_reason TEXT NOT NULL,
      retry_count INTEGER NOT NULL,
      last_error TEXT,
      resolved BOOLEAN DEFAULT FALSE,
      resolved_by VARCHAR(50),
      resolved_at TIMESTAMPTZ,
      resolution_action VARCHAR(50),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id),
      event_category VARCHAR(10) NOT NULL,
      event_type VARCHAR(10),
      channel VARCHAR(20) NOT NULL,
      enabled BOOLEAN DEFAULT TRUE,
      quiet_hours_override BOOLEAN DEFAULT FALSE,
      digest_mode VARCHAR(20) DEFAULT 'immediate',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS templates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      template_id VARCHAR(50) UNIQUE NOT NULL,
      event_type VARCHAR(10) NOT NULL,
      version INTEGER DEFAULT 1,
      channel VARCHAR(20) NOT NULL,
      content JSONB NOT NULL,
      locale VARCHAR(10) DEFAULT 'en',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS consent_records (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id),
      channel VARCHAR(20) NOT NULL,
      consent_type VARCHAR(30) NOT NULL,
      granted BOOLEAN NOT NULL,
      ip_address VARCHAR(45),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_notifications_user_status 
    ON notifications(user_id, status, channel);
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_notifications_event_type 
    ON notifications(event_type, created_at);
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_state_log_notification 
    ON notification_state_log(notification_id);
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_state_log_created 
    ON notification_state_log(created_at);
  `);

  console.log('All tables and indexes created successfully!');
  await client.end();
}

migrate().catch(console.error);