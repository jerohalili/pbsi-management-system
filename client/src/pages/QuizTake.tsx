import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { ArrowLeft, Clock } from 'lucide-react';
import useAuth from '@/hooks/useAuth.ts';
import { useGet } from '@/hooks/useApi.ts';
import api from '@/lib/api.ts';
import { getErrorMessage } from '@/lib/errors.ts';
import { useToast } from '@/components/ui/toast.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Card } from '@/components/ui/card.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { ConfirmDialog } from '@/components/users/ConfirmDialog.tsx';
import { QUESTION_TYPE_LABEL, type QuizItem, type QuizQuestion } from '@/components/quizzes/types.ts';

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export default function QuizTakePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const deadline = useRef<number | null>(null);
  const autoSubmitted = useRef(false);
  const submittedRef = useRef(false);

  const { data, isLoading, isError, refetch } = useGet<{ quiz: QuizItem; questions: QuizQuestion[] }>(
    ['quiz', id ?? ''],
    `/quizzes/${id}`,
    { enabled: !!id, refetchOnWindowFocus: false },
  );
  const quiz = data?.quiz;
  const questions = data?.questions ?? [];

  const answeredCount = questions.filter((q) => (answers[q.id] ?? '').trim() !== '').length;
  const unanswered = questions.length - answeredCount;

  /** Sends the answers. Throws when the server refuses so callers can show the message. */
  const doSubmit = async (): Promise<void> => {
    if (!quiz || submittedRef.current) return;
    setSubmitting(true);
    try {
      const { data: result } = await api.post<{ attempt: { id: string } }>('/quiz-attempts', {
        quiz_id: quiz.id,
        answers,
      });
      submittedRef.current = true;
      queryClient.invalidateQueries('quiz');
      queryClient.invalidateQueries('quizzes');
      navigate(`/quiz-results/${result.attempt.id}`, { replace: true });
    } catch (err) {
      // Already taken (for example in another tab): go to the quiz page instead of a dead end.
      if ((err as { response?: { status?: number } })?.response?.status === 409) {
        toast({ title: getErrorMessage(err), variant: 'destructive' });
        queryClient.invalidateQueries('quiz');
        navigate(`/quizzes/${quiz.id}`, { replace: true });
        return;
      }
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const submitDirect = async () => {
    setSubmitError('');
    try {
      await doSubmit();
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    }
  };

  const onSubmitClick = () => {
    if (unanswered > 0) setConfirmOpen(true);
    else void submitDirect();
  };

  // Start the countdown once, when the quiz has loaded.
  useEffect(() => {
    if (quiz && quiz.status !== 'completed' && quiz.time_limit_minutes && deadline.current === null) {
      deadline.current = Date.now() + quiz.time_limit_minutes * 60 * 1000;
      setRemaining(quiz.time_limit_minutes * 60);
    }
  }, [quiz]);

  useEffect(() => {
    if (remaining === null) return;
    const timer = setInterval(() => {
      if (deadline.current === null) return;
      const left = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0 && !autoSubmitted.current) {
        autoSubmitted.current = true;
        void submitDirect();
      }
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining === null, answers]);

  const back = (
    <Link to={`/quizzes/${id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="w-4 h-4 mr-1" /> Back to quiz
    </Link>
  );

  if (user && user.role !== 'student') {
    return (
      <div className="space-y-6">
        {back}
        <Card className="p-6 text-sm text-muted-foreground">Only students can take quizzes.</Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !quiz) {
    return (
      <div className="space-y-6">
        {back}
        <Card className="p-6 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">Couldn’t load this quiz. It may not be available.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  // One attempt only: anyone who already finished goes straight to their result.
  if (quiz.status === 'completed' && quiz.attempt_id) {
    return <Navigate to={`/quiz-results/${quiz.attempt_id}`} replace />;
  }

  const setAnswer = (questionId: string, value: string) =>
    setAnswers((prev) => ({ ...prev, [questionId]: value }));

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="sticky top-0 z-10 -mx-1 px-1 py-3 bg-background/95 backdrop-blur border-b border-input flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold truncate">{quiz.title}</h1>
          <p className="text-xs text-muted-foreground">
            {answeredCount} of {questions.length} answered
          </p>
        </div>
        {remaining !== null && (
          <div
            className={`flex items-center gap-2 font-mono text-lg ${remaining <= 60 ? 'text-destructive font-bold' : ''}`}
            aria-label="Time left"
          >
            <Clock className="w-5 h-5" /> {formatCountdown(remaining)}
          </div>
        )}
      </div>

      {questions.map((question, index) => (
        <Card key={question.id} className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{index + 1}.</span>
            <span>{QUESTION_TYPE_LABEL[question.type]}</span>
            <span>· {question.points} {question.points === 1 ? 'point' : 'points'}</span>
          </div>
          <p className="whitespace-pre-wrap break-words">{question.question_text}</p>

          {question.type === 'mcq' && (
            <div className="space-y-2" role="radiogroup" aria-label={`Question ${index + 1}`}>
              {(question.options ?? []).map((option) => (
                <label key={option} className="flex items-center gap-3 rounded-lg border border-input p-3 text-sm cursor-pointer hover:bg-accent">
                  <input
                    type="radio"
                    name={`q-${question.id}`}
                    checked={answers[question.id] === option}
                    onChange={() => setAnswer(question.id, option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          )}

          {question.type === 'true_false' && (
            <div className="space-y-2" role="radiogroup" aria-label={`Question ${index + 1}`}>
              {(['true', 'false'] as const).map((value) => (
                <label key={value} className="flex items-center gap-3 rounded-lg border border-input p-3 text-sm cursor-pointer hover:bg-accent">
                  <input
                    type="radio"
                    name={`q-${question.id}`}
                    checked={answers[question.id] === value}
                    onChange={() => setAnswer(question.id, value)}
                  />
                  {value === 'true' ? 'True' : 'False'}
                </label>
              ))}
            </div>
          )}

          {question.type === 'short_answer' && (
            <Input
              aria-label={`Answer to question ${index + 1}`}
              placeholder="Type your answer"
              value={answers[question.id] ?? ''}
              onChange={(e) => setAnswer(question.id, e.target.value)}
            />
          )}
        </Card>
      ))}

      {submitError && <p className="text-sm text-destructive">{submitError}</p>}

      <div className="flex items-center gap-4 pb-8">
        <Button onClick={onSubmitClick} disabled={submitting || questions.length === 0}>
          {submitting ? 'Submitting…' : 'Submit quiz'}
        </Button>
        <p className="text-sm text-muted-foreground">You can’t change your answers after submitting.</p>
      </div>

      {confirmOpen && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setConfirmOpen(false)}
          title="Submit with unanswered questions?"
          description={`You haven’t answered ${unanswered} ${unanswered === 1 ? 'question' : 'questions'}. Unanswered questions score zero.`}
          confirmLabel="Submit anyway"
          onConfirm={doSubmit}
        />
      )}
    </div>
  );
}
