import { Request, Response } from 'express';
import { sql } from '../config/db.js';
import {
  assertCanManageCourse,
  getOwnStudentId,
  getOwnTeacherId,
  httpError,
  optionalUuid,
  parseUuid,
} from '../utils/access.js';
import { recordAudit } from '../utils/audit.js';
import { overrideGradeSchema } from '../utils/validation.js';
import type { AuthUser } from '../types/index.js';

export async function listGrades(_req: Request, res: Response): Promise<void> {
  const { student_id, course_id, term } = _req.query as {
    student_id?: string;
    course_id?: string;
    term?: string;
  };

  const user = _req.user as AuthUser;
  let studentParam = optionalUuid(student_id, 'student id');
  const courseParam = optionalUuid(course_id, 'course id');
  const termParam = term ?? '';

  // Students only ever see their own grades.
  if (user.role === 'student') {
    const ownId = await getOwnStudentId(user.id);
    if (!ownId) {
      res.json({ grades: [] });
      return;
    }
    if (studentParam && studentParam !== ownId) {
      throw httpError(403, 'Forbidden: you can only view your own grades');
    }
    studentParam = ownId;
  }

  // Teachers only see grades for the courses they teach (admins see everything).
  let teacherParam = '';
  if (user.role === 'teacher') {
    const ownTeacherId = await getOwnTeacherId(user.id);
    if (!ownTeacherId) {
      res.json({ grades: [] });
      return;
    }
    teacherParam = ownTeacherId;
  }

  const grades = await sql`
    SELECT g.id, g.student_id, g.course_id, g.assessment_type, g.assessment_id,
           g.score, g.feedback, g.term, g.created_at,
           c.code as course_code, c.name as course_name,
           COALESCE(q.title, a.title) AS assessment_title,
           s.student_id AS student_number, p.first_name, p.last_name
    FROM grades g
    JOIN courses c ON c.id = g.course_id
    LEFT JOIN quizzes q ON g.assessment_type = 'quiz' AND q.id = g.assessment_id
    LEFT JOIN assignments a ON g.assessment_type = 'assignment' AND a.id = g.assessment_id
    JOIN students s ON s.id = g.student_id
    JOIN profiles p ON p.user_id = s.user_id
    WHERE (${studentParam}::text = '' OR g.student_id = NULLIF(${studentParam}::text, '')::uuid)
      AND (${courseParam}::text = '' OR g.course_id = NULLIF(${courseParam}::text, '')::uuid)
      AND (${termParam}::text = '' OR g.term = ${termParam}::text)
      AND (${teacherParam}::text = '' OR c.teacher_id = NULLIF(${teacherParam}::text, '')::uuid)
    ORDER BY g.created_at DESC
  `;
  res.json({ grades });
}

export async function getStudentGPA(_req: Request, res: Response): Promise<void> {
  const { student_id: rawId } = _req.params as { student_id: string };
  const user = _req.user as AuthUser;

  // "me" means the signed-in student; anyone else has no grades of their own.
  let studentId: string | null;
  if (rawId === 'me') {
    studentId = await getOwnStudentId(user.id);
  } else {
    studentId = parseUuid(rawId, 'student id');
    if (user.role === 'student' && studentId !== (await getOwnStudentId(user.id))) {
      throw httpError(403, 'Forbidden: you can only view your own grades');
    }
  }
  if (!studentId) {
    res.json({ gpa: { cumulative_gpa: null, total_assessments: 0 } });
    return;
  }

  const [result] = await sql`
    SELECT
      ROUND(AVG(g.score)::numeric, 2)::float8 AS cumulative_gpa,
      COUNT(*)::int AS total_assessments
    FROM grades g
    WHERE g.student_id = ${studentId}
  `;
  res.json({ gpa: result });
}

/**
 * PATCH /api/grades/:id: a teacher (for their own courses) or an admin adjusts a recorded grade.
 * Only the grades row changes; the original submission or quiz attempt is left as it was, and a
 * later re-grade of the same assignment replaces the adjustment.
 */
export async function overrideGrade(req: Request, res: Response): Promise<void> {
  const user = req.user as AuthUser;
  const id = parseUuid(req.params.id, 'grade id');
  const input = overrideGradeSchema.parse(req.body);

  const [grade] = await sql`
    SELECT g.id, g.course_id, g.score, g.feedback, g.assessment_type, g.assessment_id,
           s.user_id AS student_user_id,
           COALESCE(q.title, a.title) AS assessment_title
    FROM grades g
    JOIN students s ON s.id = g.student_id
    LEFT JOIN quizzes q ON g.assessment_type = 'quiz' AND q.id = g.assessment_id
    LEFT JOIN assignments a ON g.assessment_type = 'assignment' AND a.id = g.assessment_id
    WHERE g.id = ${id}
  `;
  if (!grade) throw httpError(404, 'Grade not found');
  await assertCanManageCourse(user, grade.course_id as string);

  const score = Math.round(input.score * 100) / 100;
  const feedbackProvided = input.feedback !== undefined;

  const [updated] = await sql`
    UPDATE grades
    SET score = ${score}::numeric,
        feedback = CASE WHEN ${feedbackProvided}::boolean THEN ${input.feedback || null} ELSE feedback END
    WHERE id = ${id}
    RETURNING id, score::float8 AS score, feedback
  `;

  await recordAudit(
    req,
    'grade.override',
    'grade',
    id,
    { score: Number(grade.score), feedback: grade.feedback },
    { score: updated.score, feedback: updated.feedback },
  );

  // Let the student know. Best effort: a notification problem must never undo the change.
  try {
    await sql`
      INSERT INTO notifications (user_id, type, title, message, link)
      VALUES (${grade.student_user_id}, 'grade', 'Grade adjusted',
              ${`${grade.assessment_title ?? 'Your grade'}: now ${score}%`}, '/grades')
    `;
  } catch (err) {
    console.error('[grades] could not create notification:', err);
  }

  res.json({ grade: updated });
}
