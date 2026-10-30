-- Discussions (threads, replies, moderation, reports).
--
-- RUN THIS IN THE NEON SQL EDITOR *BEFORE* DEPLOYING THE SERVER PATCH. The new server code reads
-- and writes these columns, so deploying first makes every discussion request fail until they exist.
--
-- Safe to run more than once. Nothing is dropped or rewritten: existing threads and replies keep
-- working (existing threads get an empty opening post).
--
-- Deleting is "soft": deleted_at is set and the row stays, so a reply that others answered can show
-- "removed" instead of breaking the conversation. Deleting a USER still removes their own rows for
-- good (users.controller.ts is unchanged), and a thread that other people replied to still blocks
-- that deletion exactly as before.

ALTER TABLE discussion_threads
  ADD COLUMN IF NOT EXISTS body text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_pinned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_locked boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS edited_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid;

ALTER TABLE discussion_replies
  ADD COLUMN IF NOT EXISTS edited_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid;

-- The reply a teacher or the asker marked as the answer. If that reply is removed for good,
-- the thread simply becomes "unanswered" again.
ALTER TABLE discussion_threads
  ADD COLUMN IF NOT EXISTS answer_reply_id uuid REFERENCES discussion_replies(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS discussion_threads_course_idx
  ON discussion_threads (course_id, created_at DESC);
CREATE INDEX IF NOT EXISTS discussion_replies_thread_idx
  ON discussion_replies (thread_id, created_at);

-- A student's or teacher's report of a post (cyber-bullying, abuse, spam). One report per person
-- per post. Reports disappear with the post or the reporter's account.
CREATE TABLE IF NOT EXISTS discussion_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid REFERENCES discussion_threads(id) ON DELETE CASCADE,
  reply_id uuid REFERENCES discussion_replies(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT discussion_reports_one_target CHECK ((thread_id IS NULL) <> (reply_id IS NULL))
);

CREATE UNIQUE INDEX IF NOT EXISTS discussion_reports_thread_once
  ON discussion_reports (reporter_id, thread_id) WHERE thread_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS discussion_reports_reply_once
  ON discussion_reports (reporter_id, reply_id) WHERE reply_id IS NOT NULL;

-- Check:
--   SELECT table_name, column_name, data_type FROM information_schema.columns
--   WHERE table_name IN ('discussion_threads','discussion_replies','discussion_reports')
--   ORDER BY table_name, ordinal_position;
