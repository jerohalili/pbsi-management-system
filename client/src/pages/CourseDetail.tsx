import { useParams } from 'react-router-dom';
import { useGet } from '@/hooks/useApi.ts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Play, File } from 'lucide-react';

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
  const { id } = useParams<{ id: string }>();
  if (!id) return <div className="p-8 text-center">Invalid course.</div>;

  const { data, isLoading } = useGet<{ course: Course; modules: Module[] }>(
    ['course', id],
    `/api/courses/${id}`,
  );

  const course = data?.course;
  const modules = data?.modules ?? [];

  if (isLoading) return <div className="p-8 text-center">Loading course...</div>;
  if (!course) return <div className="p-8 text-center">Course not found.</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{course.code} — {course.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{course.description ?? 'No description.'}</p>
          <div className="flex gap-2 text-xs text-muted-foreground mt-2">
            <span>Credits: {course.credits}</span>
          </div>
        </CardHeader>
      </Card>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Modules</CardTitle>
            </CardHeader>
            <CardContent>
              {modules.length === 0 ? (
                <p className="text-muted-foreground text-sm">No modules yet.</p>
              ) : (
                <div className="space-y-3">
                  {modules.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg border border-input bg-background hover:bg-muted/50 transition-colors group">
                      <div className="flex w-6 items-center justify-center text-xs font-medium text-muted-foreground group-hover:text-primary">
                        {m.order_index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{m.title}</div>
                        {m.rich_description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {m.rich_description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {m.video_url && (
                          <a href={m.video_url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-muted-foreground hover:text-primary" title="Video">
                            <Play className="w-4 h-4" />
                          </a>
                        )}
                        {m.attachment_url && (
                          <a href={m.attachment_url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-muted-foreground hover:text-primary" title="Attachment">
                            <File className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

