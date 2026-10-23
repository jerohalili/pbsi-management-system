import { useGet } from '@/hooks/useApi.ts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';

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
  const [title, setTitle] = useState('');
  const { data, isLoading } = useGet<{ threads: Thread[] }>(
    ['discussions'],
    '/api/discussions/course-demo',
  );

  const threads = data?.threads ?? [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await fetch('/api/discussions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id: 'demo', title }),
    });
    setTitle('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Course Discussions</h1>
        <p className="text-muted-foreground">Ask questions and collaborate with classmates.</p>
      </div>

      <form onSubmit={handleCreate} className="flex gap-2">
        <Input
          placeholder="Start a new discussion..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">Post</Button>
      </form>

      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground">Loading discussions...</div>
      ) : (
        <div className="space-y-3">
          {threads.map((t) => (
            <Card key={t.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.title}</CardTitle>
                <div className="text-xs text-muted-foreground">
                  {new Date(t.created_at).toLocaleDateString()}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MessageCircle className="w-3 h-3" />
                  <span>{t.first_name} {t.last_name}</span>
                  <span className="mx-1">·</span>
                  <span>{t.reply_count} replies</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {threads.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No discussions yet. Be the first to start one!
            </div>
          )}
        </div>
      )}
    </div>
  );
}

