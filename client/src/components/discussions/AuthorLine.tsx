import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge.tsx';
import { UserAvatar } from '@/components/common/UserAvatar.tsx';
import { formatDateTime } from '@/lib/utils.ts';
import { personName, type DiscussionPerson } from './types.ts';

interface AuthorLineProps {
  person: DiscussionPerson;
  createdAt: string;
  editedAt?: string | null;
}

/** Avatar, name, a Teacher/Admin badge (so students can spot official answers) and when it was posted. */
export function AuthorLine({ person, createdAt, editedAt }: AuthorLineProps) {
  const name = personName(person);
  return (
    <div className="flex items-center gap-2 flex-wrap text-sm">
      <UserAvatar src={person.avatar_url} name={name} />
      <span className="font-medium">{name}</span>
      {person.author_role === 'teacher' && <Badge variant="success">Teacher</Badge>}
      {person.author_role === 'admin' && <Badge variant="warning">Admin</Badge>}
      <span className="text-muted-foreground" title={formatDateTime(createdAt)}>
        {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
      </span>
      {editedAt && (
        <span className="text-xs text-muted-foreground" title={formatDateTime(editedAt)}>
          (edited)
        </span>
      )}
    </div>
  );
}
