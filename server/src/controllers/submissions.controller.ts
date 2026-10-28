import { Request, Response } from 'express';
import { sql } from '../config/db.js';
import { gradeSubmissionSchema, submitAssignmentSchema } from '../utils/validation.js';
import {
  assertCanManageAssignment,
  assertHttpUrl,
  getOwnStudentId,
  httpError,
  parseUuid,
} from '../utils/access.js';
import { schoolYearTerm, toPercent } from '../utils/gradeTerm.js';
import type { AuthUser } from '../types/index.js';

function currentUser(req: Request): AuthUser {
  if (!req.user) throw httpError(401, 'Not authenticated');
  return req.user;
}

/**
 * Teacher view of one assignment: every active student, with their submission if they
 * made one ("missing" otherwise). A student who was deactivated still shows up if they submitted.
 */
export async function listSubmissions(req: Request, res: Response): Promise<void> {
  const user = currentUser(req);
  if (user.role !== 'admin' && user.role !== 'teacher') {
    throw httpError(403, 'Forbidden: insufficient permissions');
  }
  const assignmentId = parseUuid((req.query as { assignment_id?: string }).assignment_id, 'assignment id');

  const assignment = await assertCanManageAssignment(user, assignmentId);

  const submissions = await sql`
    SELECT st.id AS student_id, st.student_id AS student_number,
           p.first_name, p.last_name,
           sub.id AS submission_id, sub.file_url, sub.submitted_at,
           sub.grade::float8 AS grade, sub.feedback, sub.graded_at,
           (sub.id IS NOT NULL AND sub.submitted_at > ${assignment.due_date}::timestamptz) AS is_late
    FROM students st
    JOIN users u ON u.id = st.user_id
    JOIN profiles p ON p.user_id = u.id
    LEFT JOIN LATERAL (
      SELECT s.id, s.file_url, s.submitted_at, s.grade, s.feedback, s.graded_at
      FROM submissions s
      WHERE s.assignment_id = ${assignmentId} AND s.student_id = st.id
      ORDER BY s.submitted_at DESC
      LIMIT 1
    ) sub ON TRUE
    WHERE u.is_active = TRUE OR sub.id IS NOT NULL
    ORDER BY p.last_name ASC, p.first_name ASC
  `;

  res.json({
    assignment: {
      id: assignment.id,
      title: assignment.title,
      max_score: assignment.max_score,
      due_date: assignment.due_date,
    },
    submissions,
  });
}

/** One submission: its owner, or a teacher/admin who manages the course. */
export async function getSubmission(req: Request, res: Response): Promise<void> {
  const user = currentUser(req);
  const id = parseUuid(req.params.id, 'submission id');

  const [submission] = await sql`
    SELECT s.id, s.assignment_id, s.student_id, s.file_url, s.submitted_at,
           s.grade::float8 AS grade, s.feedback, s.graded_at,
           (s.submitted_at > a.due_date) AS is_late
    FROM submissions s
    JOIN assignments a ON a.id = s.assignment_id
    WHERE s.id = ${id}
  `;
  if (!submission) throw httpError(404, 'Submission not found');

  if (user.role === 'student') {
    const ownId = await getOwnStudentId(user.id);
    if (!ownId || ownId !== submission.student_id) {
      throw httpError(403, 'Forbidden: you can only view your own submissions');
    }
  } else {
    await assertCanManageAssignment(user, submission.assignment_id as string);
  }

  res.json({ submission });
}

/**
 * A student submits (or resubmits) a link. Resubmitting replaces the previous link until a
 * teacher has graded it; after that the submission is locked.
 *
 * Done as one statement that does not depend on a unique constraint: it updates the student's
 * ungraded submission, or inserts one only if the student has none yet.
 */
