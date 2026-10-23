import { useGet } from '@/hooks/useApi.ts';
import { Button } from '@/components/ui/button.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx';
import { Plus, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Assignment {
  id: string;
  module_id: string;
  title: string;
  instructions: string | null;
  due_date: string;
  max_score: number;
  created_at: string;
}

export default function AssignmentsPage() {
  const { data, isLoading } = useGet<{ assignments: Assignment[] }>(
    ['assignments'],
    '/api/assignments',
  );

  const assignments = data?.assignments ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Assignments</h1>
          <p className="text-muted-foreground">View and manage course assignments.</p>
        </div>
        <Button asChild>
          <Link to="/assignments/new">
            <Plus className="w-4 h-4 mr-2" /> New Assignment
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground">Loading assignments...</div>
      ) : (
        <div className="rounded-xl border border-input bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="w-40">Instructions</TableHead>
                <TableHead className="w-32">Due Date</TableHead>
                <TableHead className="w-20">Max Score</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">
                    <Link to={`/assignments/${a.id}`} className="hover:underline">{a.title}</Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground line-clamp-1">
                    {a.instructions ?? '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(a.due_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{a.max_score}</TableCell>
                  <TableCell className="text-right"></TableCell>
                </TableRow>
              ))}
              {assignments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                    No assignments found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

