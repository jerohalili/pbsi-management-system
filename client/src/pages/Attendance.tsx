import { useState } from 'react';
import { useGet } from '@/hooks/useApi.ts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx';
import { Badge as BadgeUI } from '@/components/ui/badge.tsx';

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
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const { data } = useGet<{ attendance: AttendanceRecord[] }>(
    ['attendance', date],
    `/api/attendance?date=${date}`,
  );
  const { data: summaryData } = useGet<{ summary: Summary }>(
    ['attendance-summary'],
    '/api/attendance/summary/student-me',
    { enabled: false },
  );

  const records = data?.attendance ?? [];
  const summary = summaryData?.summary;

  const statusColors: Record<string, string> = {
    present: 'success',
    absent: 'destructive',
    late: 'warning',
    excused: 'default',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">Track daily class attendance.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex h-10 items-center rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      {summary && (
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: 'Present', value: summary.present_count, color: 'success' },
            { label: 'Absent', value: summary.absent_count, color: 'destructive' },
            { label: 'Late', value: summary.late_count, color: 'warning' },
            { label: 'Percentage', value: `${summary.attendance_percentage ?? 0}%`, color: 'primary' },
          ].map((s, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-input bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Student</TableHead>
              <TableHead className="w-32">Date</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.first_name} {r.last_name}</TableCell>
                <TableCell className="text-muted-foreground">{new Date(r.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <BadgeUI variant={statusColors[r.status] as any}>
                    {r.status}
                  </BadgeUI>
                </TableCell>
                <TableCell className="text-right"></TableCell>
              </TableRow>
            ))}
            {records.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                  No attendance records for this date.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

