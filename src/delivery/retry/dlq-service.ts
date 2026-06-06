import pool from '../../config/database';

export interface DlqEntry {
  notificationId: string;
  originalEvent: Record<string, unknown>;
  failureReason: string;
  retryCount: number;
  lastError: string;
}

// Moves a failed notification to the Dead Letter Queue
// This means we've exhausted all retries
export async function moveToDlq(entry: DlqEntry): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO dead_letter_queue 
       (notification_id, original_event, failure_reason, retry_count, last_error)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        entry.notificationId,
        JSON.stringify(entry.originalEvent),
        entry.failureReason,
        entry.retryCount,
        entry.lastError,
      ]
    );
    console.log(`💀 Moved to DLQ: ${entry.notificationId} after ${entry.retryCount} retries`);
  } catch (error) {
    console.error('Failed to write to DLQ:', error);
  }
}

// Gets all unresolved DLQ entries
export async function getDlqEntries(): Promise<unknown[]> {
  const result = await pool.query(
    `SELECT * FROM dead_letter_queue 
     WHERE resolved = FALSE 
     ORDER BY created_at DESC 
     LIMIT 100`
  );
  return result.rows;
}

// Marks a DLQ entry as resolved
export async function resolveDlqEntry(
  id: string,
  resolvedBy: string,
  action: string
): Promise<void> {
  await pool.query(
    `UPDATE dead_letter_queue 
     SET resolved = TRUE, resolved_by = $1, resolved_at = NOW(), resolution_action = $2
     WHERE id = $3`,
    [resolvedBy, action, id]
  );
  console.log(`✅ DLQ entry ${id} resolved by ${resolvedBy}`);
}