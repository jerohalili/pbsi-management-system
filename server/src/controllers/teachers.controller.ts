import { Request, Response } from 'express';
import { sql } from '../config/db.js';

/** Active teachers, with the teachers.id that courses reference. Used by admins to assign a course. */
export async function listTeachers(_req: Request, res: Response): Promise<void> {
  const teachers = await sql`
    SELECT t.id, t.user_id, t.employee_id, u.email, p.first_name, p.last_name
    FROM teachers t
    JOIN users u ON u.id = t.user_id
    LEFT JOIN profiles p ON p.user_id = u.id
    WHERE u.is_active = TRUE
    ORDER BY p.last_name ASC, p.first_name ASC
  `;
  res.json({ teachers });
}
