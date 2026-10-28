import { useEffect, useState } from 'react';
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
import api from '@/lib/api.ts';
import { getErrorMessage } from '@/lib/errors.ts';
import type { QuizItem } from './types.ts';

interface QuizFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  /** Required when creating. */
  courseId?: string;
  quiz?: QuizItem | null;
  onSaved: (quiz: { id: string }) => void;
}

export function QuizFormDialog({ open, onOpenChange, mode, courseId, quiz, onSaved }: QuizFormDialogProps) {
  const [title, setTitle] = useState('');
  const [timeLimit, setTimeLimit] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const editing = mode === 'edit' && quiz;
    setTitle(editing ? quiz.title : '');
    setTimeLimit(editing && quiz.time_limit_minutes ? String(quiz.time_limit_minutes) : '');
    setBusy(false);
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, quiz]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const payload = {
      title: title.trim(),
      // Blank = no time limit.
      time_limit_minutes: timeLimit.trim() === '' ? null : Number(timeLimit),
    };
    try {
      const { data } =
        mode === 'create' || !quiz
          ? await api.post<{ quiz: { id: string } }>('/quizzes', { ...payload, course_id: courseId })
          : await api.patch<{ quiz: { id: string } }>(`/quizzes/${quiz.id}`, payload);
      onSaved(data.quiz);
      onOpenChange(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'New quiz' : 'Edit quiz'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'The quiz starts as a draft. Add questions, then publish it for students.'
              : 'Change the title or the time limit.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qf-title">Title</Label>
            <Input id="qf-title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qf-time">Time limit in minutes (optional)</Label>
            <Input
              id="qf-time"
              type="number"
              min={1}
              max={600}
              step={1}
              placeholder="No time limit"
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Students see a countdown and the quiz is submitted automatically when it ends.
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : mode === 'create' ? 'Create quiz' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
