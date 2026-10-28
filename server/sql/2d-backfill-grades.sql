-- Patch 12 (2D Grades): one-time backfill of grades that existed before grades were written
-- automatically. Safe to run more than once: rows that already exist are skipped.
-- Run it in the Neon SQL editor AFTER deploying the server patch.
-- Scores are percentages 0-100. term follows the school year (June starts a new one, Manila time).

BEGIN;

-- Graded assignment submissions (submissions.grade is points out of assignments.max_score).
INSERT INTO grades (student_id, course_id, assessment_type, assessment_id, score, feedback, term, created_at)
SELECT s.student_id,
       m.course_id,
       'assignment',
       s.assignment_id,
       CASE WHEN a.max_score > 0 THEN ROUND((s.grade / a.max_score * 100)::numeric, 2) ELSE 0 END,
       s.feedback,
       (CASE WHEN EXTRACT(MONTH FROM s.graded_at AT TIME ZONE 'Asia/Manila') >= 6
             THEN EXTRACT(YEAR FROM s.graded_at AT TIME ZONE 'Asia/Manila')
             ELSE EXTRACT(YEAR FROM s.graded_at AT TIME ZONE 'Asia/Manila') - 1 END)::int::text,
       s.graded_at
FROM submissions s
JOIN assignments a ON a.id = s.assignment_id
JOIN modules m ON m.id = a.module_id
WHERE s.grade IS NOT NULL
  AND s.graded_at IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM grades g
    WHERE g.student_id = s.student_id
      AND g.assessment_type = 'assignment'
      AND g.assessment_id = s.assignment_id
  );

-- Quiz attempts (quiz_attempts.score is already a percentage).
INSERT INTO grades (student_id, course_id, assessment_type, assessment_id, score, term, created_at)
SELECT att.student_id,
       q.course_id,
       'quiz',
       att.quiz_id,
       att.score,
       (CASE WHEN EXTRACT(MONTH FROM att.submitted_at AT TIME ZONE 'Asia/Manila') >= 6
             THEN EXTRACT(YEAR FROM att.submitted_at AT TIME ZONE 'Asia/Manila')
             ELSE EXTRACT(YEAR FROM att.submitted_at AT TIME ZONE 'Asia/Manila') - 1 END)::int::text,
       att.submitted_at
FROM quiz_attempts att
JOIN quizzes q ON q.id = att.quiz_id
WHERE NOT EXISTS (
  SELECT 1 FROM grades g
  WHERE g.student_id = att.student_id
    AND g.assessment_type = 'quiz'
    AND g.assessment_id = att.quiz_id
);

COMMIT;

-- Check afterwards:
--   SELECT assessment_type, COUNT(*) FROM grades GROUP BY 1;
