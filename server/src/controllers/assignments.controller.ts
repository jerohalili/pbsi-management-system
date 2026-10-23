import { Request, Response } from 'express';
import { sql } from '../config/db.js';
import type { AppError } from '../middleware/errorHandler.js';

export async function listAssignments(req: Request, res: Response): Promise<void> {
  const { module_id } = req.params as { module_id: string };

  const assignments = await sql`
    SELECT a.id, a.module_id, a.title, a.instructions, a.due_date,
           a.max_score, a.attachment_url, a.created_at
    FROM assignments a
    WHERE a.module_id = ${module_id}
    ORDER BY a.due_date ASC
  `;
  res.json({ assignments });
}

export async function getAssignment(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const [assignment] = await sql`
    SELECT a.id, a.module_id, a.title, a.instructions, a.due_date,
           a.max_score, a.attachment_url, a.created_at
    FROM assignments a
    WHERE a.id = ${id}
  `;
  if (!assignment) {
    const err = new Error('Assignment not found') as AppError;
    err.statusCode = 404;
    throw err;
  }
  res.json({ assignment });
}

export async function createAssignment(req: Request, res: Response): Promise<void> {
  const { module_id, title, instructions, due_date, max_score } = req.body as {
    module_id: string;
    title: string;
    instructions?: string;
    due_date: string;
    max_score: number;
  };

  const [assignment] = await sql`
    INSERT INTO assignments (module_id, title, instructions, due_date, max_score)
    VALUES (${module_id}, ${title}, ${instructions}, ${due_date}, ${max_score})
    RETURNING id, module_id, title, instructions, due_date, max_score, attachment_url, created_at
  `;
  res.status(201).json({ assignment });
}

export async function updateAssignment(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const { title, instructions, due_date, max_score } = req.body as {
    title?: string;
    instructions?: string;
    due_date?: string;
    max_score?: number;
  };

  const [assignment] = await sql`
    UPDATE assignments
    SET title = COALESCE(${title}, title),
        instructions = COALESCE(${instructions}, instructions),
        due_date = COALESCE(${due_date}, due_date),
        max_score = COALESCE(${max_score}, max_score)
    WHERE id = ${id}
    RETURNING id, module_id, title, instructions, due_date, max_score
  `;
  if (!assignment) {
    const err = new Error('Assignment not found') as AppError;
    err.statusCode = 404;
    throw err;
  }
  res.json({ assignment });
}

export async function deleteAssignment(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const [assignment] = await sql`
    DELETE FROM assignments WHERE id = ${id}
    RETURNING id
  `;
  if (!assignment) {
    const err = new Error('Assignment not found') as AppError;
    err.statusCode = 404;
    throw err;
  }
  res.json({ message: 'Assignment deleted' });
}
