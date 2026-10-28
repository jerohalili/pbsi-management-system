-- Patch 12 (2D Grades), OPTIONAL hardening. Run after the backfill.
-- Step 1: look for duplicates. Both queries must return NO rows before you create the indexes.

SELECT student_id, assessment_type, assessment_id, COUNT(*) AS copies
FROM grades
GROUP BY 1, 2, 3
HAVING COUNT(*) > 1;

SELECT quiz_id, student_id, COUNT(*) AS copies
FROM quiz_attempts
GROUP BY 1, 2
HAVING COUNT(*) > 1;

-- Step 2: only if step 1 returned nothing.
CREATE UNIQUE INDEX IF NOT EXISTS grades_student_assessment_key
  ON grades (student_id, assessment_type, assessment_id);

CREATE UNIQUE INDEX IF NOT EXISTS quiz_attempts_quiz_student_key
  ON quiz_attempts (quiz_id, student_id);

-- Note: POST /grades (manual create) has no duplicate handling. With the first index in place, a
-- duplicate manual grade returns a server error instead of silently adding a second row.
