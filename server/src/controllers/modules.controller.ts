import { Request, Response } from 'express';
import { sql } from '../config/db.js';
import type { AppError } from '../middleware/errorHandler.js';
import { moduleSchema } from '../utils/validation.js';
import {
  assertCanManageCourse,
  assertCanManageModule,
  assertHttpUrl,
  httpError,
  parseUuid,
} from '../utils/access.js';

export async function listModules(req: Request, res: Response): Promise<void> {
  const { course_id } = req.params as { course_id: string };

  const modules = await sql`
    SELECT m.id, m.course_id, m.title, m.rich_description, m.video_url,
           m.attachment_url, m.order_index, m.created_at
    FROM modules m
    WHERE m.course_id = ${course_id}
    ORDER BY m.order_index ASC
  `;
  res.json({ modules });
}

export async function getModule(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const [module] = await sql`
    SELECT m.id, m.course_id, m.title, m.rich_description, m.video_url,
           m.attachment_url, m.order_index, m.created_at
    FROM modules m
    WHERE m.id = ${id}
  `;
  if (!module) {
    const err = new Error('Module not found') as AppError;
    err.statusCode = 404;
    throw err;
  }
  res.json({ module });
}

export async function createModule(req: Request, res: Response): Promise<void> {
  if (!req.user) throw httpError(401, 'Not authenticated');
  // The validation middleware does not replace req.body, so parse again to apply defaults.
  const input = moduleSchema.parse(req.body);
  assertHttpUrl(input.video_url, 'Video link');
  assertHttpUrl(input.attachment_url, 'Attachment link');

  await assertCanManageCourse(req.user, input.course_id);

  const [module] = await sql`
    INSERT INTO modules (course_id, title, rich_description, video_url, attachment_url, order_index)
    VALUES (${input.course_id}, ${input.title}, ${input.rich_description || null},
            ${input.video_url || null}, ${input.attachment_url || null}, ${input.order_index})
    RETURNING id, course_id, title, rich_description, video_url, attachment_url, order_index, created_at
  `;
  res.status(201).json({ module });
}

export async function updateModule(req: Request, res: Response): Promise<void> {
  if (!req.user) throw httpError(401, 'Not authenticated');
  const id = parseUuid(req.params.id, 'module id');
  const input = moduleSchema.omit({ course_id: true }).partial().parse(req.body);
  assertHttpUrl(input.video_url, 'Video link');
  assertHttpUrl(input.attachment_url, 'Attachment link');

  await assertCanManageModule(req.user, id);

  // Optional text fields: undefined = leave unchanged, '' = clear.
  const descProvided = input.rich_description !== undefined;
  const videoProvided = input.video_url !== undefined;
  const attachmentProvided = input.attachment_url !== undefined;

  const [module] = await sql`
    UPDATE modules
    SET title = COALESCE(${input.title ?? null}, title),
        rich_description = CASE WHEN ${descProvided}::boolean THEN ${input.rich_description || null} ELSE rich_description END,
        video_url = CASE WHEN ${videoProvided}::boolean THEN ${input.video_url || null} ELSE video_url END,
        attachment_url = CASE WHEN ${attachmentProvided}::boolean THEN ${input.attachment_url || null} ELSE attachment_url END,
        order_index = COALESCE(${input.order_index ?? null}, order_index)
    WHERE id = ${id}
    RETURNING id, course_id, title, rich_description, video_url, attachment_url, order_index
  `;
  res.json({ module });
}

export async function deleteModule(req: Request, res: Response): Promise<void> {
  const id = parseUuid(req.params.id, 'module id');

  // The database cascades deletes from a module to its assignments and their submissions,
  // so refuse unless the module has no assignments.
  const [usage] = await sql`
    SELECT (SELECT COUNT(*) FROM assignments WHERE module_id = ${id})::int AS assignments
  `;
  if (usage && usage.assignments > 0) {
    throw httpError(
      409,
      `This module still has ${usage.assignments} assignment${usage.assignments === 1 ? '' : 's'} and can’t be deleted. Remove them first.`,
    );
  }

  const [module] = await sql`DELETE FROM modules WHERE id = ${id} RETURNING id`;
  if (!module) throw httpError(404, 'Module not found');
  res.json({ message: 'Module deleted' });
}
