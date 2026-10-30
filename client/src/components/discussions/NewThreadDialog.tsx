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
import { THREAD_BODY_MAX, THREAD_TITLE_MAX } from './types.ts';

interface NewThreadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseLabel: string;
  onCreated: (threadId: string) => void;
}

export function NewThreadDialog({ open, onOpenChange, courseId, courseLabel, onCreated }: NewThreadDialogProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setTitle('');
      setBody('');
      setError('');
      setBusy(false);
    }
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post<{ thread: { id: string } }>('/discussions', {
        course_id: courseId,
        title,
        body,
      });
      onOpenChange(false);
      onCreated(data.thread.id);
    } catch (err) {
      setError(getErrorMessage(err));
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Start a discussion</DialogTitle>
          <DialogDescription>
            In {courseLabel}. Be specific, be kind, and keep it about the course. Teachers and admins can see and
            remove posts.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nt-title">Title</Label>
            <Input
              id="nt-title"
              required
              minLength={3}
              maxLength={THREAD_TITLE_MAX}
              placeholder="e.g. How do I factor x² − 5x + 6?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nt-body">Your post</Label>
            <Textarea
              id="nt-body"
              required
              rows={6}
              maxLength={THREAD_BODY_MAX}
              placeholder="Explain what you tried and where you are stuck."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <p className="text-xs text-muted-foreground text-right">
              {body.length}/{THREAD_BODY_MAX}
            </p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="destructive" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !title.trim() || !body.trim()}>
              {busy ? 'Posting…' : 'Post discussion'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
