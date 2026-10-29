-- Patch 17 (teachers delete the students they add): records who created each account.
--
-- RUN THIS IN THE NEON SQL EDITOR *BEFORE* DEPLOYING THE SERVER PATCH. The new server code
-- writes this column when an account is created and reads it when deleting, so deploying first
-- makes "Add user/student" fail until the column exists.
--
-- Safe to run more than once.
--
-- Existing accounts get NULL ("creator unknown"). Only administrators can delete those, so nobody
-- gains delete rights they should not have. If the creator is deleted, their accounts become NULL
-- too (ON DELETE SET NULL) instead of being deleted with them.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS users_created_by_idx ON users (created_by);

-- OPTIONAL backfill (skip unless teachers must keep control of students they added BEFORE this
-- patch). The audit log is best-effort, so some accounts may have no 'user.create' row, and a
-- wrong owner is worse than no owner. Run the check first and read the rows before updating.
--
-- Check (what would be assigned):
--   SELECT u.id, u.email, a.actor_id AS would_set_created_by
--   FROM users u
--   JOIN audit_logs a ON a.action = 'user.create' AND a.entity_id::text = u.id::text
--   WHERE u.created_by IS NULL AND a.actor_id IS NOT NULL;
--
-- Apply (only after the check looks right):
--   UPDATE users u SET created_by = a.actor_id
--   FROM audit_logs a
--   WHERE a.action = 'user.create' AND a.entity_id::text = u.id::text
--     AND a.actor_id IS NOT NULL AND u.created_by IS NULL AND a.actor_id <> u.id;

-- Check:
--   SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name = 'users' AND column_name = 'created_by';
