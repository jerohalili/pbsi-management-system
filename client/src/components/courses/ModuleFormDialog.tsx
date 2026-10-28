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
  video_url: string | null;
  attachment_url: string | null;
  order_index: number;
}

interface ModuleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  courseId: string;
  /** Suggested position for a new module. */
  nextOrderIndex: number;
  module?: ModuleFormValues | null;
  onSaved: () => void;
}

export function ModuleFormDialog({
  open,
  onOpenChange,
  mode,
  courseId,
  nextOrderIndex,
  module,
  onSaved,
}: ModuleFormDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [orderIndex, setOrderIndex] = useState('0');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const editing = mode === 'edit' && module;
    setTitle(editing ? module.title : '');
    setDescription(editing ? (module.rich_description ?? '') : '');
    setVideoUrl(editing ? (module.video_url ?? '') : '');
    setAttachmentUrl(editing ? (module.attachment_url ?? '') : '');
    setOrderIndex(String(editing ? module.order_index : nextOrderIndex));
    setBusy(false);
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, module]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const payload = {
      title: title.trim(),
      rich_description: description.trim(),
      video_url: videoUrl.trim(),
      attachment_url: attachmentUrl.trim(),
      order_index: Number(orderIndex),
    };
    try {
      if (mode === 'create' || !module) {
        await api.post('/modules', { ...payload, course_id: courseId });
      } else {
        await api.patch(`/modules/${module.id}`, payload);
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
          <DialogTitle>{mode === 'create' ? 'Add module' : 'Edit module'}</DialogTitle>
          <DialogDescription>
            A module is one unit of the course: a lesson with notes, an optional video and material.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mf-title">Title</Label>
            <Input id="mf-title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mf-desc">Lesson notes (optional)</Label>
            <Textarea id="mf-desc" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mf-video">Video link (optional)</Label>
            <Input id="mf-video" type="url" placeholder="https://…" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mf-attach">Material link (optional)</Label>
            <Input id="mf-attach" type="url" placeholder="https://…" value={attachmentUrl} onChange={(e) => setAttachmentUrl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mf-order">Position</Label>
            <Input id="mf-order" type="number" min={0} step={1} required value={orderIndex} onChange={(e) => setOrderIndex(e.target.value)} />
            <p className="text-xs text-muted-foreground">Lower numbers appear first.</p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="destructive" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : mode === 'create' ? 'Add module' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
