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
import { Label } from '@/components/ui/label.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import api from '@/lib/api.ts';
import { getErrorMessage } from '@/lib/errors.ts';

export interface ReportTarget {
  kind: 'thread' | 'reply';
  id: string;
}

interface ReportDialogProps {
  target: ReportTarget | null;
  onClose: () => void;
  onReported: (message: string) => void;
}

/** Sends a report to the course teacher and the admins. The writer is not told who reported. */
export function ReportDialog({ target, onClose, onReported }: ReportDialogProps) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (target) {
      setReason('');
      setError('');
      setBusy(false);
    }
  }, [target]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post<{ message: string }>(
        `/discussions/${target.kind === 'thread' ? 'threads' : 'replies'}/${target.id}/report`,
        { reason },
      );
      onReported(data.message);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
      setBusy(false);
    }
  };

  return (
    <Dialog open={target !== null} onOpenChange={(next) => !next && !busy && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this post</DialogTitle>
          <DialogDescription>
            Bullying, harassment, threats and spam are not allowed. A teacher or admin will review it. The person
            who wrote it will not be told that you reported it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report-reason">What is wrong?</Label>
            <Textarea
              id="report-reason"
              required
              rows={4}
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="destructive" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || reason.trim().length < 3}>
              {busy ? 'Sending…' : 'Send report'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
