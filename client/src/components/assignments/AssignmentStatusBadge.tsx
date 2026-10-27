import { Badge } from '@/components/ui/badge.tsx';
import type { AssignmentStatus } from './types.ts';

interface AssignmentStatusBadgeProps {
  status: AssignmentStatus;
  isLate?: boolean;
}

/** The student-facing state of an assignment (plus a "Late" tag when handed in after the deadline). */
export function AssignmentStatusBadge({ status, isLate }: AssignmentStatusBadgeProps) {
  if (!status) return null;
  return (
    <span className="inline-flex items-center gap-1.5">
      {status === 'graded' && <Badge variant="success">Graded</Badge>}
      {status === 'submitted' && <Badge variant="default">Submitted</Badge>}
      {status === 'not_submitted' && <Badge variant="outline">Not submitted</Badge>}
      {status === 'overdue' && <Badge variant="destructive">Overdue</Badge>}
      {isLate && (status === 'submitted' || status === 'graded') && <Badge variant="warning">Late</Badge>}
    </span>
  );
}
