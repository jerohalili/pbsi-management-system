import { Request, Response } from 'express';
import { sql } from '../config/db.js';
import type { AppError } from '../middleware/errorHandler.js';

export async function listTimetable(_req: Request, res: Response): Promise<void> {
  const { day_of_week, teacher_id, course_id } = _req.query as {
    day_of_week?: string;
    teacher_id?: string;
    course_id?: string;
  };

  const dayParam = day_of_week ?? '';
  const teacherParam = teacher_id ?? '';
  const courseParam = course_id ?? '';

  const entries = await sql`
    SELECT t.id, t.day_of_week, t.period_number, t.start_time, t.end_time,
           t.room, t.course_id, t.teacher_id,
           c.code as course_code, c.name as course_name,
           p.first_name as teacher_first_name, p.last_name as teacher_last_name
    FROM timetable t
    JOIN courses c ON c.id = t.course_id
    JOIN teachers te ON te.id = t.teacher_id
    JOIN users u ON u.id = te.user_id
    JOIN profiles p ON p.user_id = u.id
    WHERE (${dayParam} = '' OR t.day_of_week = ${dayParam}::int)
      AND (${teacherParam} = '' OR t.teacher_id = ${teacherParam})
      AND (${courseParam} = '' OR t.course_id = ${courseParam})
    ORDER BY t.day_of_week ASC, t.period_number ASC
  `;
  res.json({ timetable: entries });
}

export async function createTimetableEntry(req: Request, res: Response): Promise<void> {
  const { day_of_week, period_number, start_time, end_time, course_id, teacher_id, room } =
    req.body as {
      day_of_week: number;
      period_number: number;
      start_time: string;
      end_time: string;
      course_id: string;
      teacher_id: string;
      room: string;
    };

  const [entry] = await sql`
    INSERT INTO timetable (day_of_week, period_number, start_time, end_time, course_id, teacher_id, room)
    VALUES (${day_of_week}, ${period_number}, ${start_time}, ${end_time}, ${course_id}, ${teacher_id}, ${room})
    RETURNING id, day_of_week, period_number, start_time, end_time, course_id, teacher_id, room
  `;
  res.status(201).json({ entry });
}

export async function deleteTimetableEntry(_req: Request, res: Response): Promise<void> {
  const { id } = _req.params as { id: string };

  const [entry] = await sql`
    DELETE FROM timetable WHERE id = ${id}
    RETURNING id
  `;
  if (!entry) {
    const err = new Error('Timetable entry not found') as AppError;
    err.statusCode = 404;
    throw err;
  }
  res.json({ message: 'Timetable entry deleted' });
}
