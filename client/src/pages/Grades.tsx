import { useGet } from '@/hooks/useApi.ts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx';
import { Award } from 'lucide-react';

interface Grade {
  id: string;
  course_code: string;
  course_name: string;
  assessment_type: string;
  assessment_id: string;
  score: number;
  feedback: string | null;
  term: string;
  created_at: string;
}

interface GPA {
  cumulative_gpa: number | null;
  total_assessments: number;
}

export default function GradesPage() {
  const { data, isLoading } = useGet<{ grades: Grade[] }>(
    ['grades'],
    '/api/grades',
  );
  const { data: gpaData } = useGet<{ gpa: GPA }>(
    ['gpa'],
    '/api/grades/gpa/me',
    { enabled: false },
  );

  const grades = data?.grades ?? [];
  const gpa = gpaData?.gpa;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Grades &amp; GPA</h1>
          <p className="text-muted-foreground">View your grades and cumulative GPA.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" /> Cumulative GPA
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-4xl font-bold">
              {gpa?.cumulative_gpa?.toFixed(2) ?? 'N/A'}
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Total Assessments</div>
              <div className="text-sm font-medium">{gpa?.total_assessments ?? 0}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Term Summary</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Term grades are calculated automatically from assignments and quizzes.
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gradebook</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">Loading grades...</div>
          ) : (
            <div className="rounded-xl border border-input">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead className="w-32">Assessment</TableHead>
                    <TableHead className="w-20">Type</TableHead>
                    <TableHead className="w-20">Score</TableHead>
                    <TableHead className="w-24">Term</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell className="font-medium">{g.course_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">#{g.assessment_id.slice(0, 6)}</TableCell>
                      <TableCell className="text-muted-foreground">{g.assessment_type}</TableCell>
                      <TableCell className="font-medium">{g.score}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{g.term}</TableCell>
                    </TableRow>
                  ))}
                  {grades.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                        No grades recorded yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

