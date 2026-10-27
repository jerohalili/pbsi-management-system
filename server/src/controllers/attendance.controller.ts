import { Request, Response } from 'express';
import { sql } from '../config/db.js';
import { getOwnStudentId, httpError, optionalDate, optionalUuid, parseUuid } from '../utils/access.js';
import type { AuthUser } from '../types/index.js';

export async function listAttendance(_req: Request, res: Response): Promise<void> {
  const { course_id, date, student_id } = _req.query as {
    course_id?: string;
    date?: string;
    student_id?: string;
  };
  const user = _req.user as AuthUser;

  const courseParam = optionalUuid(course_id, 'course id');
  const dateParam = optionalDate(date, 'date');
  let studentParam = optionalUuid(student_id, 'student id');

  // Students only ever see their own attendance.
  if (user.role === 'student') {
    const ownId = await getOwnStudentId(user.id);
    if (!ownId) {
      res.json({ attendance: [] });
      return;
    }
    if (studentParam && studentParam !== ownId) {
      throw httpError(403, 'Forbidden: you can only view your own attendance');
    }
    studentParam = ownId;
  }

  const records = await sql`
    SELECT a.id, a.student_id, a.course_id, a.date, a.status, a.marked_by, a.marked_at,
           p.first_name, p.last_name
    FROM attendance a
    JOIN students st ON st.id = a.student_id
    JOIN profiles p ON p.user_id = st.user_id
    WHERE (${courseParam}::text = '' OR a.course_id = NULLIF(${courseParam}::text, '')::uuid)
      AND (${dateParam}::text = '' OR a.date = NULLIF(${dateParam}::text, '')::date)
      AND (${studentParam}::text = '' OR a.student_id = NULLIF(${studentParam}::text, '')::uuid)
    ORDER BY a.date DESC, p.last_name ASC
  `;
  res.json({ attendance: records });
}

export async function markAttendance(req: Request, res: Response): Promise<void> {
  const { student_id, course_id, date, status } = req.body as {
    student_id: string;
    course_id: string;
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused';
  };
  const markedBy = (req.user as { id: string })?.id;

  const [record] = await sql`
    INSERT INTO attendance (student_id, course_id, date, status, marked_by)
    VALUES (${student_id}, ${course_id}, ${date}, ${status}, ${markedBy})
    ON CONFLICT (student_id, course_id, date)
    DO UPDATE SET status = EXCLUDED.status,
                  marked_by = EXCLUDED.marked_by,
                  marked_at = NOW()
    RETURNING id, student_id, course_id, date, status, marked_at
  `;
  res.status(201).json({ record });
}

export async function getAttendanceSummary(_req: Request, res: Response): Promise<void> {
  const { student_id: rawId } = _req.params as { student_id: string };
  const user = _req.user as AuthUser;

  // "me" means the signed-in student; anyone else gets an empty summary for it.
  let studentId: string | null;
  if (rawId === 'me') {
    studentId = await getOwnStudentId(user.id);
  } else {
    studentId = parseUuid(rawId, 'student id');
    if (user.role === 'student' && studentId !== (await getOwnStudentId(user.id))) {
      throw httpError(403, 'Forbidden: you can only view your own attendance');
    }
  }

  const [summary] = await sql`
    SELECT
      (COUNT(*) FILTER (WHERE status = 'present'))::int AS present_count,
      (COUNT(*) FILTER (WHERE status = 'absent'))::int AS absent_count,
      (COUNT(*) FILTER (WHERE status = 'late'))::int AS late_count,
      (COUNT(*) FILTER (WHERE status = 'excused'))::int AS excused_count,
      COUNT(*)::int AS total_count,
      ROUND(
        100.0 * COUNT(*) FILTER (WHERE status = 'present') /
        NULLIF(COUNT(*) FILTER (WHERE status IN ('present','absent','late')), 0),
        2
      )::float8 AS attendance_percentage
    FROM attendance
    WHERE student_id = ${studentId}
  `;
  res.json({ summary });
}
