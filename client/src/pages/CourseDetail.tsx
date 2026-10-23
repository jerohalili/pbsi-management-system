import useAuth from '@/hooks/useAuth.ts';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button.tsx';
import { Play, File, ChevronLeft } from 'lucide-react';
import api from '@/lib/api.ts';
import { useToast } from '@/components/ui/toast.tsx';

interface Module {
  id: string;
  title: string;
  rich_description: string | null;
  video_url: string | null;
  attachment_url: string | null;
  order_index: number;
}

interface Course {
  id: string;
  code: string;
  name: string;
  description: string | null;
  credits: number;
}

export default function CourseDetailPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  useEffect(() => {
    if (!isAuthenticated || !id) return;
    fetchCourse();
  }, [isAuthenticated, id]);

  async function fetchCourse() {
    try {
      const res = await api.get<{ course: Course; modules: Module[] }>(`/api/courses/${id}`);
      setCourse(res.data.course);
      setModules(res.data.modules);
    } catch (err: any) {
      toast({ title: 'Failed to load course', description: err.message, variant: 'destructive' });
    }
  }

  if (isLoading || !course) {
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

  const canEdit = user?.role === 'admin' || user?.role === 'teacher';

  return (
    <div className="min-h-screen w-full bg-site-bg px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <Button
              onClick={() => navigate('/courses')}
              className="text-sm bg-transparent hover:bg-primary/10 text-primary px-3 py-1.5 mr-2"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to courses
            </Button>
            <h1 className="text-2xl font-bold text-site-text">{course.code} — {course.name}</h1>
            <p className="text-site-muted">{course.description || 'No description available.'}</p>
          </div>
          {canEdit && (
            <Button onClick={() => navigate(`/courses/${id}/edit`)} className="bg-primary text-white hover:bg-blue-700 px-6 py-2">
              Edit Course
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="col-span-1 md:col-span-1 lg:col-span-1">
            <div className="rounded-xl border border-site-border bg-site-card p-6 shadow-sm">
              <h3 className="font-bold text-site-text mb-4">Course Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-site-muted">Credits</span>
                  <span className="text-site-text font-medium">{course.credits}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-site-muted">Course Code</span>
                  <span className="text-site-text font-mono">{course.code}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="font-bold text-site-text mb-4">Modules</h2>
          {modules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <File className="w-16 h-16 text-site-muted/30 mb-4" />
              <h3 className="font-bold text-site-text mb-2">No modules yet</h3>
              <p className="text-site-muted">Add modules to organize course content.</p>
              {canEdit && (
                <Button
                  onClick={() => navigate(`/courses/${id}/modules/new`)}
                  className="mt-4 bg-primary text-white hover:bg-blue-700 px-6 py-2"
                >
                  Add Module
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {modules.map((m) => (
                <div key={m.id} className="flex items-center gap-4 p-4 rounded-xl border border-site-border bg-site-card">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {m.order_index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-site-text">{m.title}</h3>
                    {m.rich_description && (
                      <p className="text-sm text-site-muted line-clamp-1 mt-1">{m.rich_description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {m.video_url && (
                      <a href={m.video_url} target="_blank" rel="noopener noreferrer" className="p-2 text-primary hover:bg-primary/10 rounded-lg" title="Video">
                        <Play className="w-4 h-4" />
                      </a>
                    )}
                    {m.attachment_url && (
                      <a href={m.attachment_url} target="_blank" rel="noopener noreferrer" className="p-2 text-primary hover:bg-primary/10 rounded-lg" title="Attachment">
                        <File className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

