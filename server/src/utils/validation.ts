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

// Optional text fields: an empty string means "clear this value".
const optionalText = (max: number) => z.string().trim().max(max).optional();

export const createUserSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128),
  role: z.enum(['admin', 'teacher', 'student']),
  first_name: z.string().trim().min(1, 'First name is required').max(100),
  last_name: z.string().trim().min(1, 'Last name is required').max(100),
  phone: optionalText(30),
  date_of_birth: z.string().date('Invalid date of birth').optional().or(z.literal('')),
  address: optionalText(300),
  // Student number (role = student) or employee number (role = teacher).
  // Generated automatically when left blank.
  student_id: optionalText(50),
  employee_id: optionalText(50),
});

export const updateUserSchema = createUserSchema
  .omit({ password: true, role: true })
  .partial();

// A teacher's or admin's manual change to a recorded grade (a percentage, 0-100).
export const overrideGradeSchema = z.object({
  score: z.coerce.number().min(0, 'Score can’t be negative').max(100, 'Score can’t be more than 100'),
  feedback: z.string().trim().max(2000).optional(),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128),
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

// Assignments are created/edited by teachers. Links are checked for http(s) in the controller;
// an empty string clears an optional value.
export const createAssignmentSchema = z.object({
  module_id: z.string().uuid('Invalid module ID'),
  title: z.string().trim().min(1, 'Assignment title is required').max(200),
  instructions: z.string().max(10000).optional(),
  due_date: z.string().datetime({ offset: true, message: 'Invalid due date' }),
  max_score: z.coerce
    .number()
    .positive('Max score must be positive')
    .max(1000, 'Max score is too large')
    .default(100),
  attachment_url: z.string().trim().max(2000).optional(),
});

export const updateAssignmentSchema = createAssignmentSchema.omit({ module_id: true }).partial();

export const submitAssignmentSchema = z.object({
  assignment_id: z.string().uuid('Invalid assignment ID'),
  file_url: z.string().trim().url('Please enter a valid link').max(2000),
});

// The upper bound is the assignment's own max score, which is checked in the controller.
export const gradeSubmissionSchema = z.object({
  score: z.coerce.number().min(0, 'Score can’t be negative'),
  feedback: z.string().trim().max(2000).optional(),
});

// ---- Quizzes ---------------------------------------------------------------

export const createQuizSchema = z.object({
  course_id: z.string().uuid('Invalid course ID'),
  title: z.string().trim().min(1, 'Quiz title is required').max(200),
  // Minutes; null or omitted = no time limit.
  time_limit_minutes: z
    .union([z.null(), z.coerce.number().int().min(1, 'Time limit must be at least 1 minute').max(600)])
    .optional(),
});

export const updateQuizSchema = z.object({
  title: z.string().trim().min(1, 'Quiz title is required').max(200).optional(),
  time_limit_minutes: z
    .union([z.null(), z.coerce.number().int().min(1, 'Time limit must be at least 1 minute').max(600)])
    .optional(),
  // A real boolean on purpose: z.coerce.boolean() would turn the string "false" into true.
  is_published: z.boolean().optional(),
});

export const questionInputSchema = z
  .object({
    type: z.enum(['mcq', 'true_false', 'short_answer']),
    question_text: z.string().trim().min(1, 'Question text is required').max(2000),
    options: z.array(z.string().trim().min(1, 'Options can’t be empty').max(500)).max(8).optional(),
    correct_answer: z.string().trim().min(1, 'The correct answer is required').max(1000),
    points: z.coerce.number().int().min(1, 'Points must be at least 1').max(100).default(1),
  })
  .superRefine((q, ctx) => {
    const fail = (message: string, path: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, message, path: [path] });

    if (q.type === 'mcq') {
      const options = q.options ?? [];
      if (options.length < 2) fail('A multiple-choice question needs at least 2 options', 'options');
      const lower = options.map((o) => o.toLowerCase());
      if (new Set(lower).size !== lower.length) fail('Options must all be different', 'options');
      if (!lower.includes(q.correct_answer.toLowerCase())) {
        fail('The correct answer must be one of the options', 'correct_answer');
      }
    } else if (q.type === 'true_false') {
      if ((q.options ?? []).length > 0) fail('True/false questions have no options', 'options');
      if (!['true', 'false'].includes(q.correct_answer.toLowerCase())) {
        fail('The correct answer must be true or false', 'correct_answer');
      }
    } else {
      if ((q.options ?? []).length > 0) fail('Short-answer questions have no options', 'options');
      if (q.correct_answer.split('|').some((alt) => alt.trim() === '')) {
        fail('Accepted answers can’t be empty (check for a stray “|”)', 'correct_answer');
      }
    }
  });

export const submitQuizAttemptSchema = z.object({
  quiz_id: z.string().uuid('Invalid quiz ID'),
  // question id -> the student's answer
  answers: z.record(z.string().max(2000)),
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
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type ModuleInput = z.infer<typeof moduleSchema>;
export type AssignmentInput = z.infer<typeof assignmentSchema>;
export type GradeInput = z.infer<typeof gradeSchema>;
export type QuestionInput = z.infer<typeof questionInputSchema>;
export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type GradeSubmissionInput = z.infer<typeof gradeSubmissionSchema>;
export type AttendanceInput = z.infer<typeof attendanceSchema>;
export type TimetableInput = z.infer<typeof timetableSchema>;
export type NotificationInput = z.infer<typeof notificationSchema>;
export type QuizInput = z.infer<typeof quizSchema>;
export type QuizQuestionInput = z.infer<typeof quizQuestionSchema>;
export type QuizAttemptInput = z.infer<typeof quizAttemptSchema>;

// ---- Module content blocks ---------------------------------------------------

export const moduleContentSchema = z.object({
  module_id: z.string().uuid('Invalid module ID'),
  type: z.enum(['text', 'video', 'image', 'file', 'link']),
  title: z.string().trim().min(1, 'Title is required').max(200).nullish(),
  content: z.string().nullish(), // rich text / HTML for text blocks
  url: z.string().trim().max(2000).nullish(), // Cloudinary URL or external link
  cloudinary_public_id: z.string().nullish(),
  resource_type: z.enum(['image', 'video', 'raw']).nullish(), // for Cloudinary cleanup
  order_index: z.coerce.number().int().nonnegative().default(0),
});

export const updateModuleContentSchema = moduleContentSchema
  .omit({ module_id: true })
  .partial();

export const reorderModuleContentsSchema = z.object({
  contents: z
    .array(
      z.object({
        id: z.string().uuid('Invalid content ID'),
        order_index: z.number().int().nonnegative(),
      }),
    )
    .max(200),
});

export const reorderModulesSchema = z.object({
  // Every module of the course, in the order they should appear.
  module_ids: z.array(z.string().uuid('Invalid module ID')).max(500),
});

export type ModuleContentInput = z.infer<typeof moduleContentSchema>;
export type UpdateModuleContentInput = z.infer<typeof updateModuleContentSchema>;
