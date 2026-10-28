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
import { isWebUrl } from './types.ts';

export interface GradeTarget {
  submissionId: string;
  studentName: string;
  fileUrl: string | null;
  maxScore: number;
  currentGrade: number | null;
  currentFeedback: string | null;
}

interface GradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: GradeTarget | null;
  onSaved: () => void;
}

export function GradeDialog({ open, onOpenChange, target, onSaved }: GradeDialogProps) {
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !target) return;
    setScore(target.currentGrade !== null ? String(target.currentGrade) : '');
    setFeedback(target.currentFeedback ?? '');
    setBusy(false);
    setError('');
  }, [open, target]);

  if (!target) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(score);
    // An empty field must not count as a score of 0.
    if (score.trim() === '' || !Number.isFinite(value) || value < 0 || value > target.maxScore) {
      setError(`Enter a score between 0 and ${target.maxScore}.`);
      return;
    }
    setBusy(true);
    setError('');
    try {
      await api.patch(`/submissions/${target.submissionId}/grade`, { score: value, feedback: feedback.trim() });
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
          <DialogTitle>Grade {target.studentName}</DialogTitle>
          <DialogDescription>
            {isWebUrl(target.fileUrl) ? (
              <a href={target.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Open the submitted work
              </a>
            ) : (
              'No link was submitted.'
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} noValidate className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gd-score">Score (out of {target.maxScore})</Label>
            <Input id="gd-score" type="number" min={0} max={target.maxScore} step="any" required value={score} onChange={(e) => setScore(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gd-feedback">Feedback (optional)</Label>
            <Textarea id="gd-feedback" rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
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
