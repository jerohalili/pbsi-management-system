-- Cloudinary uploads: submission files, assignment material files, quiz question images.
-- Run once in the Neon SQL editor BEFORE deploying the matching server. Safe to run more than once.

-- Student submissions: a hand-in is now a link (file_url) OR an uploaded file (file_public_id).
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS file_public_id text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS file_name text;
-- A file upload has no link, so the link column must allow NULL (no-op if it already does).
ALTER TABLE submissions ALTER COLUMN file_url DROP NOT NULL;

-- Teacher assignment material: one private file per assignment (the link column stays as is).
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS attachment_public_id text;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS attachment_name text;

-- Optional picture on a quiz question.
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS image_public_id text;
