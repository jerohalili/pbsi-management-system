import { Request, Response } from 'express';
import { sql } from '../config/db.js';
import {
  createAssignmentSchema,
  updateAssignmentSchema,
} from '../utils/validation.js';
import {
  assertCanManageAssignment,
  assertCanManageModule,
  assertHttpUrl,
  getOwnStudentId,
  httpError,
  optionalUuid,
  parseUuid,
  rethrowDbError,
} from '../utils/access.js';
import type { AuthUser } from '../types/index.js';

function currentUser(req: Request): AuthUser {
  if (!req.user) throw httpError(401, 'Not authenticated');
  return req.user;
}

interface AssignmentFilters {
  id?: string;
  courseId?: string;
  moduleId?: string;
}

/**
 * Assignments as seen by the signed-in person:
 *  - everyone gets the course/module context and `can_manage`
 *  - students also get their own submission and a `status`
 *  - teachers/admins also get submission counts
 */
async function queryAssignments(user: AuthUser, filters: AssignmentFilters) {
  const isStudent = user.role === 'student';
  const ownStudentId = isStudent ? await getOwnStudentId(user.id) : null;

  const rows = await sql`
    SELECT a.id, a.module_id, a.title, a.instructions, a.due_date,
           a.max_score::float8 AS max_score, a.attachment_url, a.created_at,
           m.title AS module_title,
           c.id AS course_id, c.code AS course_code, c.name AS course_name,
           (te.user_id = ${user.id}) AS is_mine,
           (SELECT COUNT(*) FROM submissions x WHERE x.assignment_id = a.id)::int AS submitted_count,
           (SELECT COUNT(*) FROM submissions x WHERE x.assignment_id = a.id AND x.grade IS NOT NULL)::int AS graded_count,
           sub.id AS submission_id, sub.file_url AS submission_url,
           sub.submitted_at, sub.grade::float8 AS grade, sub.feedback, sub.graded_at,
           (sub.id IS NOT NULL AND sub.submitted_at > a.due_date) AS is_late
    FROM assignments a
    JOIN modules m ON m.id = a.module_id
    JOIN courses c ON c.id = m.course_id
    JOIN teachers te ON te.id = c.teacher_id
    LEFT JOIN LATERAL (
      SELECT s.id, s.file_url, s.submitted_at, s.grade, s.feedback, s.graded_at
      FROM submissions s
      WHERE s.assignment_id = a.id AND s.student_id = ${ownStudentId}::uuid
      ORDER BY s.submitted_at DESC
      LIMIT 1
    ) sub ON TRUE
    WHERE (${filters.id ?? ''}::text = '' OR a.id = NULLIF(${filters.id ?? ''}::text, '')::uuid)
      AND (${filters.courseId ?? ''}::text = '' OR c.id = NULLIF(${filters.courseId ?? ''}::text, '')::uuid)
      AND (${filters.moduleId ?? ''}::text = '' OR a.module_id = NULLIF(${filters.moduleId ?? ''}::text, '')::uuid)
    ORDER BY a.due_date ASC, a.created_at ASC
  `;

  return rows.map((row) => {
    const canManage = user.role === 'admin' || (user.role === 'teacher' && row.is_mine === true);
    const base = { ...row, can_manage: canManage };
    if (!isStudent) {
      return { ...base, status: null };
    }
    // Students never see how the rest of the class is doing.
    let status: string;
    if (row.submission_id === null) {
      status = new Date(row.due_date as string).getTime() < Date.now() ? 'overdue' : 'not_submitted';
    } else if (row.grade !== null) {
      status = 'graded';
    } else {
      status = 'submitted';
    }
    return { ...base, status, submitted_count: null, graded_count: null };
  });
}

