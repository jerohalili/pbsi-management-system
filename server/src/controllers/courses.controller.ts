import { Request, Response } from 'express';
import { sql } from '../config/db.js';
import { courseSchema } from '../utils/validation.js';
import {
  assertCanManageCourse,
  getOwnTeacherId,
  httpError,
  parseUuid,
  rethrowDbError,
} from '../utils/access.js';
import type { AuthUser } from '../types/index.js';

function currentUser(req: Request): AuthUser {
  if (!req.user) throw httpError(401, 'Not authenticated');
  return req.user;
}

async function fetchCourse(id: string, userId: string) {
  const [course] = await sql`
    SELECT c.id, c.code, c.name, c.description, c.credits, c.created_at,
           t.id AS teacher_id,
           p.first_name AS teacher_first_name,
           p.last_name AS teacher_last_name,
           (t.user_id = ${userId}) AS is_mine
    FROM courses c
    JOIN teachers t ON t.id = c.teacher_id
    JOIN users u ON u.id = t.user_id
    JOIN profiles p ON p.user_id = u.id
    WHERE c.id = ${id}
  `;
  return course;
}

export async function listCourses(req: Request, res: Response): Promise<void> {
  const user = currentUser(req);

  const courses = await sql`
    SELECT c.id, c.code, c.name, c.description, c.credits, c.created_at,
           t.id AS teacher_id,
           p.first_name AS teacher_first_name,
           p.last_name AS teacher_last_name,
           (t.user_id = ${user.id}) AS is_mine
    FROM courses c
    JOIN teachers t ON t.id = c.teacher_id
    JOIN users u ON u.id = t.user_id
    JOIN profiles p ON p.user_id = u.id
    ORDER BY c.code ASC
  `;
  res.json({ courses });
}

export async function getCourse(req: Request, res: Response): Promise<void> {
  const user = currentUser(req);
  const id = parseUuid(req.params.id, 'course id');

  const course = await fetchCourse(id, user.id);
  if (!course) throw httpError(404, 'Course not found');

  const modules = await sql`
    SELECT m.id, m.course_id, m.title, m.rich_description, m.video_url,
           m.attachment_url, m.order_index, m.created_at
    FROM modules m
    WHERE m.course_id = ${id}
    ORDER BY m.order_index ASC, m.created_at ASC
  `;

  res.json({ course, modules });
}

export async function createCourse(req: Request, res: Response): Promise<void> {
  const user = currentUser(req);
  // The validation middleware does not replace req.body, so parse again to apply defaults.
  const input = courseSchema.parse(req.body);

  let teacherId: string | undefined = input.teacher_id;
  if (user.role === 'teacher') {
    const own = await getOwnTeacherId(user.id);
    if (!own) throw httpError(404, 'Teacher profile not found');
    teacherId = own;
  }
  if (!teacherId) throw httpError(400, 'Please choose the teacher for this course');

  const [teacher] = await sql`SELECT id FROM teachers WHERE id = ${teacherId}`;
  if (!teacher) throw httpError(404, 'Teacher not found');

  try {
    const [created] = await sql`
      INSERT INTO courses (code, name, description, credits, teacher_id)
      VALUES (${input.code}, ${input.name}, ${input.description || null}, ${input.credits}, ${teacherId})
      RETURNING id
    `;
    res.status(201).json({ course: await fetchCourse(created.id as string, user.id) });
  } catch (err) {
    rethrowDbError(err, { unique: 'A course with this code already exists' });
  }
}

export async function updateCourse(req: Request, res: Response): Promise<void> {
  const user = currentUser(req);
  const id = parseUuid(req.params.id, 'course id');
  const input = courseSchema.partial().parse(req.body);

  await assertCanManageCourse(user, id);

  if (input.teacher_id !== undefined) {
    if (user.role !== 'admin') throw httpError(403, 'Only an administrator can change a course’s teacher');
    const [teacher] = await sql`SELECT id FROM teachers WHERE id = ${input.teacher_id}`;
    if (!teacher) throw httpError(404, 'Teacher not found');
  }

  const descriptionProvided = input.description !== undefined;

  try {
    await sql`
      UPDATE courses
      SET code = COALESCE(${input.code ?? null}, code),
          name = COALESCE(${input.name ?? null}, name),
          description = CASE WHEN ${descriptionProvided}::boolean THEN ${input.description || null} ELSE description END,
          credits = COALESCE(${input.credits ?? null}, credits),
          teacher_id = COALESCE(${input.teacher_id ?? null}, teacher_id)
      WHERE id = ${id}
    `;
  } catch (err) {
    rethrowDbError(err, { unique: 'A course with this code already exists' });
  }

  res.json({ course: await fetchCourse(id, user.id) });
}

export async function deleteCourse(req: Request, res: Response): Promise<void> {
  const id = parseUuid(req.params.id, 'course id');

  // The database cascades deletes from a course to everything under it (modules, assignments,
  // submissions, quizzes, attempts, grades), so refuse unless the course is empty.
  const [usage] = await sql`
    SELECT
      (SELECT COUNT(*) FROM modules WHERE course_id = ${id})::int AS modules,
      (SELECT COUNT(*) FROM quizzes WHERE course_id = ${id})::int AS quizzes,
      (SELECT COUNT(*) FROM grades WHERE course_id = ${id})::int AS grades,
      (SELECT COUNT(*) FROM attendance WHERE course_id = ${id})::int AS attendance,
      (SELECT COUNT(*) FROM timetable WHERE course_id = ${id})::int AS timetable
  `;
  const labels: [string, string, string][] = [
    ['modules', 'module', 'modules'],
    ['quizzes', 'quiz', 'quizzes'],
    ['grades', 'grade', 'grades'],
    ['attendance', 'attendance record', 'attendance records'],
    ['timetable', 'timetable entry', 'timetable entries'],
  ];
  const attached = labels
    .filter(([key]) => (usage?.[key] as number) > 0)
    .map(([key, one, many]) => `${usage?.[key]} ${(usage?.[key] as number) === 1 ? one : many}`);
  if (attached.length > 0) {
    throw httpError(
      409,
      `This course still has ${attached.join(', ')}, so it can’t be deleted. Remove that content first.`,
    );
  }

  const [course] = await sql`DELETE FROM courses WHERE id = ${id} RETURNING id`;
  if (!course) throw httpError(404, 'Course not found');
  res.json({ message: 'Course deleted' });
}
