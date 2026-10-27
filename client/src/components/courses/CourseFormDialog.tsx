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
import { useGet } from '@/hooks/useApi.ts';
import api from '@/lib/api.ts';
import { getErrorMessage } from '@/lib/errors.ts';

export interface CourseFormValues {
  id: string;
  code: string;
  name: string;
  description: string | null;
  credits: number;
  teacher_id: string;
}

interface TeacherOption {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
}

interface CourseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  /** Admins choose the teacher; teachers always own the courses they create. */
  isAdmin: boolean;
  course?: CourseFormValues | null;
  /** Receives the saved course so the caller can refresh or navigate. */
  onSaved: (course: { id: string }) => void;
}

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring';

export function CourseFormDialog({
  open,
  onOpenChange,
  mode,
  isAdmin,
  course,
  onSaved,
}: CourseFormDialogProps) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [credits, setCredits] = useState('3');
  const [teacherId, setTeacherId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const { data: teacherData } = useGet<{ teachers: TeacherOption[] }>(
    ['teachers'],
    '/teachers',
    { enabled: open && isAdmin },
  );
  const teachers = teacherData?.teachers ?? [];

  useEffect(() => {
    if (!open) return;
    setCode(mode === 'edit' && course ? course.code : '');
    setName(mode === 'edit' && course ? course.name : '');
    setDescription(mode === 'edit' && course ? (course.description ?? '') : '');
    setCredits(mode === 'edit' && course ? String(course.credits) : '3');
    setTeacherId(mode === 'edit' && course ? course.teacher_id : '');
    setBusy(false);
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, course]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const payload: Record<string, unknown> = {
      code: code.trim(),
      name: name.trim(),
      description: description.trim(),
      credits: Number(credits),
    };
    if (isAdmin && teacherId) payload.teacher_id = teacherId;

    try {
      const { data } =
        mode === 'create' || !course
          ? await api.post<{ course: { id: string } }>('/courses', payload)
          : await api.patch<{ course: { id: string } }>(`/courses/${course.id}`, payload);
      onSaved(data.course);
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
          <DialogTitle>{mode === 'create' ? 'New course' : 'Edit course'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create the course, then add its modules.'
              : 'Update this course’s details.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="cf-code">Course code</Label>
              <Input id="cf-code" required placeholder="MATH101" value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="cf-name">Course name</Label>
              <Input id="cf-name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cf-desc">Description (optional)</Label>
            <Textarea id="cf-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cf-credits">Credits</Label>
              <Input
                id="cf-credits"
                type="number"
                min={1}
                max={12}
                step={1}
                required
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
              />
            </div>
            {isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="cf-teacher">Teacher</Label>
                <select
                  id="cf-teacher"
                  required
                  className={selectClass}
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                >
                  <option value="" disabled>
                    Choose a teacher…
                  </option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {`${t.first_name ?? ''} ${t.last_name ?? ''}`.trim() || t.email}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : mode === 'create' ? 'Create course' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
