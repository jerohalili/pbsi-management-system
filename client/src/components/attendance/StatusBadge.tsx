import { STATUS_BADGE, type AttendanceStatus } from '@/lib/attendance.ts';

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
        STATUS_BADGE[status as AttendanceStatus] ?? ''
      }`}
    >
      {status}
    </span>
  );
}
