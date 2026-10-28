import { Request, Response } from 'express';
import { sql } from '../config/db.js';
import type { AppError } from '../middleware/errorHandler.js';

export async function listStudents(_req: Request, res: Response): Promise<void> {
  const { search, subject } = _req.query as {
    search?: string;
    subject?: string;
  };

  const searchParam = search ?? '';
  const subjectParam = subject ?? '';

  const students = await sql`
    SELECT s.id, s.student_id, s.enrollment_date,
           (SELECT ROUND(AVG(g.score)::numeric, 2)::float8 FROM grades g WHERE g.student_id = s.id) AS average_grade,
           s.subjects_assigned,
           u.id as user_id, u.email, u.is_active,
           p.first_name, p.last_name, p.phone, p.date_of_birth,
           p.gender, p.address, p.avatar_url
    FROM students s
    JOIN users u ON u.id = s.user_id
    JOIN profiles p ON p.user_id = u.id
    WHERE (${searchParam} = ''
           OR p.first_name ILIKE ${`%${searchParam}%`}
           OR p.last_name ILIKE ${`%${searchParam}%`}
           OR s.student_id ILIKE ${`%${searchParam}%`})
      AND (${subjectParam} = '' OR ${subjectParam} = ANY(s.subjects_assigned))
    ORDER BY p.last_name ASC, p.first_name ASC
  `;
  res.json({ students });
}

export async function getStudent(_req: Request, res: Response): Promise<void> {
  const { id } = _req.params as { id: string };

  const [student] = await sql`
    SELECT s.id, s.student_id, s.enrollment_date,
           (SELECT ROUND(AVG(g.score)::numeric, 2)::float8 FROM grades g WHERE g.student_id = s.id) AS average_grade,
           s.subjects_assigned,
           u.id as user_id, u.email, u.is_active,
           p.first_name, p.last_name, p.phone, p.date_of_birth,
           p.gender, p.address, p.avatar_url
    FROM students s
    JOIN users u ON u.id = s.user_id
    JOIN profiles p ON p.user_id = u.id
    WHERE s.id = ${id}
  `;
  if (!student) {
    const err = new Error('Student not found') as AppError;
    err.statusCode = 404;
    throw err;
  }
  res.json({ student });
}

export async function exportStudents(_req: Request, res: Response): Promise<void> {
  const students = await sql`
    SELECT s.student_id, p.first_name, p.last_name, u.email,
           p.phone, p.date_of_birth, s.enrollment_date,
           (SELECT ROUND(AVG(g.score)::numeric, 2)::float8 FROM grades g WHERE g.student_id = s.id) AS average_grade, s.subjects_assigned
    FROM students s
    JOIN users u ON u.id = s.user_id
    JOIN profiles p ON p.user_id = u.id
    ORDER BY s.student_id
  `;

  const headers = [
    'student_id',
    'first_name',
    'last_name',
    'email',
    'phone',
    'date_of_birth',
    'enrollment_date',
    'average_grade',
    'subjects_assigned',
  ];

  const csv = [
    headers.join(','),
    ...students.map((row) =>
      headers
        .map((h) => {
          const v = row[h];
          return v == null ? '' : `"${String(v).replace(/"/g, '""')}"`;
        })
        .join(','),
    ),
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="students_export.csv"',
  );
  res.send(csv);
}
