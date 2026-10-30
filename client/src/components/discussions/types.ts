export type DiscussionRole = 'admin' | 'teacher' | 'student';

export interface DiscussionPerson {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  author_role: DiscussionRole;
}

export interface ThreadSummary extends DiscussionPerson {
  id: string;
  course_id: string;
  title: string;
  preview: string;
  author_id: string;
  is_pinned: boolean;
  is_locked: boolean;
  is_answered: boolean;
  reply_count: number;
  created_at: string;
  edited_at: string | null;
  last_activity_at: string;
}

export interface ThreadDetail extends DiscussionPerson {
  id: string;
  course_id: string;
  course_code: string;
  course_name: string;
  title: string;
  body: string;
  author_id: string;
  is_pinned: boolean;
  is_locked: boolean;
  answer_reply_id: string | null;
  created_at: string;
  edited_at: string | null;
  /** The signed-in user wrote this discussion. */
  is_mine: boolean;
  /** The signed-in user is an admin or the teacher of this course. */
  can_moderate: boolean;
}

export interface ReplyItem extends DiscussionPerson {
  id: string;
  thread_id: string;
  author_id: string;
  parent_reply_id: string | null;
  /** null when the reply was removed. */
  content: string | null;
  is_deleted: boolean;
  removed_by_moderator: boolean;
  created_at: string;
  edited_at: string | null;
}

export function personName(person: Pick<DiscussionPerson, 'first_name' | 'last_name'>): string {
  return `${person.first_name ?? ''} ${person.last_name ?? ''}`.trim() || 'Unknown user';
}

export const THREAD_TITLE_MAX = 150;
export const THREAD_BODY_MAX = 5000;
export const REPLY_MAX = 3000;
