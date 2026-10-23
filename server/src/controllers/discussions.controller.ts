import { Request, Response } from 'express';
import { sql } from '../config/db.js';

export async function listThreads(req: Request, res: Response): Promise<void> {
  const { course_id } = req.params as { course_id: string };

  const threads = await sql`
    SELECT dt.id, dt.course_id, dt.title, dt.author_id, dt.created_at,
           p.first_name, p.last_name,
           COUNT(dr.id) AS reply_count
    FROM discussion_threads dt
    JOIN users u ON u.id = dt.author_id
    JOIN profiles p ON p.user_id = u.id
    LEFT JOIN discussion_replies dr ON dr.thread_id = dt.id
    WHERE dt.course_id = ${course_id}
    GROUP BY dt.id, p.first_name, p.last_name
    ORDER BY dt.created_at DESC
  `;
  res.json({ threads });
}

export async function createThread(req: Request, res: Response): Promise<void> {
  const { course_id, title } = req.body as { course_id: string; title: string };
  const authorId = (req.user as { id: string })?.id;

  const [thread] = await sql`
    INSERT INTO discussion_threads (course_id, title, author_id)
    VALUES (${course_id}, ${title}, ${authorId})
    RETURNING id, course_id, title, author_id, created_at
  `;
  res.status(201).json({ thread });
}

export async function listReplies(req: Request, res: Response): Promise<void> {
  const { thread_id } = req.params as { thread_id: string };

  const replies = await sql`
    SELECT dr.id, dr.thread_id, dr.author_id, dr.parent_reply_id, dr.content, dr.created_at,
           p.first_name, p.last_name
    FROM discussion_replies dr
    JOIN users u ON u.id = dr.author_id
    JOIN profiles p ON p.user_id = u.id
    WHERE dr.thread_id = ${thread_id}
    ORDER BY dr.created_at ASC
  `;
  res.json({ replies });
}

export async function createReply(req: Request, res: Response): Promise<void> {
  const { thread_id } = req.params as { thread_id: string };
  const { content, parent_reply_id } = req.body as {
    content: string;
    parent_reply_id?: string;
  };
  const authorId = (req.user as { id: string })?.id;

  const [reply] = await sql`
    INSERT INTO discussion_replies (thread_id, author_id, parent_reply_id, content)
    VALUES (${thread_id}, ${authorId}, ${parent_reply_id ?? null}, ${content})
    RETURNING id, thread_id, author_id, parent_reply_id, content, created_at
  `;
  res.status(201).json({ reply });
}
