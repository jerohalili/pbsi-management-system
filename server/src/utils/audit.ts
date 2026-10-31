import type { Request } from 'express';
import { sql } from '../config/db.js';

type Values = Record<string, unknown> | null;

function json(value: Values): string | null {
  return value ? JSON.stringify(value) : null;
}

/**
 * The INSERT for one audit row, not yet run. Pass it to `sql.transaction([...])` next to the change
 * it describes when the two must succeed or fail together (use for the most sensitive actions).
 * Never stores passwords.
 */
export function auditStatement(
  req: Request,
  action: string,
  entityType: string,
  entityId: string,
  oldValues: Values,
  newValues: Values,
) {
  const actorId = req.user?.id;
  if (!actorId) throw new Error(`Cannot audit "${action}": the request has no signed-in user`);
  return sql`
    INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, old_values, new_values, ip_address)
    VALUES (${actorId}, ${action}, ${entityType}, ${entityId},
            ${json(oldValues)}::jsonb, ${json(newValues)}::jsonb, ${req.ip ?? null})
  `;
}

/**
 * Best-effort audit trail for any kind of record. A failure here is logged but does not undo the
 * (already successful) change. For changes that must never go unrecorded, use `auditStatement`
 * inside a transaction instead.
 */
export async function recordAudit(
  req: Request,
  action: string,
  entityType: string,
  entityId: string,
  oldValues: Values,
  newValues: Values,
): Promise<void> {
  try {
    await auditStatement(req, action, entityType, entityId, oldValues, newValues);
  } catch (err) {
    console.error(`[audit] failed to write "${action}" for ${entityType} ${entityId}:`, err);
  }
}

/**
 * Keeps only the fields whose value actually changed, so an audit row says what changed instead
 * of repeating the whole record. Returns null when nothing changed.
 */
export function diffValues(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): { old: Record<string, unknown>; new: Record<string, unknown> } | null {
  const old: Record<string, unknown> = {};
  const next: Record<string, unknown> = {};
  for (const key of Object.keys(after)) {
    if (after[key] === undefined) continue;
    if (String(before[key] ?? '') === String(after[key] ?? '')) continue;
    old[key] = before[key] ?? null;
    next[key] = after[key] ?? null;
  }
  return Object.keys(next).length > 0 ? { old, new: next } : null;
}
