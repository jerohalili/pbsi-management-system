-- OPTIONAL: make audit_logs append-only at the database level.
-- Run in the Neon SQL editor after notifications-audit-hardening.sql. Safe to run more than once.
--
-- Once installed, any UPDATE, DELETE or TRUNCATE on audit_logs fails, whoever runs it, so history
-- cannot be edited or wiped by a bug, a stray query or a compromised admin account. INSERT is
-- unaffected. This is a strong speed bump, not an absolute lock: the table owner can still drop
-- the trigger (and that is itself visible in Neon's history).
--
-- Remember this when you want to clear test data: drop the triggers first (see the bottom).

CREATE OR REPLACE FUNCTION audit_logs_block_changes() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is append-only: % is not allowed', TG_OP
    USING ERRCODE = 'insufficient_privilege';
END
$$;

DROP TRIGGER IF EXISTS audit_logs_no_update_delete ON audit_logs;
CREATE TRIGGER audit_logs_no_update_delete
  BEFORE UPDATE OR DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION audit_logs_block_changes();

DROP TRIGGER IF EXISTS audit_logs_no_truncate ON audit_logs;
CREATE TRIGGER audit_logs_no_truncate
  BEFORE TRUNCATE ON audit_logs
  FOR EACH STATEMENT EXECUTE FUNCTION audit_logs_block_changes();

-- To remove (for example to clear test data):
--   DROP TRIGGER IF EXISTS audit_logs_no_update_delete ON audit_logs;
--   DROP TRIGGER IF EXISTS audit_logs_no_truncate ON audit_logs;
--   DROP FUNCTION IF EXISTS audit_logs_block_changes();
