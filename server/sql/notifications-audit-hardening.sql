-- Notifications and audit logs: clean-up, indexes and a safer audit foreign key.
-- Run in the Neon SQL editor. Safe to run more than once. Run it BEFORE deploying the matching server.
--
-- 1. Notifications created with an empty link now store NULL instead of ''.
-- 2. Indexes for the queries the app runs on every page load (notification list and unread
--    badge, audit log list and filters).
-- 3. audit_logs.actor_id no longer cascades: deleting a user can never silently erase the trail
--    of what that user did. The app already refuses to delete an account that has audit entries;
--    this makes the database enforce the same rule.

BEGIN;

UPDATE notifications SET link = NULL WHERE link = '';

CREATE INDEX IF NOT EXISTS notifications_user_created_idx
  ON notifications (user_id, created_at DESC);

-- Tiny index that only contains unread rows: the unread badge is polled every minute.
CREATE INDEX IF NOT EXISTS notifications_user_unread_idx
  ON notifications (user_id) WHERE is_read = FALSE;

CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx
  ON audit_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS audit_logs_actor_created_idx
  ON audit_logs (actor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS audit_logs_entity_idx
  ON audit_logs (entity_type, entity_id);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'audit_logs_actor_id_fkey'
      AND conrelid = 'audit_logs'::regclass
      AND confdeltype = 'c'            -- 'c' = ON DELETE CASCADE
  ) THEN
    ALTER TABLE audit_logs DROP CONSTRAINT audit_logs_actor_id_fkey;
    ALTER TABLE audit_logs
      ADD CONSTRAINT audit_logs_actor_id_fkey
      FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE RESTRICT;
  END IF;
END
$$;

COMMIT;

-- To undo the foreign key change (not recommended):
--   ALTER TABLE audit_logs DROP CONSTRAINT audit_logs_actor_id_fkey;
--   ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_actor_id_fkey
--     FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE;