export async function createSubmission(req: Request, res: Response): Promise<void> {
  const user = currentUser(req);
  if (user.role !== 'student') throw httpError(403, 'Only students can submit assignments');

  const input = submitAssignmentSchema.parse(req.body);
  assertHttpUrl(input.file_url, 'Submission link');

  const studentId = await getOwnStudentId(user.id);
  if (!studentId) throw httpError(404, 'Student profile not found');

  const [assignment] = await sql`SELECT id FROM assignments WHERE id = ${input.assignment_id}`;
  if (!assignment) throw httpError(404, 'Assignment not found');

  const [submission] = await sql`
    WITH upd AS (
      UPDATE submissions
      SET file_url = ${input.file_url}::text, submitted_at = now()
      WHERE assignment_id = ${input.assignment_id}::uuid
        AND student_id = ${studentId}::uuid
        AND grade IS NULL
      RETURNING id, assignment_id, student_id, file_url, submitted_at, grade, feedback, graded_at
    ),
    ins AS (
      INSERT INTO submissions (assignment_id, student_id, file_url)
      SELECT ${input.assignment_id}::uuid, ${studentId}::uuid, ${input.file_url}::text
      WHERE NOT EXISTS (
        SELECT 1 FROM submissions
        WHERE assignment_id = ${input.assignment_id}::uuid AND student_id = ${studentId}::uuid
      )
      RETURNING id, assignment_id, student_id, file_url, submitted_at, grade, feedback, graded_at
    )
    SELECT r.id, r.assignment_id, r.student_id, r.file_url, r.submitted_at,
           r.grade::float8 AS grade, r.feedback, r.graded_at,
           (r.submitted_at > a.due_date) AS is_late
    FROM (SELECT * FROM upd UNION ALL SELECT * FROM ins) r
    JOIN assignments a ON a.id = r.assignment_id
  `;

  if (!submission) {
    throw httpError(409, 'This submission has already been graded and can no longer be changed.');
  }
  res.status(201).json({ submission });
}

/** A teacher/admin who manages the course grades (or re-grades) a submission. */
export async function gradeSubmission(req: Request, res: Response): Promise<void> {
  const user = currentUser(req);
  const id = parseUuid(req.params.id, 'submission id');
  const input = gradeSubmissionSchema.parse(req.body);

  const [existing] = await sql`
    SELECT s.id, s.assignment_id, st.user_id AS student_user_id
    FROM submissions s
    JOIN students st ON st.id = s.student_id
    WHERE s.id = ${id}
  `;
  if (!existing) throw httpError(404, 'Submission not found');

  const assignment = await assertCanManageAssignment(user, existing.assignment_id as string);

  if (input.score > assignment.max_score) {
    throw httpError(400, `Score can’t be higher than the maximum of ${assignment.max_score}`);
  }

  const feedbackProvided = input.feedback !== undefined;
  const percent = toPercent(input.score, assignment.max_score);

  // One statement, so the submission and its grades row can never disagree. A re-grade updates the
  // existing grades row (matched by student + assessment); the first grade inserts it.
  const [submission] = await sql`
    WITH sub AS (
      UPDATE submissions
      SET grade = ${input.score},
          feedback = CASE WHEN ${feedbackProvided}::boolean THEN ${input.feedback || null} ELSE feedback END,
          graded_by = ${user.id},
          graded_at = now()
      WHERE id = ${id}
      RETURNING id, assignment_id, student_id, file_url, submitted_at, grade, feedback, graded_at
    ),
    upd AS (
      UPDATE grades g
      SET score = ${percent}::numeric, feedback = sub.feedback
      FROM sub
      WHERE g.student_id = sub.student_id
        AND g.assessment_type = 'assignment'
        AND g.assessment_id = sub.assignment_id
      RETURNING g.id
    ),
    ins AS (
      INSERT INTO grades (student_id, course_id, assessment_type, assessment_id, score, feedback, term)
      SELECT sub.student_id, ${assignment.course_id}::uuid, 'assignment', sub.assignment_id,
             ${percent}::numeric, sub.feedback, ${schoolYearTerm()}::text
      FROM sub
      WHERE NOT EXISTS (
        SELECT 1 FROM grades g
        WHERE g.student_id = sub.student_id
          AND g.assessment_type = 'assignment'
          AND g.assessment_id = sub.assignment_id
      )
      RETURNING id
    )
    SELECT id, assignment_id, student_id, file_url, submitted_at,
           grade::float8 AS grade, feedback, graded_at
    FROM sub
  `;

  // Let the student know. Best effort: a notification problem must never undo or block a grade.
  try {
    await sql`
      INSERT INTO notifications (user_id, type, title, message, link)
      VALUES (${existing.student_user_id}, 'grade', 'Assignment graded',
              ${`${assignment.title}: ${input.score}/${assignment.max_score}`},
              ${`/assignments/${assignment.id}`})
    `;
  } catch (err) {
    console.error('[grading] could not create notification:', err);
  }

  res.json({ submission });
}
