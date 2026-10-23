import { Request, Response } from 'express';
import { sql } from '../config/db.js';
import type { AppError } from '../middleware/errorHandler.js';

export async function listNotifications(req: Request, res: Response): Promise<void> {
  const userId = (req.user as { id: string })?.id;

  const notifications = await sql`
    SELECT id, user_id, type, title, message, link, is_read, created_at
    FROM notifications
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 50
  `;
  res.json({ notifications });
}

export async function markNotificationRead(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const userId = (req.user as { id: string })?.id;

  const [notification] = await sql`
    UPDATE notifications
    SET is_read = TRUE
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING id, is_read
  `;
  if (!notification) {
    const err = new Error('Notification not found') as AppError;
    err.statusCode = 404;
    throw err;
  }
  res.json({ notification });
}

export async function createNotification(req: Request, res: Response): Promise<void> {
  const { user_id, type, title, message, link } = req.body as {
    user_id: string;
    type: string;
    title: string;
    message: string;
    link?: string;
  };

  const [notification] = await sql`
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (${user_id}, ${type}, ${title}, ${message}, ${link})
    RETURNING id, user_id, type, title, message, link, is_read, created_at
  `;
  res.status(201).json({ notification });
}
