const SCHOOL_TIMEZONE = 'Asia/Manila';
/** Philippine school years start in June, so January-May still belongs to the previous year's term. */
const SCHOOL_YEAR_START_MONTH = 6;

/**
 * The school-year label stored in grades.term, e.g. '2026' for June 2026 through May 2027.
 * Uses the school's timezone so a grade given just after midnight in Manila lands in the right year.
 */
export function schoolYearTerm(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: SCHOOL_TIMEZONE,
    year: 'numeric',
    month: 'numeric',
  }).formatToParts(date);
  const year = Number(parts.find((p) => p.type === 'year')?.value);
  const month = Number(parts.find((p) => p.type === 'month')?.value);
  return String(month >= SCHOOL_YEAR_START_MONTH ? year : year - 1);
}

/** score out of max as a percentage 0-100, rounded to 2 decimals (0 when max is not positive). */
export function toPercent(score: number, max: number): number {
  if (!(max > 0)) return 0;
  return Math.round((score / max) * 10000) / 100;
}
