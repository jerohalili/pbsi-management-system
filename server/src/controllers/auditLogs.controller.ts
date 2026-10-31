import { Request, Response } from 'express';
import { sql } from '../config/db.js';
import { auditLogQuerySchema } from '../utils/validation.js';

/**
 * GET /api/audit-logs: newest first, filtered and paged.
 * Filters: actor_id, entity_id, action, entity_type, from, to (YYYY-MM-DD, Philippine time).
 * Also returns the distinct actions and entity types so the page can fill its dropdowns.
 *
 * There is deliberately no way to create, edit or delete entries through the API: the trail is
 * written only by the server, as a side effect of the actions it records.
 */
export async function listAuditLogs(req: Request, res: Response): Promise<void> {
  const q = auditLogQuerySchema.parse(req.query);

  const actor = q.actor_id ?? null;
  const entityId = q.entity_id ?? null;
  const action = q.action ?? null;
  const entityType = q.entity_type ?? null;
  const from = q.from ?? null;
  const to = q.to ?? null;

  const [logs, actions, entityTypes] = await Promise.all([
    sql`
      SELECT al.id, al.actor_id, al.action, al.entity_type, al.entity_id,
             al.old_values, al.new_values, al.ip_address, al.created_at,
             p.first_name, p.last_name, u.email AS actor_email,
             COUNT(*) OVER()::int AS total_count
      FROM audit_logs al
      JOIN users u ON u.id = al.actor_id
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE (${actor}::uuid IS NULL OR al.actor_id = ${actor}::uuid)
        AND (${entityId}::uuid IS NULL OR al.entity_id = ${entityId}::uuid)
        AND (${action}::text IS NULL OR al.action = ${action}::text)
        AND (${entityType}::text IS NULL OR al.entity_type = ${entityType}::text)
        AND (${from}::date IS NULL
             OR al.created_at >= (${from}::date)::timestamp AT TIME ZONE 'Asia/Manila')
        AND (${to}::date IS NULL
             OR al.created_at < ((${to}::date + 1)::timestamp AT TIME ZONE 'Asia/Manila'))
      ORDER BY al.created_at DESC, al.id DESC
      LIMIT ${q.limit} OFFSET ${(q.page - 1) * q.limit}
    `,
    sql`SELECT DISTINCT action FROM audit_logs ORDER BY action`,
    sql`SELECT DISTINCT entity_type FROM audit_logs ORDER BY entity_type`,
  ]);

  res.json({
    audit_logs: logs.map(({ total_count: _total, ...row }) => row),
    total: (logs[0]?.total_count as number | undefined) ?? 0,
    page: q.page,
    limit: q.limit,
    actions: actions.map((row) => row.action as string),
    entity_types: entityTypes.map((row) => row.entity_type as string),
  });
}
