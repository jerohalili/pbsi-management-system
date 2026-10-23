import useAuth from '@/hooks/useAuth.ts';
import { useEffect, useState } from 'react';
import { FileText, Clock } from 'lucide-react';
import api from '@/lib/api.ts';
import { useToast } from '@/components/ui/toast.tsx';

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
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchAssignments();
  }, [isAuthenticated]);

  async function fetchAssignments() {
    try {
      const res = await api.get<{ assignments: Assignment[] }>('/api/assignments');
      setAssignments(res.data.assignments);
    } catch (err: any) {
      toast({ title: 'Failed to load assignments', description: err.message, variant: 'destructive' });
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-site-text">Assignments</h1>
            <p className="text-site-muted">View and manage course assignments.</p>
          </div>
        </div>

        {assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="w-16 h-16 text-site-muted/30 mb-4" />
            <h3 className="font-bold text-site-text mb-2">No assignments yet</h3>
            <p className="text-site-muted">Assignments will appear here once they are created.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-site-border bg-site-card overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-site-border">
                  <th className="px-6 py-4 text-sm font-bold text-site-muted">Title</th>
                  <th className="px-6 py-4 text-sm font-bold text-site-muted">Instructions</th>
                  <th className="px-6 py-4 text-sm font-bold text-site-muted">Due Date</th>
                  <th className="px-6 py-4 text-sm font-bold text-site-muted">Max Score</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id} className="border-b border-site-border hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-site-text">{a.title}</div>
                    </td>
                    <td className="px-6 py-4 text-site-muted text-sm">
                      {a.instructions || '—'}
                    </td>
                    <td className="px-6 py-4 text-site-muted text-sm">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(a.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-site-text font-medium">{a.max_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
