import pool from '../../config/database';
import { ValidatedEvent } from '../../events/validators/event-validator';

// This is the enriched event - raw event + user context
export interface EnrichedEvent {
  event: ValidatedEvent;
  user: {
    id: string;
    name: string;
    phone: string;
    email: string;
    language: string;
    timezone: string;
    dnd_status: string;
    account_type: string;
    risk_profile: string;
    quiet_hours_start: string;
    quiet_hours_end: string;
  };
  enriched_at: string;
}

// Fetches user data from database and attaches it to the event
// This is called for every single event that comes through
export async function enrichEvent(event: ValidatedEvent): Promise<EnrichedEvent | null> {
  try {
    const result = await pool.query(
      `SELECT 
        id, name, phone, email, language, timezone,
        dnd_status, account_type, risk_profile,
        quiet_hours_start, quiet_hours_end
       FROM users 
       WHERE id = $1`,
      [event.user_id]
    );

    // If user not found, we cannot process this event
    if (result.rows.length === 0) {
      console.warn(`User not found for event: ${event.event_id}, user_id: ${event.user_id}`);
      return null;
    }

    const user = result.rows[0];

    return {
      event,
      user,
      enriched_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Enrichment failed:', error);
    return null;
  }
}