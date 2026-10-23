import { useGet } from '@/hooks/useApi.ts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx';
import { Bell, Clock } from 'lucide-react';

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
  const { data, isLoading } = useGet<{ notifications: Notification[] }>(
    ['notifications'],
    '/api/notifications',
  );

  const notifications = data?.notifications ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">Alerts for assignments, grades, and announcements.</p>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          <Bell className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p>No new notifications.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-input bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Time</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="w-24">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((n) => (
                <TableRow
                  key={n.id}
                  className={!n.is_read ? 'bg-muted/50' : undefined}
                >
                  <TableCell className="text-muted-foreground text-sm">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(n.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className={!n.is_read ? 'font-medium' : ''}>
                    {n.title}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {n.message}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                        n.is_read
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      }`}
                    >
                      {n.is_read ? 'Read' : 'New'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

