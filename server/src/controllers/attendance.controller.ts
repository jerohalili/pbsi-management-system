import { Request, Response } from 'express';
import { sql } from '../config/db.js';

export async function listAttendance(_req: Request, res: Response): Promise<void> {
  const { course_id, date, student_id } = _req.query as {
    course_id?: string;
    date?: string;
    student_id?: string;
  };

  const courseParam = course_id ?? '';
  const dateParam = date ?? '';
  const studentParam = student_id ?? '';

  const records = await sql`
    SELECT a.id, a.student_id, a.course_id, a.date, a.status, a.marked_by, a.marked_at,
           p.first_name, p.last_name
    FROM attendance a
    JOIN students st ON st.id = a.student_id
    JOIN profiles p ON p.user_id = st.user_id
    WHERE (${courseParam} = '' OR a.course_id = ${courseParam})
      AND (${dateParam} = '' OR a.date = ${dateParam})
      AND (${studentParam} = '' OR a.student_id = ${studentParam})
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
  const { student_id } = _req.params as { student_id: string };

  const [summary] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE status = 'present') AS present_count,
      COUNT(*) FILTER (WHERE status = 'absent') AS absent_count,
      COUNT(*) FILTER (WHERE status = 'late') AS late_count,
      COUNT(*) FILTER (WHERE status = 'excused') AS excused_count,
      COUNT(*) AS total_count,
      ROUND(
        100.0 * COUNT(*) FILTER (WHERE status = 'present') /
        NULLIF(COUNT(*) FILTER (WHERE status IN ('present','absent','late')), 0),
        2
      ) AS attendance_percentage
    FROM attendance
    WHERE student_id = ${student_id}
  `;
  res.json({ summary });
}
