import useAuth from '@/hooks/useAuth.ts';
import { useEffect, useState } from 'react';
import api from '@/lib/api.ts';
import { useToast } from '@/components/ui/toast.tsx';

interface AttendanceRecord {
  id: string;
  student_id: string;
  course_id: string;
  date: string;
  status: string;
  first_name: string;
  last_name: string;
}

interface Summary {
  present_count: number;
  absent_count: number;
  late_count: number;
  excused_count: number;
  total_count: number;
  attendance_percentage: number | null;
}

export default function AttendancePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchAttendance();
  }, [isAuthenticated, date]);

  async function fetchAttendance() {
    try {
      const [recRes, sumRes] = await Promise.all([
        api.get<{ attendance: AttendanceRecord[] }>(`/attendance?date=${date}`),
        api.get<{ summary: Summary }>(`/attendance/summary/me`),
      ]);
      setRecords(recRes.data.attendance);
      setSummary(sumRes.data.summary);
    } catch (err: any) {
      toast({ title: 'Failed to load attendance', description: err.message, variant: 'destructive' });
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

  const statusColors: Record<string, string> = {
    present: 'bg-green-100 text-green-700',
    absent: 'bg-red-100 text-red-700',
    late: 'bg-amber-100 text-amber-700',
    excused: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="min-h-screen w-full bg-site-bg px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-site-text">Attendance</h1>
            <p className="text-site-muted">Track daily class attendance.</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex h-10 items-center rounded-md border border-site-border bg-site-card px-3 py-2 text-sm"
            />
          </div>
        </div>

        {summary && (
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            {[
              { label: 'Present', value: summary.present_count, color: 'text-green-700' },
              { label: 'Absent', value: summary.absent_count, color: 'text-red-700' },
              { label: 'Late', value: summary.late_count, color: 'text-amber-700' },
              { label: 'Percentage', value: `${summary.attendance_percentage ?? 0}%`, color: 'text-primary' },
            ].map((s, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle>{s.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{s.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="rounded-xl border border-site-border bg-site-card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-site-border">
                <th className="px-6 py-4 text-sm font-bold text-site-muted">Student</th>
                <th className="px-6 py-4 text-sm font-bold text-site-muted">Date</th>
                <th className="px-6 py-4 text-sm font-bold text-site-muted">Status</th>
                <th className="px-6 py-4 text-sm font-bold text-site-muted"></th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-site-muted">
                    No attendance records for this date.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="border-b border-site-border">
                    <td className="px-6 py-4 font-medium text-site-text">{r.first_name} {r.last_name}</td>
                    <td className="px-6 py-4 text-site-muted text-sm">
                      {new Date(r.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[r.status] || ''}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right"></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-site-border bg-site-card p-6 shadow-sm">
      {children}
    </div>
  );
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-2">{children}</div>;
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-medium text-site-text">{children}</div>;
}

function CardContent({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
