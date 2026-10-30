import { sql } from './db.js';

const SCRIPT = 'server/sql/cloudinary-uploads.sql';

// Columns added by the Cloudinary upload feature. The queries for assignments, submissions and
// quizzes read them, so a database without them would fail page by page with confusing 500s.
const REQUIRED_COLUMNS: Array<[table: string, column: string]> = [
  ['submissions', 'file_public_id'],
  ['submissions', 'file_name'],
  ['assignments', 'attachment_public_id'],
  ['assignments', 'attachment_name'],
  ['quiz_questions', 'image_url'],
  ['quiz_questions', 'image_public_id'],
];

interface ColumnRow {
  table_name: string;
  column_name: string;
  is_nullable: string;
}

/** What is missing or wrong, given the columns the database reports. Empty when the schema is ready. */
export function schemaProblems(rows: ColumnRow[]): string[] {
  const has = (table: string, column: string) =>
    rows.some((r) => r.table_name === table && r.column_name === column);

  const problems = REQUIRED_COLUMNS.filter(([t, c]) => !has(t, c)).map(([t, c]) => `missing column ${t}.${c}`);

  // A file hand-in has no link, so the link column must allow NULL.
  const fileUrl = rows.find((r) => r.table_name === 'submissions' && r.column_name === 'file_url');
  if (fileUrl && fileUrl.is_nullable !== 'YES') problems.push('submissions.file_url must allow NULL');
  return problems;
}

/** Stops the server at startup, with instructions, when the upload columns have not been added yet. */
export async function assertUploadSchema(): Promise<void> {
  const rows = (await sql`
    SELECT table_name, column_name, is_nullable
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name IN ('submissions', 'assignments', 'quiz_questions')
  `) as ColumnRow[];

  const problems = schemaProblems(rows);
  if (problems.length > 0) {
    throw new Error(
      `The database is not ready for file uploads (${problems.join('; ')}). ` +
        `Run ${SCRIPT} in the Neon SQL editor (safe to run more than once), then restart the server.`,
    );
  }
}
