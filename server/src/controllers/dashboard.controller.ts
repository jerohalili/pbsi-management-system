import { Request, Response } from 'express';
import { sql } from '../config/db.js';
import type { AppError } from '../middleware/errorHandler.js';

// "Today" is evaluated in the school's timezone, not the database's (UTC).
const SCHOOL_TIMEZONE = 'Asia/Manila';

// Same convention as attendance.controller.ts: excused records are left out of
// the denominator, and only "present" counts toward the numerator.

export async function getDashboardStats(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) {
    const err = new Error('Not authenticated') as AppError;
    err.statusCode = 401;
    throw err;
  }

  const recentActivityQuery = sql`
    SELECT id, type, title, message, link, is_read, created_at
    FROM notifications
    WHERE user_id = ${user.id}
    ORDER BY created_at DESC
    LIMIT 5
  `;

  let statsQuery;

  if (user.role === 'admin') {
    statsQuery = sql`
      SELECT
        (SELECT COUNT(*) FROM students)::int AS students,
        (SELECT COUNT(*) FROM courses)::int AS courses,
        (SELECT ROUND(
                  100.0 * COUNT(*) FILTER (WHERE status = 'present') /
                  NULLIF(COUNT(*) FILTER (WHERE status IN ('present','absent','late')), 0),
                  1
                )::float8
         FROM attendance
         WHERE date::date = (NOW() AT TIME ZONE ${SCHOOL_TIMEZONE}::text)::date
        ) AS attendance_today,
        (SELECT COUNT(*) FROM submissions WHERE grade IS NULL)::int AS ungraded_submissions
    `;
  } else if (user.role === 'teacher') {
    statsQuery = sql`
      WITH t AS (SELECT id FROM teachers WHERE user_id = ${user.id} LIMIT 1),
      my_courses AS (SELECT id FROM courses WHERE teacher_id = (SELECT id FROM t))
      SELECT
        (SELECT COUNT(*) FROM my_courses)::int AS my_courses,
        (SELECT COUNT(*) FROM students)::int AS students,
        (SELECT ROUND(
                  100.0 * COUNT(*) FILTER (WHERE status = 'present') /
                  NULLIF(COUNT(*) FILTER (WHERE status IN ('present','absent','late')), 0),
                  1
                )::float8
         FROM attendance
         WHERE course_id IN (SELECT id FROM my_courses)
           AND date::date = (NOW() AT TIME ZONE ${SCHOOL_TIMEZONE}::text)::date
        ) AS attendance_today,
        (SELECT COUNT(*)
         FROM submissions s
         JOIN assignments a ON a.id = s.assignment_id
         JOIN modules m ON m.id = a.module_id
         WHERE s.grade IS NULL AND m.course_id IN (SELECT id FROM my_courses)
        )::int AS ungraded_submissions
    `;
  } else {
    statsQuery = sql`
      WITH st AS (SELECT id, cumulative_gpa FROM students WHERE user_id = ${user.id} LIMIT 1)
      SELECT
        (SELECT cumulative_gpa::float8 FROM st) AS gpa,
        (SELECT ROUND(
                  100.0 * COUNT(*) FILTER (WHERE status = 'present') /
                  NULLIF(COUNT(*) FILTER (WHERE status IN ('present','absent','late')), 0),
                  1
                )::float8
         FROM attendance
         WHERE student_id = (SELECT id FROM st)
        ) AS attendance_overall,
        (SELECT COUNT(*) FROM grades WHERE student_id = (SELECT id FROM st))::int AS graded_items,
        (SELECT COUNT(*) FROM notifications
         WHERE user_id = ${user.id} AND is_read = FALSE
        )::int AS unread_notifications
    `;
  }

  const [statsRows, recentActivity] = await Promise.all([statsQuery, recentActivityQuery]);

  res.json({
    role: user.role,
    stats: statsRows[0] ?? {},
    recent_activity: recentActivity,
  });
}
