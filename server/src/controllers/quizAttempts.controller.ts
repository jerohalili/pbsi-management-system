import { Request, Response } from 'express';
import { sql } from '../config/db.js';
import type { AppError } from '../middleware/errorHandler.js';

export async function submitQuizAttempt(req: Request, res: Response): Promise<void> {
  const { quiz_id, answers } = req.body as {
    quiz_id: string;
    answers: Record<string, string>;
  };
  const studentId = (req.user as { id: string })?.id;

  const questions = await sql`
    SELECT id, correct_answer, points
    FROM quiz_questions
    WHERE quiz_id = ${quiz_id}
  `;

  if (questions.length === 0) {
    const err = new Error('Quiz has no questions') as AppError;
    err.statusCode = 400;
    throw err;
  }

  let totalPoints = 0;
  let earnedPoints = 0;

  for (const q of questions) {
    totalPoints += Number(q.points);
    const studentAnswer = answers[q.id];
    if (studentAnswer !== undefined && studentAnswer === q.correct_answer) {
      earnedPoints += Number(q.points);
    }
  }

  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

  const [attempt] = await sql`
    INSERT INTO quiz_attempts (quiz_id, student_id, score, answers)
    VALUES (${quiz_id}, ${studentId}, ${score}, ${JSON.stringify(answers)})
    RETURNING id, quiz_id, student_id, score, answers, submitted_at
  `;

  res.status(201).json({ attempt, score });
}

export async function listQuizAttempts(req: Request, res: Response): Promise<void> {
  const { quiz_id } = req.params as { quiz_id: string };
  const user = req.user as { id: string; role: string };

  const [student] = user.role === 'student'
    ? await sql`SELECT id FROM students WHERE user_id = ${user.id} LIMIT 1`
    : [null];

  const studentParam = (user.role === 'student' && student) ? student.id : '';
  const roleParam = user.role;

  const attempts = await sql`
    SELECT qa.id, qa.quiz_id, qa.student_id, qa.score, qa.answers, qa.submitted_at,
           p.first_name, p.last_name
    FROM quiz_attempts qa
    JOIN students s ON s.id = qa.student_id
    JOIN profiles p ON p.user_id = s.user_id
    WHERE qa.quiz_id = ${quiz_id}
      AND (${roleParam} <> 'student' OR qa.student_id = ${studentParam})
    ORDER BY qa.submitted_at DESC
  `;
  res.json({ attempts });
}
