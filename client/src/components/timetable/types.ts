export interface TimetableEntry {
  id: string;
  day_of_week: number;
  period_number: number;
  start_time: string; // "HH:MM"
  end_time: string; // "HH:MM"
  room: string;
  course_id: string;
  teacher_id: string;
  course_code: string;
  course_name: string;
  teacher_first_name: string;
  teacher_last_name: string;
  /** True when the signed-in user may edit or delete this entry (admin, or the teacher who owns it). */
  can_manage: boolean;
}

export interface TimetableCourse {
  id: string;
  code: string;
  name: string;
  is_mine: boolean;
}

export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
/** The grid always shows at least this many periods; it grows if an entry uses a later one. */
export const MIN_PERIODS = 8;
/** Highest period number the API accepts. */
export const MAX_PERIODS = 12;
