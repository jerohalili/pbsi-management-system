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

export interface ModuleFormValues {
  id: string;
  title: string;
  rich_description: string | null;
  order_index: number;
}

interface ModuleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  /** Position for a new module: the end of the list. Reordering happens with the arrows on the course page. */
  nextOrderIndex: number;
  onSaved: () => void;
}

export function ModuleFormDialog({
  open,
  onOpenChange,
  courseId,
  nextOrderIndex,
  onSaved,
}: ModuleFormDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setTitle('');
    setDescription('');
    setBusy(false);
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const payload = {
      title: title.trim(),
      rich_description: description.trim(),
      order_index: nextOrderIndex,
    };
    try {
      await api.post('/modules', { ...payload, course_id: courseId });
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
      <DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add module</DialogTitle>
          <DialogDescription>
            A module is one unit of the course. Add it here, then use its Edit button to attach content
            blocks (text, video, images, files, links).
          </DialogDescription>
        </DialogHeader>

        {/* Module details. The submit button lives in the footer and points here via `form`. */}
        <form id="module-form" onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mf-title">Title</Label>
            <Input
              id="mf-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mf-desc">Lesson notes (optional)</Label>
            <Textarea
              id="mf-desc"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </form>

        <DialogFooter>
          <Button type="button" variant="destructive" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" form="module-form" disabled={busy}>
            {busy ? 'Saving…' : 'Add module'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
