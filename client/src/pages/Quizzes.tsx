import { useGet } from '@/hooks/useApi.ts';
import { Button } from '@/components/ui/button.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Quiz {
  id: string;
  course_id: string;
  title: string;
  time_limit_minutes: number | null;
  is_published: boolean;
  created_at: string;
}

export default function QuizzesPage() {
  const { data, isLoading } = useGet<{ quizzes: Quiz[] }>(
    ['quizzes'],
    '/api/quizzes',
  );

  const quizzes = data?.quizzes ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quizzes</h1>
          <p className="text-muted-foreground">Auto-graded assessments.</p>
        </div>
        <Button asChild>
          <Link to="/quizzes/new">
            <Plus className="w-4 h-4 mr-2" /> New Quiz
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground">Loading quizzes...</div>
      ) : (
        <div className="rounded-xl border border-input bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="w-32">Time Limit</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizzes.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-medium">
                    <Link to={`/quizzes/${q.id}`} className="hover:underline">{q.title}</Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {q.time_limit_minutes ? `${q.time_limit_minutes} min` : 'No limit'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={q.is_published ? 'success' : 'default'}>
                      {q.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right"></TableCell>
                </TableRow>
              ))}
              {quizzes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                    No quizzes found.
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

