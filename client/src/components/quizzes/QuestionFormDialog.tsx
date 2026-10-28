import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import api from '@/lib/api.ts';
import { getErrorMessage } from '@/lib/errors.ts';
import { QUESTION_TYPE_LABEL, type QuestionType, type QuizQuestion } from './types.ts';

interface QuestionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quizId: string;
  /** Set when editing. */
  question?: QuizQuestion | null;
  onSaved: () => void;
}

const MAX_OPTIONS = 6;
const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring';

export function QuestionFormDialog({ open, onOpenChange, quizId, question, onSaved }: QuestionFormDialogProps) {
  const [type, setType] = useState<QuestionType>('mcq');
  const [text, setText] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [trueFalse, setTrueFalse] = useState<'true' | 'false'>('true');
  const [shortAnswer, setShortAnswer] = useState('');
  const [points, setPoints] = useState('1');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const editing = !!question;

  useEffect(() => {
    if (!open) return;
    setType(question?.type ?? 'mcq');
    setText(question?.question_text ?? '');
    const opts = question?.type === 'mcq' && question.options ? question.options : ['', ''];
    setOptions(opts);
    setCorrectIndex(
      question?.type === 'mcq' ? Math.max(0, opts.findIndex((o) => o === question.correct_answer)) : 0,
    );
    setTrueFalse(question?.type === 'true_false' && question.correct_answer === 'false' ? 'false' : 'true');
    setShortAnswer(question?.type === 'short_answer' ? (question.correct_answer ?? '') : '');
    setPoints(String(question?.points ?? 1));
    setBusy(false);
    setError('');
  }, [open, question]);

  const setOption = (index: number, value: string) =>
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
    setCorrectIndex((prev) => (prev === index ? 0 : prev > index ? prev - 1 : prev));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const payload: Record<string, unknown> = {
      type,
      question_text: text.trim(),
      points: Number(points),
    };

    if (type === 'mcq') {
      const cleaned = options.map((o) => o.trim());
      if (cleaned.some((o) => o === '')) {
        setError('Fill in every option, or remove the empty ones.');
        return;
      }
      payload.options = cleaned;
      payload.correct_answer = cleaned[correctIndex];
    } else if (type === 'true_false') {
      payload.correct_answer = trueFalse;
    } else {
      payload.correct_answer = shortAnswer.trim();
    }

    setBusy(true);
    try {
      if (question) {
        await api.patch(`/quizzes/${quizId}/questions/${question.id}`, payload);
      } else {
        await api.post(`/quizzes/${quizId}/questions`, payload);
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit question' : 'Add question'}</DialogTitle>
          <DialogDescription>Questions are graded automatically. Each is all-or-nothing.</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="qq-type">Question type</Label>
              <select id="qq-type" className={selectClass} value={type} onChange={(e) => setType(e.target.value as QuestionType)}>
                {(Object.keys(QUESTION_TYPE_LABEL) as QuestionType[]).map((t) => (
                  <option key={t} value={t}>
                    {QUESTION_TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qq-points">Points</Label>
              <Input id="qq-points" type="number" min={1} max={100} step={1} required value={points} onChange={(e) => setPoints(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qq-text">Question</Label>
            <Textarea id="qq-text" rows={3} required value={text} onChange={(e) => setText(e.target.value)} />
          </div>

          {type === 'mcq' && (
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium mb-1">Options (select the correct one)</legend>
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct-option"
                    aria-label={`Option ${index + 1} is correct`}
                    checked={correctIndex === index}
                    onChange={() => setCorrectIndex(index)}
                  />
                  <Input
                    aria-label={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => setOption(index, e.target.value)}
                  />
                  {options.length > 2 && (
                    <Button type="button" variant="ghost" size="icon" aria-label={`Remove option ${index + 1}`} onClick={() => removeOption(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              {options.length < MAX_OPTIONS && (
                <Button type="button" variant="outline" size="sm" onClick={() => setOptions((prev) => [...prev, ''])}>
                  <Plus className="w-4 h-4 mr-1" /> Add option
                </Button>
              )}
            </fieldset>
          )}

          {type === 'true_false' && (
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium mb-1">Correct answer</legend>
              {(['true', 'false'] as const).map((value) => (
                <label key={value} className="flex items-center gap-2 text-sm">
                  <input type="radio" name="tf-correct" checked={trueFalse === value} onChange={() => setTrueFalse(value)} />
                  {value === 'true' ? 'True' : 'False'}
                </label>
              ))}
            </fieldset>
          )}

          {type === 'short_answer' && (
            <div className="space-y-2">
              <Label htmlFor="qq-short">Correct answer</Label>
              <Input id="qq-short" required value={shortAnswer} onChange={(e) => setShortAnswer(e.target.value)} />
              <p className="text-xs text-muted-foreground">
                Capital letters and extra spaces are ignored. To accept several answers, separate them with “|”
                (for example <code>USA|United States</code>).
              </p>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="destructive" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : editing ? 'Save changes' : 'Add question'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
