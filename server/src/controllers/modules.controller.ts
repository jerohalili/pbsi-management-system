import { Request, Response } from 'express';
import { sql } from '../config/db.js';
import type { AppError } from '../middleware/errorHandler.js';

export async function listModules(req: Request, res: Response): Promise<void> {
  const { course_id } = req.params as { course_id: string };

  const modules = await sql`
    SELECT m.id, m.course_id, m.title, m.rich_description, m.video_url,
           m.attachment_url, m.order_index, m.created_at
    FROM modules m
    WHERE m.course_id = ${course_id}
    ORDER BY m.order_index ASC
  `;
  res.json({ modules });
}

export async function getModule(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const [module] = await sql`
    SELECT m.id, m.course_id, m.title, m.rich_description, m.video_url,
           m.attachment_url, m.order_index, m.created_at
    FROM modules m
    WHERE m.id = ${id}
  `;
  if (!module) {
    const err = new Error('Module not found') as AppError;
    err.statusCode = 404;
    throw err;
  }
  res.json({ module });
}

export async function createModule(req: Request, res: Response): Promise<void> {
  const { course_id, title, rich_description, video_url, attachment_url, order_index } =
    req.body as {
      course_id: string;
      title: string;
      rich_description?: string;
      video_url?: string;
      attachment_url?: string;
      order_index?: number;
    };

  const [module] = await sql`
    INSERT INTO modules (course_id, title, rich_description, video_url, attachment_url, order_index)
    VALUES (${course_id}, ${title}, ${rich_description}, ${video_url}, ${attachment_url}, ${order_index})
    RETURNING id, course_id, title, rich_description, video_url, attachment_url, order_index, created_at
  `;
  res.status(201).json({ module });
}

export async function updateModule(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const { title, rich_description, video_url, attachment_url, order_index } =
    req.body as {
      title?: string;
      rich_description?: string;
      video_url?: string;
      attachment_url?: string;
      order_index?: number;
    };

  const [module] = await sql`
    UPDATE modules
    SET title = COALESCE(${title}, title),
        rich_description = COALESCE(${rich_description}, rich_description),
        video_url = COALESCE(${video_url}, video_url),
        attachment_url = COALESCE(${attachment_url}, attachment_url),
        order_index = COALESCE(${order_index}, order_index)
    WHERE id = ${id}
    RETURNING id, course_id, title, rich_description, video_url, attachment_url, order_index
  `;
  if (!module) {
    const err = new Error('Module not found') as AppError;
    err.statusCode = 404;
    throw err;
  }
  res.json({ module });
}

export async function deleteModule(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const [module] = await sql`
    DELETE FROM modules WHERE id = ${id}
    RETURNING id
  `;
  if (!module) {
    const err = new Error('Module not found') as AppError;
    err.statusCode = 404;
    throw err;
  }
  res.json({ message: 'Module deleted' });
}
