export type QuestionType = 'mcq' | 'true_false' | 'short_answer';

export interface GradableQuestion {
  id: string;
  type: QuestionType;
  correct_answer: string;
  points: number;
}

export interface QuestionResult {
  question_id: string;
  answer: string;
  is_correct: boolean;
  points_earned: number;
}

export interface QuizGrade {
  earned_points: number;
  total_points: number;
  /** Percentage 0-100, rounded to 2 decimals. */
  score: number;
  results: QuestionResult[];
}

/** Trim, collapse inner whitespace and ignore capitalization. */
export function normalizeAnswer(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Short answers accept several spellings separated by "|" (for example "USA|United States").
 * Every other type has exactly one correct answer.
 */
export function isAnswerCorrect(question: GradableQuestion, answer: string | undefined): boolean {
  if (answer === undefined) return false;
  const given = normalizeAnswer(answer);
  if (given === '') return false;
  if (question.type === 'short_answer') {
    return question.correct_answer.split('|').some((alt) => normalizeAnswer(alt) === given);
  }
  return normalizeAnswer(question.correct_answer) === given;
}

/** Questions are all-or-nothing. Answers for unknown question ids are ignored. */
export function gradeQuiz(
  questions: GradableQuestion[],
  answers: Record<string, string>,
): QuizGrade {
  let earned = 0;
  let total = 0;
  const results = questions.map((question) => {
    const answer = answers[question.id] ?? '';
    const correct = isAnswerCorrect(question, answer);
    total += question.points;
    if (correct) earned += question.points;
    return {
      question_id: question.id,
      answer,
      is_correct: correct,
      points_earned: correct ? question.points : 0,
    };
  });
  const score = total > 0 ? Math.round((earned / total) * 10000) / 100 : 0;
  return { earned_points: earned, total_points: total, score, results };
}
