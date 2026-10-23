import { useGet } from '@/hooks/useApi.ts';
import { Clock } from 'lucide-react';

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
  const { data, isLoading } = useGet<{ timetable: TimetableEntry[] }>(
    ['timetable'],
    '/api/timetable',
  );

  const entries = data?.timetable ?? [];

  // Group by day -> period
  const grid: Record<number, Record<number, TimetableEntry>> = {};
  entries.forEach((e) => {
    if (!grid[e.day_of_week]) grid[e.day_of_week] = {};
    grid[e.day_of_week][e.period_number] = e;
  });

  if (isLoading) return <div className="p-8 text-center">Loading timetable...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Weekly Timetable</h1>
        <p className="text-muted-foreground">Class schedule by day and period.</p>
      </div>

      <div className="rounded-xl border border-input bg-card overflow-hidden">
        <div className="grid grid-cols-6 border-b border-input">
          <div className="px-3 py-4 font-semibold text-muted-foreground border-r border-input">Period</div>
          {DAYS.map((day) => (
            <div key={day} className="px-3 py-4 font-semibold text-center border-r border-input bg-muted/50">
              {day}
            </div>
          ))}
        </div>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((_period) => (
          <div key={_period} className="grid grid-cols-6 border-b border-input divide-x divide-input">
            <div className="px-3 py-4 font-medium text-muted-foreground border-r border-input bg-muted/50">
              <Clock className="w-4 h-4 mr-1" /> {_period}
            </div>
            {DAYS.map((_day, _dayIdx) => (
              <div
                key={_dayIdx}
                className="px-3 py-3 border-b border-input last:border-b-0 min-h-[80px] flex flex-col gap-1"
              >
                {grid[_dayIdx + 1]?.[_period] ? (
                  <div className="rounded-lg bg-primary p-2 text-primary-foreground text-xs font-medium shadow-sm">
                    <div className="font-semibold">{grid[_dayIdx + 1]![_period]!.course_code}</div>
                    <div className="truncate text-[10px]">{grid[_dayIdx + 1]![_period]!.course_name}</div>
                    <div className="text-[10px]">{grid[_dayIdx + 1]![_period]!.teacher_first_name} {grid[_dayIdx + 1]![_period]!.teacher_last_name}</div>
                    <div className="text-[10px] opacity-80">{grid[_dayIdx + 1]![_period]!.room}</div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

