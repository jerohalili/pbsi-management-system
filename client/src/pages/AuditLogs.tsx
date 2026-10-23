import useAuth from '@/hooks/useAuth.ts';
import { useEffect, useState } from 'react';
import { ShieldAlert, Clock } from 'lucide-react';
import api from '@/lib/api.ts';
import { useToast } from '@/components/ui/toast.tsx';

interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  ip_address: string | null;
  created_at: string;
  first_name: string;
  last_name: string;
}

export default function AuditLogsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchAuditLogs();
  }, [isAuthenticated]);

  async function fetchAuditLogs() {
    try {
      const res = await api.get<{ audit_logs: AuditLog[] }>('/api/audit-logs');
      setLogs(res.data.audit_logs);
    } catch (err: any) {
      toast({ title: 'Failed to load audit logs', description: err.message, variant: 'destructive' });
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
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="w-5 h-5 text-site-muted" />
          <h1 className="text-2xl font-bold text-site-text">Audit Logs</h1>
        </div>
        <p className="text-site-muted mb-8">System activity tracking for admin review.</p>

        <div className="rounded-xl border border-site-border bg-site-card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-site-border">
                <th className="px-6 py-4 text-sm font-bold text-site-muted">Time</th>
                <th className="px-6 py-4 text-sm font-bold text-site-muted">Actor</th>
                <th className="px-6 py-4 text-sm font-bold text-site-muted">Action</th>
                <th className="px-6 py-4 text-sm font-bold text-site-muted">Entity</th>
                <th className="px-6 py-4 text-sm font-bold text-site-muted">Entity ID</th>
                <th className="px-6 py-4 text-sm font-bold text-site-muted">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-site-muted">
                    No audit logs recorded.
                  </td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="border-b border-site-border">
                    <td className="px-6 py-4 text-sm text-site-muted">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-site-text">
                      {l.first_name} {l.last_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-site-muted">{l.action}</td>
                    <td className="px-6 py-4 text-sm text-site-muted">{l.entity_type}</td>
                    <td className="px-6 py-4 text-sm text-site-muted truncate max-w-xs">{l.entity_id}</td>
                    <td className="px-6 py-4 text-sm text-site-muted">{l.ip_address ?? '—'}</td>
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
