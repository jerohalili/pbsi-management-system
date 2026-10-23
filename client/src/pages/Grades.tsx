import useAuth from '@/hooks/useAuth.ts';
import { useEffect, useState } from 'react';

import api from '@/lib/api.ts';
import { useToast } from '@/components/ui/toast.tsx';

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
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [gpa, setGPA] = useState<GPA | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchGrades();
  }, [isAuthenticated]);

  async function fetchGrades() {
    try {
      const [gRes, gpaRes] = await Promise.all([
        api.get<{ grades: Grade[] }>('/api/grades'),
        api.get<{ gpa: GPA }>('/api/grades/gpa/me'),
      ]);
      setGrades(gRes.data.grades);
      setGPA(gpaRes.data.gpa);
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
          <h1 className="text-2xl font-bold text-site-text">Grades &amp; GPA</h1>
          <p className="text-site-muted">View your grades and cumulative GPA.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <div className="rounded-xl border border-site-border bg-site-card p-6 shadow-sm">
            <h3 className="font-bold text-site-text mb-4">Cumulative GPA</h3>
            <div className="flex items-center justify-between">
              <div className="text-4xl font-bold text-site-text">
                {gpa?.cumulative_gpa?.toFixed(2) ?? 'N/A'}
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

        <div className="rounded-xl border border-site-border bg-site-card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-site-border">
                <th className="px-6 py-4 text-sm font-bold text-site-muted">Course</th>
                <th className="px-6 py-4 text-sm font-bold text-site-muted">Assessment</th>
                <th className="px-6 py-4 text-sm font-bold text-site-muted">Type</th>
                <th className="px-6 py-4 text-sm font-bold text-site-muted">Score</th>
                <th className="px-6 py-4 text-sm font-bold text-site-muted">Term</th>
              </tr>
            </thead>
            <tbody>
              {grades.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-site-muted">
                    No grades recorded yet.
                  </td>
                </tr>
              ) : (
                grades.map((g) => (
                  <tr key={g.id} className="border-b border-site-border">
                    <td className="px-6 py-4 font-medium text-site-text">{g.course_name}</td>
                    <td className="px-6 py-4 text-sm text-site-muted">#{g.assessment_id.slice(0, 6)}</td>
                    <td className="px-6 py-4 text-sm text-site-muted">{g.assessment_type}</td>
                    <td className="px-6 py-4 font-medium text-site-text">{g.score}</td>
                    <td className="px-6 py-4 text-sm text-site-muted">{g.term}</td>
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

