import { Request, Response } from 'express';
import { sql } from '../config/db.js';
import type { AppError } from '../middleware/errorHandler.js';

export async function listQuizzes(req: Request, res: Response): Promise<void> {
  const { course_id } = req.params as { course_id: string };

  const quizzes = await sql`
    SELECT q.id, q.course_id, q.title, q.time_limit_minutes, q.is_published, q.created_at
    FROM quizzes q
    WHERE q.course_id = ${course_id}
    ORDER BY q.created_at DESC
  `;
  res.json({ quizzes });
}

export async function getQuiz(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const [quiz] = await sql`
    SELECT q.id, q.course_id, q.title, q.time_limit_minutes, q.is_published, q.created_at
    FROM quizzes q
    WHERE q.id = ${id}
  `;
  if (!quiz) {
    const err = new Error('Quiz not found') as AppError;
    err.statusCode = 404;
    throw err;
  }

  const questions = await sql`
    SELECT id, quiz_id, question_text, type, options, correct_answer, points
    FROM quiz_questions
    WHERE quiz_id = ${id}
    ORDER BY id ASC
  `;

  res.json({ quiz: { ...quiz, questions } });
}

export async function createQuiz(req: Request, res: Response): Promise<void> {
  const { course_id, title, time_limit_minutes, is_published } = req.body as {
    course_id: string;
    title: string;
    time_limit_minutes?: number;
    is_published?: boolean;
  };

  const [quiz] = await sql`
    INSERT INTO quizzes (course_id, title, time_limit_minutes, is_published)
    VALUES (${course_id}, ${title}, ${time_limit_minutes}, ${is_published})
    RETURNING id, course_id, title, time_limit_minutes, is_published, created_at
  `;
  res.status(201).json({ quiz });
}

export async function updateQuiz(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const { title, time_limit_minutes, is_published } = req.body as {
    title?: string;
    time_limit_minutes?: number;
    is_published?: boolean;
  };

  const [quiz] = await sql`
    UPDATE quizzes
    SET title = COALESCE(${title}, title),
        time_limit_minutes = COALESCE(${time_limit_minutes}, time_limit_minutes),
        is_published = COALESCE(${is_published}, is_published)
    WHERE id = ${id}
    RETURNING id, course_id, title, time_limit_minutes, is_published
  `;
  if (!quiz) {
    const err = new Error('Quiz not found') as AppError;
    err.statusCode = 404;
    throw err;
  }
  res.json({ quiz });
}

export async function deleteQuiz(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const [quiz] = await sql`
    DELETE FROM quizzes WHERE id = ${id}
    RETURNING id
  `;
  if (!quiz) {
    const err = new Error('Quiz not found') as AppError;
    err.statusCode = 404;
    throw err;
  }
  res.json({ message: 'Quiz deleted' });
}
