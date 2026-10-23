import { useGet } from '@/hooks/useApi.ts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx';
import { ShieldAlert, Clock } from 'lucide-react';

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
  const { data, isLoading } = useGet<{ audit_logs: AuditLog[] }>(
    ['audit-logs'],
    '/api/audit-logs',
  );

  const logs = data?.audit_logs ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Audit Logs</h1>
      </div>
      <p className="text-muted-foreground">
        System activity tracking for admin review.
      </p>

      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground">Loading audit logs...</div>
      ) : (
        <div className="rounded-xl border border-input bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Time</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead className="w-32">Action</TableHead>
                <TableHead className="w-32">Entity</TableHead>
                <TableHead className="w-24">Entity ID</TableHead>
                <TableHead className="w-32">IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="text-muted-foreground text-sm">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(l.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {l.first_name} {l.last_name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{l.action}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{l.entity_type}</TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate max-w-xs">{l.entity_id}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{l.ip_address ?? '—'}</TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-4">
                    No audit logs recorded.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

