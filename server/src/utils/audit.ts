import type { Request } from 'express';
import { sql } from '../config/db.js';

/**
 * Best-effort audit trail for any kind of record. Never stores passwords. A failure here is
 * logged but does not undo the (already successful) change.
 */
export async function recordAudit(
  req: Request,
  action: string,
  entityType: string,
  entityId: string,
  oldValues: Record<string, unknown> | null,
  newValues: Record<string, unknown> | null,
): Promise<void> {
  try {
    await sql`
      INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, old_values, new_values, ip_address)
      VALUES (${req.user?.id ?? null}, ${action}, ${entityType}, ${entityId},
              ${oldValues ? JSON.stringify(oldValues) : null}, ${newValues ? JSON.stringify(newValues) : null},
              ${req.ip ?? null})
    `;
  } catch (err) {
    console.error('[audit] failed to write audit log:', err);
  }
}
