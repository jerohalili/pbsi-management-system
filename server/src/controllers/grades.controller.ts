import { Request, Response } from 'express';
import { sql } from '../config/db.js';

export async function listGrades(_req: Request, res: Response): Promise<void> {
  const { student_id, course_id, term } = _req.query as {
    student_id?: string;
    course_id?: string;
    term?: string;
  };

  const studentParam = student_id ?? '';
  const courseParam = course_id ?? '';
  const termParam = term ?? '';

  const grades = await sql`
    SELECT g.id, g.student_id, g.course_id, g.assessment_type, g.assessment_id,
           g.score, g.feedback, g.term, g.created_at,
           c.code as course_code, c.name as course_name,
           p.first_name, p.last_name
    FROM grades g
    JOIN courses c ON c.id = g.course_id
    JOIN students s ON s.id = g.student_id
    JOIN profiles p ON p.user_id = s.user_id
    WHERE (${studentParam} = '' OR g.student_id = ${studentParam})
      AND (${courseParam} = '' OR g.course_id = ${courseParam})
      AND (${termParam} = '' OR g.term = ${termParam})
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
  const { student_id } = _req.params as { student_id: string };

  const [result] = await sql`
    SELECT
      ROUND(AVG(g.score)::numeric, 2) AS cumulative_gpa,
      COUNT(*) AS total_assessments
    FROM grades g
    WHERE g.student_id = ${student_id}
  `;
  res.json({ gpa: result });
}
