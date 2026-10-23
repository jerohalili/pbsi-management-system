import useAuth from '@/hooks/useAuth.ts';
import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import api from '@/lib/api.ts';
import { useToast } from '@/components/ui/toast.tsx';

interface TimetableEntry {
  id: string;
  day_of_week: number;
  period_number: number;
  start_time: string;
  end_time: string;
  room: string;
  course_code: string;
  course_name: string;
  teacher_first_name: string;
  teacher_last_name: string;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export default function TimetablePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<TimetableEntry[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchTimetable();
  }, [isAuthenticated]);

  async function fetchTimetable() {
    try {
      const res = await api.get<{ timetable: TimetableEntry[] }>('/api/timetable');
      setEntries(res.data.timetable);
    } catch (err: any) {
      toast({ title: 'Failed to load timetable', description: err.message, variant: 'destructive' });
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-site-bg flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-2 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-site-border"></div>
          <p className="text-site-muted text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Group by day -> period
  const grid: Record<number, Record<number, TimetableEntry>> = {};
  entries.forEach((e) => {
    if (!grid[e.day_of_week]) grid[e.day_of_week] = {};
    grid[e.day_of_week][e.period_number] = e;
  });

  return (
    <div className="min-h-screen w-full bg-site-bg px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-site-text">Weekly Timetable</h1>
          <p className="text-site-muted">Class schedule by day and period.</p>
        </div>

        <div className="rounded-xl border border-site-border bg-site-card overflow-hidden">
          <div className="grid grid-cols-6 border-b border-site-border">
            <div className="px-3 py-4 font-bold text-site-text border-r border-site-border">Period</div>
            {DAYS.map((day) => (
              <div key={day} className="px-3 py-4 font-bold text-center border-r border-site-border bg-primary/5">
                {day}
              </div>
            ))}
          </div>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((period) => (
            <div key={period} className="grid grid-cols-6 border-b border-site-border divide-x divide-site-border">
              <div className="px-3 py-4 font-medium text-site-muted border-r border-site-border bg-gray-50">
                <Clock className="w-4 h-4 mr-1" /> {period}
              </div>
              {DAYS.map((_day, dayIdx) => (
                <div
                  key={dayIdx}
                  className="px-3 py-3 border-b border-site-border last:border-b-0 min-h-[80px] flex flex-col gap-1"
                >
                  {grid[dayIdx + 1]?.[period] ? (
                    <div className="rounded-lg bg-primary p-2 text-white shadow-sm">
                      <div className="font-bold text-sm">{grid[dayIdx + 1]![period]!.course_code}</div>
                      <div className="truncate text-xs">{grid[dayIdx + 1]![period]!.course_name}</div>
                      <div className="text-[10px] opacity-80">
                        {grid[dayIdx + 1]![period]!.teacher_first_name} {grid[dayIdx + 1]![period]!.teacher_last_name}
                      </div>
                      <div className="text-[10px] opacity-80">{grid[dayIdx + 1]![period]!.room}</div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

