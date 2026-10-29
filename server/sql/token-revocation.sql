-- Patch 16 (session revocation): lets deactivating an account, or resetting its password,
-- end that person's sessions immediately.
--
-- RUN THIS IN THE NEON SQL EDITOR *BEFORE* DEPLOYING THE SERVER PATCH. The new server code
-- reads this column on every request, so deploying it first makes the API fail until the
-- column exists.
--
-- Safe to run more than once. NULL means "no sessions have ever been revoked".

ALTER TABLE users ADD COLUMN IF NOT EXISTS tokens_valid_after timestamptz;

-- Check:
--   SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name = 'users' AND column_name = 'tokens_valid_after';
