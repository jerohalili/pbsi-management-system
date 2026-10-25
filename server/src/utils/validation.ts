import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128),
  role: z.enum(['admin', 'teacher', 'student']),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const courseSchema = z.object({
  code: z.string().min(1, 'Course code is required'),
  name: z.string().min(1, 'Course name is required'),
  description: z.string().optional(),
  credits: z.coerce.number().int().positive().optional().default(3),
  teacher_id: z.string().uuid('Invalid teacher ID').optional(),
});

export const moduleSchema = z.object({
  course_id: z.string().uuid('Invalid course ID'),
  title: z.string().min(1, 'Module title is required'),
  rich_description: z.string().optional(),
  video_url: z.string().url().optional().or(z.literal('')),
  attachment_url: z.string().url().optional().or(z.literal('')),
  order_index: z.coerce.number().int().nonnegative().default(0),
});

export const assignmentSchema = z.object({
  module_id: z.string().uuid('Invalid module ID'),
  title: z.string().min(1, 'Assignment title is required'),
  instructions: z.string().optional(),
  due_date: z.string().datetime('Invalid due date'),
  max_score: z.coerce.number().positive('Max score must be positive'),
});

export const gradeSchema = z.object({
  score: z.coerce.number().min(0).max(100),
  feedback: z.string().optional(),
});

export const attendanceSchema = z.object({
  student_id: z.string().uuid('Invalid student ID'),
  course_id: z.string().uuid('Invalid course ID'),
  date: z.string().date('Invalid date'),
  status: z.enum(['present', 'absent', 'late', 'excused']),
});

export const timetableSchema = z.object({
  day_of_week: z.coerce.number().int().min(1).max(5),
  period_number: z.coerce.number().int().positive(),
  start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  end_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  course_id: z.string().uuid('Invalid course ID'),
  teacher_id: z.string().uuid('Invalid teacher ID'),
  room: z.string().min(1, 'Room is required'),
});

export const notificationSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  type: z.string().min(1),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  link: z.string().url().optional().or(z.literal('')),
});

export const quizSchema = z.object({
  course_id: z.string().uuid('Invalid course ID'),
  title: z.string().min(1, 'Quiz title is required'),
  time_limit_minutes: z.coerce.number().int().positive().optional(),
  is_published: z.coerce.boolean().optional().default(false),
});

export const quizQuestionSchema = z.object({
  quiz_id: z.string().uuid('Invalid quiz ID'),
  question_text: z.string().min(1, 'Question text is required'),
  type: z.enum(['mcq', 'true_false', 'short_answer']),
  options: z.array(z.string()).optional(),
  correct_answer: z.string().min(1, 'Correct answer is required'),
  points: z.coerce.number().positive().default(1),
});

export const quizAttemptSchema = z.object({
  quiz_id: z.string().uuid('Invalid quiz ID'),
  answers: z.record(z.string(), z.string()),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type ModuleInput = z.infer<typeof moduleSchema>;
export type AssignmentInput = z.infer<typeof assignmentSchema>;
export type GradeInput = z.infer<typeof gradeSchema>;
export type AttendanceInput = z.infer<typeof attendanceSchema>;
export type TimetableInput = z.infer<typeof timetableSchema>;
export type NotificationInput = z.infer<typeof notificationSchema>;
export type QuizInput = z.infer<typeof quizSchema>;
export type QuizQuestionInput = z.infer<typeof quizQuestionSchema>;
export type QuizAttemptInput = z.infer<typeof quizAttemptSchema>;
