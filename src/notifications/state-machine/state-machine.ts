import pool from '../../config/database';
import { NotificationStatus, isValidTransition } from './notification-states';

// Records a state transition in the database
// Every single state change gets logged with who did it and when
export async function transitionState(
  notificationId: string,
  fromStatus: NotificationStatus,
  toStatus: NotificationStatus,
  actor: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  // Validate the transition is allowed
  if (!isValidTransition(fromStatus, toStatus)) {
    throw new Error(
      `Invalid state transition: ${fromStatus} -> ${toStatus} for notification ${notificationId}`
    );
  }

  // Use a database transaction so both updates happen together
  // If one fails, both are rolled back - no inconsistent state
  const dbClient = await pool.connect();
  
  try {
    await dbClient.query('BEGIN');

    // Update the notification status
    await dbClient.query(
      `UPDATE notifications SET status = $1, updated_at = NOW() WHERE id = $2`,
      [toStatus, notificationId]
    );

    // Log the transition in state log - this is the audit trail
    await dbClient.query(
      `INSERT INTO notification_state_log 
       (notification_id, from_status, to_status, actor, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [notificationId, fromStatus, toStatus, actor, metadata ? JSON.stringify(metadata) : null]
    );

    await dbClient.query('COMMIT');
    console.log(`Notification ${notificationId}: ${fromStatus} -> ${toStatus}`);
  } catch (error) {
    await dbClient.query('ROLLBACK');
    throw error;
  } finally {
    dbClient.release();
  }
}

// Creates a new notification record in the database
export async function createNotificationRecord(
  eventType: string,
  eventId: string,
  userId: string,
  channel: string,
  priority: number,
  templateId: string,
  personalisationData: Record<string, unknown>
): Promise<string> {
  const result = await pool.query(
    `INSERT INTO notifications 
     (event_type, event_id, user_id, channel, priority, status, template_id, personalisation_data)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      eventType, eventId, userId, channel,
      priority, NotificationStatus.CREATED,
      templateId, JSON.stringify(personalisationData),
    ]
  );

  return result.rows[0].id;
}