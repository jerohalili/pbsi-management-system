-- Cleanup: drop the unused students.cumulative_gpa column.
--
-- Nothing in the server reads or writes this column any more. The "cumulative_gpa" name that
-- still appears in GET /api/grades/gpa/:student_id is only an alias for AVG(grades.score).
-- Student averages are always calculated live from the grades table.
--
-- RUN THIS IN THE NEON SQL EDITOR *AFTER* the latest server code is deployed and has been
-- running fine for a while. It is destructive: the stored values are lost (they are stale
-- anyway). Optional: copy them first if you want a backup.
--
-- Safe to run more than once (IF EXISTS).

-- Optional backup (uncomment to keep a copy):
-- CREATE TABLE IF NOT EXISTS students_cumulative_gpa_backup AS
--   SELECT id, cumulative_gpa FROM students;

ALTER TABLE students DROP COLUMN IF EXISTS cumulative_gpa;

-- Check (should return no rows):
--   SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'students' AND column_name = 'cumulative_gpa';
