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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx';
import api from '@/lib/api.ts';
import { getErrorMessage } from '@/lib/errors.ts';
import { DAY_NAMES, MAX_PERIODS, type TimetableCourse, type TimetableEntry } from './types.ts';

interface TimetableFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  /** Courses the user may schedule (admins: all, teachers: their own). */
  courses: TimetableCourse[];
  /** The entry being edited. */
  entry?: TimetableEntry | null;
  /** Day and period to start on when creating (set when the "+" in an empty cell is clicked). */
  initialDay?: number;
  initialPeriod?: number;
  /** Times already used by each period elsewhere in the timetable, offered as a starting point. */
  periodTimes: Record<number, { start: string; end: string }>;
  onSaved: () => void;
}

export function TimetableFormDialog({
  open,
  onOpenChange,
  mode,
  courses,
  entry,
  initialDay,
  initialPeriod,
  periodTimes,
  onSaved,
}: TimetableFormDialogProps) {
  const [courseId, setCourseId] = useState('');
  const [day, setDay] = useState('1');
  const [period, setPeriod] = useState('1');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [room, setRoom] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const editing = mode === 'edit' && entry;
    const p = editing ? entry.period_number : (initialPeriod ?? 1);
    setCourseId(editing ? entry.course_id : '');
    setDay(String(editing ? entry.day_of_week : (initialDay ?? 1)));
    setPeriod(String(p));
    setStart(editing ? entry.start_time : (periodTimes[p]?.start ?? ''));
    setEnd(editing ? entry.end_time : (periodTimes[p]?.end ?? ''));
    setRoom(editing ? entry.room : '');
    setBusy(false);
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, entry, initialDay, initialPeriod]);

  // Picking a period suggests the times other classes in that period already use.
  const changePeriod = (value: string) => {
    setPeriod(value);
    const known = periodTimes[Number(value)];
    if (known) {
      setStart(known.start);
      setEnd(known.end);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (mode === 'create' && !courseId) {
      setError('Choose a course.');
      return;
    }
    if (end <= start) {
      setError('End time must be after the start time.');
      return;
    }
    setBusy(true);
    const slot = {
      day_of_week: Number(day),
      period_number: Number(period),
      start_time: start,
      end_time: end,
      room: room.trim(),
    };
    try {
      if (mode === 'create' || !entry) {
        await api.post('/timetable', { ...slot, course_id: courseId });
      } else {
        await api.patch(`/timetable/${entry.id}`, slot);
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
          <DialogTitle>{mode === 'create' ? 'Add a class' : 'Edit class'}</DialogTitle>
          <DialogDescription>
            A teacher, room or course cannot be booked twice at the same time. Back-to-back classes are fine.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tt-course">Course</Label>
            {mode === 'create' ? (
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger id="tt-course">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.code} · {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p id="tt-course" className="text-sm text-site-text">
                {entry?.course_code} · {entry?.course_name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tt-day">Day</Label>
              <Select value={day} onValueChange={setDay}>
                <SelectTrigger id="tt-day">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAY_NAMES.map((name, i) => (
                    <SelectItem key={name} value={String(i + 1)}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tt-period">Period</Label>
              <Select value={period} onValueChange={changePeriod}>
                <SelectTrigger id="tt-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: MAX_PERIODS }, (_, i) => i + 1).map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      Period {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tt-start">Starts</Label>
              <Input id="tt-start" type="time" required value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tt-end">Ends</Label>
              <Input id="tt-end" type="time" required value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tt-room">Room</Label>
            <Input
              id="tt-room"
              required
              maxLength={50}
              placeholder="e.g. Room 204"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="destructive" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : mode === 'create' ? 'Add class' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
