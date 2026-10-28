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
import { localInputToIso, toLocalInputValue } from '@/lib/utils.ts';
import type { AssignmentItem } from './types.ts';

interface AssignmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  /** Required when creating: the module the assignment belongs to. */
  moduleId?: string;
  assignment?: AssignmentItem | null;
  onSaved: (assignment: { id: string }) => void;
}

export function AssignmentFormDialog({
  open,
  onOpenChange,
  mode,
  moduleId,
  assignment,
  onSaved,
}: AssignmentFormDialogProps) {
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxScore, setMaxScore] = useState('100');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const editing = mode === 'edit' && assignment;
    setTitle(editing ? assignment.title : '');
    setInstructions(editing ? (assignment.instructions ?? '') : '');
    setDueDate(editing ? toLocalInputValue(assignment.due_date) : '');
    setMaxScore(editing ? String(assignment.max_score) : '100');
    setAttachmentUrl(editing ? (assignment.attachment_url ?? '') : '');
    setBusy(false);
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, assignment]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const payload = {
      title: title.trim(),
      instructions: instructions.trim(),
      due_date: localInputToIso(dueDate),
      max_score: Number(maxScore),
      attachment_url: attachmentUrl.trim(),
    };
    try {
      const { data } =
        mode === 'create' || !assignment
          ? await api.post<{ assignment: { id: string } }>('/assignments', { ...payload, module_id: moduleId })
          : await api.patch<{ assignment: { id: string } }>(`/assignments/${assignment.id}`, payload);
      onSaved(data.assignment);
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
          <DialogTitle>{mode === 'create' ? 'New assignment' : 'Edit assignment'}</DialogTitle>
          <DialogDescription>
            Students hand in a link to their work (for example a Google Docs or Drive link).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="af-title">Title</Label>
            <Input id="af-title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="af-instructions">Instructions (optional)</Label>
            <Textarea id="af-instructions" rows={4} value={instructions} onChange={(e) => setInstructions(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="af-due">Due date</Label>
              <Input id="af-due" type="datetime-local" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="af-max">Maximum score</Label>
              <Input id="af-max" type="number" min={1} max={1000} step="any" required value={maxScore} onChange={(e) => setMaxScore(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="af-attach">Material link (optional)</Label>
            <Input id="af-attach" type="url" placeholder="https://…" value={attachmentUrl} onChange={(e) => setAttachmentUrl(e.target.value)} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="destructive" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : mode === 'create' ? 'Create assignment' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
