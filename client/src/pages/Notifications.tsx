import useAuth from '@/hooks/useAuth.ts';
import { useEffect, useState } from 'react';
import { Bell, Clock } from 'lucide-react';
import api from '@/lib/api.ts';
import { useToast } from '@/components/ui/toast.tsx';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifications();
  }, [isAuthenticated]);

  async function fetchNotifications() {
    try {
      const res = await api.get<{ notifications: Notification[] }>('/api/notifications');
      setNotifications(res.data.notifications);
    } catch (err: any) {
      toast({ title: 'Failed to load notifications', description: err.message, variant: 'destructive' });
    }
  }

  async function markRead(id: string) {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (err: any) {
      toast({ title: 'Failed to mark read', description: err.message, variant: 'destructive' });
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
          <h1 className="text-2xl font-bold text-site-text">Notifications</h1>
          <p className="text-site-muted">Alerts for assignments, grades, and announcements.</p>
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bell className="w-16 h-16 text-site-muted/30 mb-4" />
            <p className="text-site-muted">No new notifications.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-site-border bg-site-card overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-site-border">
                  <th className="px-6 py-4 text-sm font-bold text-site-muted">Time</th>
                  <th className="px-6 py-4 text-sm font-bold text-site-muted">Title</th>
                  <th className="px-6 py-4 text-sm font-bold text-site-muted">Message</th>
                  <th className="px-6 py-4 text-sm font-bold text-site-muted">Status</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((n) => (
                  <tr key={n.id} className={`border-b border-site-border ${!n.is_read ? 'bg-primary/5' : ''}`}>
                    <td className="px-6 py-4 text-sm text-site-muted">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(n.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-site-text">{n.title}</td>
                    <td className="px-6 py-4 text-sm text-site-muted">{n.message}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                          n.is_read
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                        onClick={() => markRead(n.id)}
                      >
                        {n.is_read ? 'Read' : 'New'}
                      </span>
                    </td>
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

