import { Request, Response } from 'express';
import { sql } from '../config/db.js';

export async function listAuditLogs(_req: Request, res: Response): Promise<void> {
  const { actor_id, action, entity_type } = _req.query as {
    actor_id?: string;
    action?: string;
    entity_type?: string;
  };

  const actorParam = actor_id ?? null;
  const actionParam = action ?? null;
  const entityParam = entity_type ?? null;

  const logs = await sql`
    SELECT al.id, al.actor_id, al.action, al.entity_type, al.entity_id,
           al.old_values, al.new_values, al.ip_address, al.created_at,
           p.first_name, p.last_name
    FROM audit_logs al
    JOIN users u ON u.id = al.actor_id
    JOIN profiles p ON p.user_id = u.id
    WHERE (${actorParam}::uuid IS NULL OR al.actor_id = ${actorParam}::uuid)
      AND (${actionParam}::text IS NULL OR al.action = ${actionParam}::text)
      AND (${entityParam}::text IS NULL OR al.entity_type = ${entityParam}::text)
    ORDER BY al.created_at DESC
  `;
  res.json({ audit_logs: logs });
}

export async function createAuditLog(req: Request, res: Response): Promise<void> {
  const { actor_id, action, entity_type, entity_id, old_values, new_values, ip_address } =
    req.body as {
      actor_id: string;
      action: string;
      entity_type: string;
      entity_id: string;
      old_values?: Record<string, unknown>;
      new_values?: Record<string, unknown>;
      ip_address?: string;
    };

  const [log] = await sql`
    INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, old_values, new_values, ip_address)
    VALUES (${actor_id}, ${action}, ${entity_type}, ${entity_id},
            ${old_values ? JSON.stringify(old_values) : null},
            ${new_values ? JSON.stringify(new_values) : null},
            ${ip_address})
    RETURNING id, actor_id, action, entity_type, entity_id, old_values, new_values, ip_address, created_at
  `;
  res.status(201).json({ audit_log: log });
}
