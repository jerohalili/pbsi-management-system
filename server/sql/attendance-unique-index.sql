-- Attendance: make sure "one record per student, course and day" is enforced by the database.
-- The attendance endpoints use ON CONFLICT (student_id, course_id, date), which REQUIRES a
-- unique index on exactly those columns. Safe to run more than once.
--
-- Step 0 (optional): see whether it already exists.
--   SELECT indexdef FROM pg_indexes WHERE tablename = 'attendance';
--
-- Step 1: look for duplicates. This must return NO rows before you create the index.

SELECT student_id, course_id, date, COUNT(*) AS copies
FROM attendance
GROUP BY 1, 2, 3
HAVING COUNT(*) > 1;

-- Step 2: only if step 1 returned nothing.
CREATE UNIQUE INDEX IF NOT EXISTS attendance_student_course_date_key
  ON attendance (student_id, course_id, date);

-- Step 3 (optional, speeds up the class list and the records page).
CREATE INDEX IF NOT EXISTS attendance_course_date_idx
  ON attendance (course_id, date);
