import useAuth from '@/hooks/useAuth.ts';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { MessageCircle } from 'lucide-react';
import api from '@/lib/api.ts';
import { useToast } from '@/components/ui/toast.tsx';

interface Thread {
  id: string;
  course_id: string;
  title: string;
  author_id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  reply_count: number;
}

export default function DiscussionsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [threads, setThreads] = useState<Thread[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchThreads();
  }, [isAuthenticated]);

  async function fetchThreads() {
    try {
      const res = await api.get<{ threads: Thread[] }>('/discussions/course-demo');
      setThreads(res.data.threads);
    } catch (err: any) {
      toast({ title: 'Failed to load discussions', description: err.message, variant: 'destructive' });
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await api.post('/discussions', { course_id: 'demo', title });
      setTitle('');
      fetchThreads();
    } catch (err: any) {
      toast({ title: 'Failed to create discussion', description: err.message, variant: 'destructive' });
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
          <h1 className="text-2xl font-bold text-site-text">Course Discussions</h1>
          <p className="text-site-muted">Ask questions and collaborate with classmates.</p>
        </div>

        <form onSubmit={handleCreate} className="flex gap-2 mb-8">
          <Input
            placeholder="Start a new discussion..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" className="bg-primary text-white hover:bg-blue-700 px-6 py-2">
            Post
          </Button>
        </form>

        {threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <MessageCircle className="w-16 h-16 text-site-muted/30 mb-4" />
            <h3 className="font-bold text-site-text mb-2">No discussions yet</h3>
            <p className="text-site-muted">Be the first to start one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {threads.map((t) => (
              <div key={t.id} className="rounded-xl border border-site-border bg-site-card p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2 mb-2">
                  <h3 className="font-bold text-site-text">{t.title}</h3>
                  <div className="text-xs text-site-muted">
                    {new Date(t.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-site-muted">
                  <MessageCircle className="w-3 h-3" />
                  <span>{t.first_name} {t.last_name}</span>
                  <span className="mx-1">·</span>
                  <span>{t.reply_count} replies</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
