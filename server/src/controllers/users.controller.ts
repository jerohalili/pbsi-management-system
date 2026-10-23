import { Request, Response } from 'express';
import { sql } from '../config/db.js';
import type { AppError } from '../middleware/errorHandler.js';
import { UserRole } from '../types/index.js';

export async function listUsers(_req: Request, res: Response): Promise<void> {
  const users = await sql`
    SELECT u.id, u.email, u.role, u.is_active, u.created_at,
           p.first_name, p.last_name, p.avatar_url
    FROM users u
    LEFT JOIN profiles p ON p.user_id = u.id
    ORDER BY u.created_at DESC
  `;
  res.json({ users });
}

export async function getUser(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const [user] = await sql`
    SELECT u.id, u.email, u.role, u.is_active, u.created_at,
           p.first_name, p.last_name, p.phone, p.date_of_birth,
           p.gender, p.address, p.avatar_url
    FROM users u
    LEFT JOIN profiles p ON p.user_id = u.id
    WHERE u.id = ${id}
  `;
  if (!user) {
    const err = new Error('User not found') as AppError;
    err.statusCode = 404;
    throw err;
  }
  res.json({ user });
}

export async function updateUserRole(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const { role } = req.body as { role: UserRole };

  const [user] = await sql`
    UPDATE users SET role = ${role} WHERE id = ${id}
    RETURNING id, email, role
  `;
  if (!user) {
    const err = new Error('User not found') as AppError;
    err.statusCode = 404;
    throw err;
  }
  res.json({ user });
}

export async function deactivateUser(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const [user] = await sql`
    UPDATE users SET is_active = FALSE WHERE id = ${id}
    RETURNING id, email, is_active
  `;
  if (!user) {
    const err = new Error('User not found') as AppError;
    err.statusCode = 404;
    throw err;
  }
  res.json({ user });
}