export async function listAssignments(req: Request, res: Response): Promise<void> {
  const user = currentUser(req);
  const query = req.query as { course_id?: string; module_id?: string };

  const assignments = await queryAssignments(user, {
    courseId: optionalUuid(query.course_id, 'course id') || undefined,
    moduleId: optionalUuid(query.module_id, 'module id') || undefined,
  });
  res.json({ assignments });
}

export async function getAssignment(req: Request, res: Response): Promise<void> {
  const user = currentUser(req);
  const id = parseUuid(req.params.id, 'assignment id');

  const [assignment] = await queryAssignments(user, { id });
  if (!assignment) throw httpError(404, 'Assignment not found');
  res.json({ assignment });
}

export async function createAssignment(req: Request, res: Response): Promise<void> {
  const user = currentUser(req);
  // The validation middleware does not replace req.body, so parse again to apply defaults.
  const input = createAssignmentSchema.parse(req.body);
  assertHttpUrl(input.attachment_url, 'Material link');

  await assertCanManageModule(user, input.module_id);

  const [created] = await sql`
    INSERT INTO assignments (module_id, title, instructions, due_date, max_score, attachment_url)
    VALUES (${input.module_id}, ${input.title}, ${input.instructions || null},
            ${input.due_date}, ${input.max_score}, ${input.attachment_url || null})
    RETURNING id
  `;

  const [assignment] = await queryAssignments(user, { id: created.id as string });
  res.status(201).json({ assignment });
}

export async function updateAssignment(req: Request, res: Response): Promise<void> {
  const user = currentUser(req);
  const id = parseUuid(req.params.id, 'assignment id');
  const input = updateAssignmentSchema.parse(req.body);
  assertHttpUrl(input.attachment_url, 'Material link');

  await assertCanManageAssignment(user, id);

  // Never let the maximum drop below a grade that has already been given.
  if (input.max_score !== undefined) {
    const [over] = await sql`
      SELECT COUNT(*)::int AS n FROM submissions
      WHERE assignment_id = ${id} AND grade IS NOT NULL AND grade > ${input.max_score}
    `;
    if (over && over.n > 0) {
      throw httpError(
        409,
        `${over.n} grade${over.n === 1 ? ' is' : 's are'} already higher than ${input.max_score}. Adjust those grades first.`,
      );
    }
  }

  // Optional text fields: undefined = leave unchanged, '' = clear.
  const instructionsProvided = input.instructions !== undefined;
  const attachmentProvided = input.attachment_url !== undefined;

  await sql`
    UPDATE assignments
    SET title = COALESCE(${input.title ?? null}, title),
        instructions = CASE WHEN ${instructionsProvided}::boolean THEN ${input.instructions || null} ELSE instructions END,
        due_date = COALESCE(${input.due_date ?? null}::timestamptz, due_date),
        max_score = COALESCE(${input.max_score ?? null}::numeric, max_score),
        attachment_url = CASE WHEN ${attachmentProvided}::boolean THEN ${input.attachment_url || null} ELSE attachment_url END
    WHERE id = ${id}
  `;

  const [assignment] = await queryAssignments(user, { id });
  res.json({ assignment });
}

export async function deleteAssignment(req: Request, res: Response): Promise<void> {
  const id = parseUuid(req.params.id, 'assignment id');

  const [row] = await sql`
    SELECT (SELECT COUNT(*) FROM submissions WHERE assignment_id = ${id})::int AS submissions
    FROM assignments WHERE id = ${id}
  `;
  if (!row) throw httpError(404, 'Assignment not found');
  if (row.submissions > 0) {
    throw httpError(
      409,
      `This assignment already has ${row.submissions} submission${row.submissions === 1 ? '' : 's'} and can’t be deleted.`,
    );
  }

  try {
    await sql`DELETE FROM assignments WHERE id = ${id}`;
  } catch (err) {
    rethrowDbError(err, {
      foreignKey: 'Other records still reference this assignment, so it can’t be deleted.',
    });
  }
  res.json({ message: 'Assignment deleted' });
}
