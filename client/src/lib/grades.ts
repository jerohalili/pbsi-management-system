/** Grade (percent) at or above which a student passes (DepEd passing mark). Keep in sync with the server. */
export const PASSING_GRADE = 75;

export type GradeTone = 'success' | 'warning' | 'destructive';

export interface GradeDescriptor {
  label: string;
  variant: GradeTone;
}

/** DepEd descriptors for a percentage grade; null when there is no usable number. */
export function describeGrade(value: number | string | null | undefined): GradeDescriptor | null {
  if (value == null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (n >= 90) return { label: 'Outstanding', variant: 'success' };
  if (n >= 85) return { label: 'Very Satisfactory', variant: 'success' };
  if (n >= 80) return { label: 'Satisfactory', variant: 'success' };
  if (n >= PASSING_GRADE) return { label: 'Fairly Satisfactory', variant: 'warning' };
  return { label: 'Did Not Meet Expectations', variant: 'destructive' };
}

/** Tailwind background class for a progress bar at this grade. */
export function gradeBarColor(value: number | string | null | undefined): string {
  const tone = describeGrade(value)?.variant;
  if (tone === 'success') return 'bg-green-500';
  if (tone === 'warning') return 'bg-amber-500';
  if (tone === 'destructive') return 'bg-red-500';
  return 'bg-site-border';
}

/** "2026" -> "SY 2026-2027" (the school year runs June to May). */
export function formatTerm(term: string): string {
  const year = Number(term);
  return Number.isInteger(year) ? `SY ${year}\u2013${year + 1}` : term;
}

/**
 * Score needed on the next assessment to lift an average up to the passing mark.
 * Every graded item counts equally (a plain mean of percentages), the same rule the server uses.
 * Returns 0 when already passing and null when one more item cannot be enough.
 */
export function scoreNeededNext(average: number, items: number, target = PASSING_GRADE): number | null {
  if (average >= target) return 0;
  const needed = target * (items + 1) - average * items;
  return needed <= 100 ? Math.ceil(needed * 100) / 100 : null;
}

/**
 * One CSV cell. Values that start with = + - @ are prefixed with an apostrophe so a spreadsheet
 * never runs them as a formula (CSV injection): names and titles are typed by other users.
 */
function csvCell(value: unknown): string {
  let text = value == null ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(header: string[], rows: unknown[][]): string {
  return [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
}

/** Saves text as a CSV download. The BOM makes Excel read UTF-8 (names with \u00f1 etc.) correctly. */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
