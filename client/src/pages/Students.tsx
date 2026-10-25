import { useState } from 'react';
import { useGet } from '@/hooks/useApi.ts';
import { Button } from '@/components/ui/button.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Student {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  cumulative_gpa: number | null;
  subjects_assigned: string[];
}

export default function StudentsPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useGet<{ students: Student[] }>(
    ['students'],
    `/api/students?search=${encodeURIComponent(search)}`,
  );

  const students = data?.students ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Student Directory</h1>
          <p className="text-muted-foreground">Manage and view student records.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by name or student ID..."
            className="flex h-10 w-64 items-center rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button asChild>
            <Link to="/students/new">
              <User className="w-4 h-4 mr-2" /> Add Student
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-input bg-card">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading students...</div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No students found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-32">Email</TableHead>
                <TableHead className="w-24">GPA</TableHead>
                <TableHead className="w-32">Subjects</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.student_id}</TableCell>
                  <TableCell>
                    <Link to={`/students/${s.id}`} className="font-medium hover:underline">
                      {s.first_name} {s.last_name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.email}</TableCell>
                  <TableCell>
                    <Badge variant={((s.cumulative_gpa ?? 0) >= 3.5 ? 'success' : 'default')}>
                      {s.cumulative_gpa?.toFixed(2) ?? 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {s.subjects_assigned.join(', ') || '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/students/${s.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}


