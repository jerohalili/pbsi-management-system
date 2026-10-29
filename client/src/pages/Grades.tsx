import useAuth from '@/hooks/useAuth.ts';
import { useEffect, useState } from 'react';

import api from '@/lib/api.ts';
import { formatAverage } from '@/lib/utils.ts';
import { useToast } from '@/components/ui/toast.tsx';
import { Button } from '@/components/ui/button.tsx';
import { AdjustGradeDialog, AdjustGradeTarget } from '@/components/grades/AdjustGradeDialog.tsx';

interface Grade {
  id: string;
  course_code: string;
  course_name: string;
  assessment_type: string;
  assessment_id: string;
  assessment_title: string | null;
  // Postgres `numeric` reaches the browser as a string (e.g. "80.00"); it is a percentage 0-100.
  score: number | string;
  feedback: string | null;
  term: string;
  created_at: string;
  first_name: string;
  last_name: string;
  student_number: string;
}

/** Average of all grade percentages (the API still calls it gpa). */
interface GPA {
  cumulative_gpa: number | null;
  total_assessments: number;
}

export default function GradesPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [gpa, setGPA] = useState<GPA | null>(null);
  const [adjusting, setAdjusting] = useState<AdjustGradeTarget | null>(null);

  // Teachers (their own courses) and admins (all courses) see every student's grades and may adjust them.
  const canManage = user?.role === 'admin' || user?.role === 'teacher';

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchGrades();
  }, [isAuthenticated, canManage]);

  async function fetchGrades() {
    try {
      const gRes = await api.get<{ grades: Grade[] }>('/grades');
      setGrades(gRes.data.grades);
      if (!canManage) {
        const gpaRes = await api.get<{ gpa: GPA }>('/grades/gpa/me');
        setGPA(gpaRes.data.gpa);
      }
    } catch (err: any) {
      toast({ title: 'Failed to load grades', description: err.message, variant: 'destructive' });
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

  return (
    <div className="min-h-screen w-full bg-site-bg px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-site-text">Grades</h1>
          <p className="text-site-muted">
            {user?.role === 'admin'
              ? 'Grades recorded across all courses. You can adjust any of them.'
              : canManage
                ? 'Grades recorded in the courses you teach. You can adjust any of them.'
                : 'View your grades and your average grade.'}
          </p>
        </div>

        {!canManage && (
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <div className="rounded-xl border border-site-border bg-site-card p-6 shadow-sm">
            <h3 className="font-bold text-site-text mb-4">Average grade</h3>
            <div className="flex items-center justify-between">
              <div className="text-4xl font-bold text-site-text">
                {formatAverage(gpa?.cumulative_gpa)}
              </div>
              <div className="text-right">
                <div className="text-xs text-site-muted">Total Assessments</div>
                <div className="text-sm font-medium">{gpa?.total_assessments ?? 0}</div>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-site-border bg-site-card p-6 shadow-sm">
            <h3 className="font-bold text-site-text mb-4">Term Summary</h3>
            <p className="text-site-muted text-sm">
              Term grades are calculated automatically from assignments and quizzes.
            </p>
          </div>
        </div>
        )}

        <div className="rounded-xl border border-site-border bg-site-card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-site-border">
                {canManage && <th className="px-6 py-4 text-sm font-bold text-site-muted">Student</th>}
                <th className="px-6 py-4 text-sm font-bold text-site-muted">Course</th>
                <th className="px-6 py-4 text-sm font-bold text-site-muted">Assessment</th>
                <th className="px-6 py-4 text-sm font-bold text-site-muted">Type</th>
                <th className="px-6 py-4 text-sm font-bold text-site-muted">Score</th>
                <th className="px-6 py-4 text-sm font-bold text-site-muted">Term</th>
                {canManage && <th className="px-6 py-4 text-sm font-bold text-site-muted text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {grades.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 7 : 5} className="px-6 py-8 text-center text-site-muted">
                    No grades recorded yet.
                  </td>
                </tr>
              ) : (
                grades.map((g) => (
                  <tr key={g.id} className="border-b border-site-border">
                    {canManage && (
                      <td className="px-6 py-4 text-sm text-site-text">
                        {g.first_name} {g.last_name}
                        <div className="text-xs text-site-muted">{g.student_number}</div>
                      </td>
                    )}
                    <td className="px-6 py-4 font-medium text-site-text">{g.course_name}</td>
                    <td className="px-6 py-4 text-sm text-site-text">
                      {g.assessment_title ?? `#${g.assessment_id.slice(0, 6)}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-site-muted capitalize">{g.assessment_type}</td>
                    <td className="px-6 py-4 font-medium text-site-text">{formatAverage(g.score)}</td>
                    <td className="px-6 py-4 text-sm text-site-muted">{g.term}</td>
                    {canManage && (
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setAdjusting({
                              gradeId: g.id,
                              studentName: `${g.first_name} ${g.last_name}`,
                              assessmentTitle: g.assessment_title ?? `#${g.assessment_id.slice(0, 6)}`,
                              score: g.score,
                              feedback: g.feedback,
                            })
                          }
                        >
                          Adjust
                        </Button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdjustGradeDialog
        open={adjusting !== null}
        onOpenChange={(open) => !open && setAdjusting(null)}
        target={adjusting}
        onSaved={() => {
          toast({ title: 'Grade updated', variant: 'success' });
          fetchGrades();
        }}
      />
    </div>
  );
}

