import { Request, Response } from 'express';
import { sql } from '../config/db.js';
import type { AppError } from '../middleware/errorHandler.js';

export async function listSubmissions(req: Request, res: Response): Promise<void> {
  const { assignment_id } = req.params as { assignment_id: string };

  const submissions = await sql`
    SELECT s.id, s.assignment_id, s.student_id, s.file_url,
           s.submitted_at, s.grade, s.feedback, s.graded_by, s.graded_at,
           p.first_name, p.last_name
    FROM submissions s
    JOIN students st ON st.id = s.student_id
    JOIN profiles p ON p.user_id = st.user_id
    WHERE s.assignment_id = ${assignment_id}
    ORDER BY s.submitted_at DESC
  `;
  res.json({ submissions });
}

export async function getSubmission(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const [submission] = await sql`
    SELECT s.id, s.assignment_id, s.student_id, s.file_url,
           s.submitted_at, s.grade, s.feedback, s.graded_by, s.graded_at
    FROM submissions s
    WHERE s.id = ${id}
  `;
  if (!submission) {
    const err = new Error('Submission not found') as AppError;
    err.statusCode = 404;
    throw err;
  }
  res.json({ submission });
}

export async function createSubmission(req: Request, res: Response): Promise<void> {
  const { assignment_id, file_url } = req.body as {
    assignment_id: string;
    file_url: string;
  };
  const studentId = (req.user as { id: string })?.id;

  const [student] = await sql`
    SELECT id FROM students WHERE user_id = ${studentId} LIMIT 1
  `;
  if (!student) {
    const err = new Error('Student profile not found') as AppError;
    err.statusCode = 404;
    throw err;
  }

  const [submission] = await sql`
    INSERT INTO submissions (assignment_id, student_id, file_url)
    VALUES (${assignment_id}, ${student.id}, ${file_url})
    ON CONFLICT (assignment_id, student_id)
    DO UPDATE SET file_url = EXCLUDED.file_url,
                  submitted_at = NOW(),
                  grade = NULL,
                  feedback = NULL,
                  graded_by = NULL,
                  graded_at = NULL
    RETURNING id, assignment_id, student_id, file_url, submitted_at
  `;
  res.status(201).json({ submission });
}

export async function gradeSubmission(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const { grade, feedback } = req.body as { grade: number; feedback?: string };
  const gradedBy = (req.user as { id: string })?.id;

  const [submission] = await sql`
    UPDATE submissions
    SET grade = ${grade},
        feedback = COALESCE(${feedback}, feedback),
        graded_by = ${gradedBy},
        graded_at = NOW()
    WHERE id = ${id}
    RETURNING id, grade, feedback, graded_by, graded_at
  `;
  if (!submission) {
    const err = new Error('Submission not found') as AppError;
    err.statusCode = 404;
    throw err;
  }
  res.json({ submission });
}
