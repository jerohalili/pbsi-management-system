import useAuth from '@/hooks/useAuth.ts';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.tsx';
import { BookOpen, Plus, Clock } from 'lucide-react';
import api from '@/lib/api.ts';
import { useToast } from '@/components/ui/toast.tsx';

interface Course {
  id: string;
  code: string;
  name: string;
  description: string | null;
  credits: number;
  teacher_first_name: string;
  teacher_last_name: string;
}

export default function CoursesPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchCourses();
  }, [isAuthenticated]);

  async function fetchCourses() {
    try {
      const res = await api.get<{ courses: Course[] }>('/api/courses');
      setCourses(res.data.courses);
    } catch (err: any) {
      toast({ title: 'Failed to load courses', description: err.message, variant: 'destructive' });
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
            <h1 className="text-2xl font-bold text-site-text">Courses</h1>
            <p className="text-site-muted">Browse available courses and modules.</p>
          </div>
          {canCreate && (
            <Button
              onClick={() => navigate('/courses/new')}
              className="bg-primary text-white hover:bg-blue-700 px-6 py-2"
            >
              <Plus className="w-4 h-4 mr-2" /> New Course
            </Button>
          )}
        </div>

        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="w-16 h-16 text-site-muted/30 mb-4" />
            <h3 className="font-bold text-site-text mb-2">No courses yet</h3>
            <p className="text-site-muted">Courses will appear here once they are created.</p>
            {canCreate && (
              <Button
                onClick={() => navigate('/courses/new')}
                className="mt-4 bg-primary text-white hover:bg-blue-700 px-6 py-2"
              >
                Create your first course
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {courses.map((c) => (
              <Card key={c.id} onClick={() => navigate(`/courses/${c.id}`)}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-site-text">{c.code}</h3>
                    <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                      {c.credits} cr
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-site-text mb-2">{c.name}</h2>
                  {c.description && (
                    <p className="text-site-muted text-sm line-clamp-2 mb-4">{c.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-site-muted">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{c.teacher_first_name} {c.teacher_last_name}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      className={`rounded-xl bg-site-card border border-site-border p-6 cursor-pointer hover:bg-primary/5 transition-colors ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      {children}
    </div>
  );
}

