import useAuth from '@/hooks/useAuth.ts';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.tsx';
import { ClipboardList, Plus } from 'lucide-react';
import api from '@/lib/api.ts';
import { useToast } from '@/components/ui/toast.tsx';

interface Quiz {
  id: string;
  course_id: string;
  title: string;
  time_limit_minutes: number | null;
  is_published: boolean;
  created_at: string;
}

export default function QuizzesPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchQuizzes();
  }, [isAuthenticated]);

  async function fetchQuizzes() {
    try {
      const res = await api.get<{ quizzes: Quiz[] }>('/api/quizzes');
      setQuizzes(res.data.quizzes);
    } catch (err: any) {
      toast({ title: 'Failed to load quizzes', description: err.message, variant: 'destructive' });
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

  const canCreate = user?.role === 'admin' || user?.role === 'teacher';

  return (
    <div className="min-h-screen w-full bg-site-bg px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-site-text">Quizzes</h1>
            <p className="text-site-muted">Auto-graded assessments.</p>
          </div>
          {canCreate && (
            <Button onClick={() => navigate('/quizzes/new')} className="bg-primary text-white hover:bg-blue-700 px-6 py-2">
              <Plus className="w-4 h-4 mr-2" /> New Quiz
            </Button>
          )}
        </div>

        {quizzes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ClipboardList className="w-16 h-16 text-site-muted/30 mb-4" />
            <h3 className="font-bold text-site-text mb-2">No quizzes yet</h3>
            <p className="text-site-muted">Quizzes will appear here once they are created.</p>
            {canCreate && (
              <Button
                onClick={() => navigate('/quizzes/new')}
                className="mt-4 bg-primary text-white hover:bg-blue-700 px-6 py-2"
              >
                Create your first quiz
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-site-border bg-site-card overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-site-border">
                  <th className="px-6 py-4 text-sm font-bold text-site-muted">Title</th>
                  <th className="px-6 py-4 text-sm font-bold text-site-muted">Time Limit</th>
                  <th className="px-6 py-4 text-sm font-bold text-site-muted">Status</th>
                  <th className="px-6 py-4 text-sm font-bold text-site-muted"></th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((q) => (
                  <tr key={q.id} className="border-b border-site-border hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-site-text">{q.title}</td>
                    <td className="px-6 py-4 text-site-muted text-sm">
                      {q.time_limit_minutes ? `${q.time_limit_minutes} min` : 'No limit'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        q.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}
                      >
                        {q.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right"></td>
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

