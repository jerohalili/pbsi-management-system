import { Request, Response } from 'express';
import { sql } from '../config/db.js';
import { getOwnStudentId, httpError, optionalUuid, parseUuid } from '../utils/access.js';
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

  const grades = await sql`
    SELECT g.id, g.student_id, g.course_id, g.assessment_type, g.assessment_id,
           g.score, g.feedback, g.term, g.created_at,
           c.code as course_code, c.name as course_name,
           p.first_name, p.last_name
    FROM grades g
    JOIN courses c ON c.id = g.course_id
    JOIN students s ON s.id = g.student_id
    JOIN profiles p ON p.user_id = s.user_id
    WHERE (${studentParam}::text = '' OR g.student_id = NULLIF(${studentParam}::text, '')::uuid)
      AND (${courseParam}::text = '' OR g.course_id = NULLIF(${courseParam}::text, '')::uuid)
      AND (${termParam}::text = '' OR g.term = ${termParam}::text)
    ORDER BY g.created_at DESC
  `;
  res.json({ grades });
}

export async function createGrade(req: Request, res: Response): Promise<void> {
  const { student_id, course_id, assessment_type, assessment_id, score, feedback, term } =
    req.body as {
      student_id: string;
      course_id: string;
      assessment_type: string;
      assessment_id: string;
      score: number;
      feedback?: string;
      term: string;
    };

  const [grade] = await sql`
    INSERT INTO grades (student_id, course_id, assessment_type, assessment_id, score, feedback, term)
    VALUES (${student_id}, ${course_id}, ${assessment_type}, ${assessment_id}, ${score}, ${feedback}, ${term})
    RETURNING id, student_id, course_id, assessment_type, assessment_id, score, feedback, term, created_at
  `;
  res.status(201).json({ grade });
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
