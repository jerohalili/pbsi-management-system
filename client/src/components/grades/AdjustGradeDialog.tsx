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
import { Textarea } from '@/components/ui/textarea.tsx';
import api from '@/lib/api.ts';
import { getErrorMessage } from '@/lib/errors.ts';

export interface AdjustGradeTarget {
  gradeId: string;
  studentName: string;
  assessmentTitle: string;
  score: number | string;
  feedback: string | null;
}

interface AdjustGradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: AdjustGradeTarget | null;
  onSaved: () => void;
}

export function AdjustGradeDialog({ open, onOpenChange, target, onSaved }: AdjustGradeDialogProps) {
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !target) return;
    setScore(String(Number(target.score)));
    setFeedback(target.feedback ?? '');
    setBusy(false);
    setError('');
  }, [open, target]);

  if (!target) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(score);
    // An empty field must not count as a score of 0.
    if (score.trim() === '' || !Number.isFinite(value) || value < 0 || value > 100) {
      setError('Enter a percentage between 0 and 100.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await api.patch(`/grades/${target.gradeId}`, { score: value, feedback: feedback.trim() });
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust grade</DialogTitle>
          <DialogDescription>
            {target.studentName} · {target.assessmentTitle}. This changes only the recorded grade; the
            submission or quiz attempt stays as it was, and grading the assignment again will replace your
            change. The student is notified.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} noValidate className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ag-score">Grade (%)</Label>
            <Input id="ag-score" type="number" min={0} max={100} step="any" required value={score} onChange={(e) => setScore(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ag-feedback">Note to the student (optional)</Label>
            <Textarea id="ag-feedback" rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="destructive" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Save grade'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
