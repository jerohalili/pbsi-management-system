import { Request, Response } from 'express';
import { sql } from '../config/db.js';
import type { AppError } from '../middleware/errorHandler.js';

export async function listCourses(_req: Request, res: Response): Promise<void> {
  const courses = await sql`
    SELECT c.id, c.code, c.name, c.description, c.credits, c.created_at,
           t.id as teacher_id,
           p.first_name as teacher_first_name,
           p.last_name as teacher_last_name
    FROM courses c
    JOIN teachers t ON t.id = c.teacher_id
    JOIN users u ON u.id = t.user_id
    JOIN profiles p ON p.user_id = u.id
    ORDER BY c.code ASC
  `;
  res.json({ courses });
}

export async function getCourse(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const [course] = await sql`
    SELECT c.id, c.code, c.name, c.description, c.credits, c.created_at,
           t.id as teacher_id,
           p.first_name as teacher_first_name,
           p.last_name as teacher_last_name
    FROM courses c
    JOIN teachers t ON t.id = c.teacher_id
    JOIN users u ON u.id = t.user_id
    JOIN profiles p ON p.user_id = u.id
    WHERE c.id = ${id}
  `;
  if (!course) {
    const err = new Error('Course not found') as AppError;
    err.statusCode = 404;
    throw err;
  }
  res.json({ course });
}

export async function createCourse(req: Request, res: Response): Promise<void> {
  const { code, name, description, credits, teacher_id } = req.body as {
    code: string;
    name: string;
    description?: string;
    credits: number;
    teacher_id?: string;
  };
  const user = req.user as { id: string; role: string };

  let resolvedTeacherId = teacher_id;

  if (user.role === 'teacher') {
    const [teacher] = await sql`
      SELECT id FROM teachers WHERE user_id = ${user.id} LIMIT 1
    `;
    if (!teacher) {
      const err = new Error('Teacher profile not found') as AppError;
      err.statusCode = 404;
      throw err;
    }
    resolvedTeacherId = teacher.id;
  }

  if (!resolvedTeacherId) {
    const err = new Error('teacher_id is required') as AppError;
    err.statusCode = 400;
    throw err;
  }

  const [course] = await sql`
    INSERT INTO courses (code, name, description, credits, teacher_id)
    VALUES (${code}, ${name}, ${description}, ${credits}, ${resolvedTeacherId})
    RETURNING id, code, name, description, credits, teacher_id, created_at
  `;
  res.status(201).json({ course });
}

export async function updateCourse(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const { code, name, description, credits } = req.body as {
    code?: string;
    name?: string;
    description?: string;
    credits?: number;
  };

  const [course] = await sql`
    UPDATE courses
    SET code = COALESCE(${code}, code),
        name = COALESCE(${name}, name),
        description = COALESCE(${description}, description),
        credits = COALESCE(${credits}, credits)
    WHERE id = ${id}
    RETURNING id, code, name, description, credits
  `;
  if (!course) {
    const err = new Error('Course not found') as AppError;
    err.statusCode = 404;
    throw err;
  }
  res.json({ course });
}

export async function deleteCourse(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const [course] = await sql`
    DELETE FROM courses WHERE id = ${id}
    RETURNING id
  `;
  if (!course) {
    const err = new Error('Course not found') as AppError;
    err.statusCode = 404;
    throw err;
  }
  res.json({ message: 'Course deleted' });
}
