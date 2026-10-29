export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export const ATTENDANCE_STATUSES: { value: AttendanceStatus; label: string }[] = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'excused', label: 'Excused' },
];

/** Badge colours, shared by the records table and the class list. */
export const STATUS_BADGE: Record<AttendanceStatus, string> = {
  present: 'bg-green-100 text-green-700',
  absent: 'bg-red-100 text-red-700',
  late: 'bg-amber-100 text-amber-700',
  excused: 'bg-gray-100 text-gray-700',
};

/** Today's date (YYYY-MM-DD) in the school's timezone, not the browser's or UTC. */
export function todayInManila(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/** Formats a plain YYYY-MM-DD date without shifting it across timezones. */
export function formatDay(day: string): string {
  const [y, m, d] = day.split('-').map(Number);
  if (!y || !m || !d) return day;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Controls (date, dropdowns, search) stay white so they are easy to spot. */
export const CONTROL_CLASS =
  'h-10 rounded-md border border-site-border bg-white px-3 text-sm text-site-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-card';
