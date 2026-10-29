import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useGet } from '@/hooks/useApi.ts';
import api from '@/lib/api.ts';
import { getErrorMessage } from '@/lib/errors.ts';

interface RecordCount {
  key: string;
  label: string;
  count: number;
}

interface DeletePreview {
  can_delete: boolean;
  needs_cascade: boolean;
  own_records: RecordCount[];
  blocking_records: RecordCount[];
}

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: { id: string; name: string; email: string } | null;
  /** Called after the account was deleted successfully. */
  onDeleted: () => void;
}

const listRecords = (records: RecordCount[]) =>
  records.map((r) => `${r.count} ${r.label}`).join(', ');

/**
 * Asks the server what deleting this account involves, then shows the matching message:
 * a plain confirmation, an admin-only warning that the account's records go too, or an
 * explanation of why the account can't be deleted.
 */
export function DeleteUserDialog({ open, onOpenChange, target, onDeleted }: DeleteUserDialogProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const {
    data: preview,
    isLoading,
    error: previewError,
  } = useGet<DeletePreview>(
    ['delete-preview', target?.id ?? ''],
    `/users/${target?.id ?? ''}/delete-preview`,
    { enabled: open && target !== null, cacheTime: 0 },
  );

  useEffect(() => {
    if (open) {
      setBusy(false);
      setError('');
    }
  }, [open]);

  const name = target?.name ?? '';
  const email = target?.email ?? '';

  let title = 'Permanently delete account?';
  let description = 'Checking this account’s records…';
  let confirmLabel = 'Delete permanently';
  let canConfirm = false;
  let isWarning = false;

  if (previewError) {
    title = 'Can’t delete this account';
    description = getErrorMessage(previewError);
  } else if (!isLoading && preview) {
    if (preview.blocking_records.length > 0) {
      title = 'Can’t delete this account';
      description = `${name} has ${listRecords(preview.blocking_records)}, so the account can’t be permanently deleted. Deactivate it instead to keep those records.`;
    } else if (preview.own_records.length > 0 && !preview.can_delete) {
      title = 'Can’t delete this account';
      description = `${name} has ${listRecords(preview.own_records)}, so the account can’t be deleted. Deactivate it instead to keep those records, or ask an administrator to delete it.`;
    } else if (preview.own_records.length > 0) {
      title = 'Delete account and all its records?';
      description = `${name} (${email}) has ${listRecords(preview.own_records)}. Deleting this account will also permanently delete all of these records. This cannot be undone.`;
      confirmLabel = 'Delete account and records';
      canConfirm = true;
      isWarning = true;
    } else {
      description = `${name} (${email}) will be removed for good. This cannot be undone.`;
      canConfirm = true;
    }
  }

  const handleConfirm = async () => {
    if (!target) return;
    setBusy(true);
    setError('');
    try {
      await api.delete(`/users/${target.id}`, {
        params: preview?.needs_cascade ? { cascade: 'true' } : undefined,
      });
      onDeleted();
      onOpenChange(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {isWarning && (
          <p className="flex items-start gap-2 text-sm text-destructive">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            Only do this if the account was created by mistake. To keep the history, deactivate the
            account instead.
          </p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            {canConfirm ? 'Cancel' : 'Close'}
          </Button>
          {canConfirm && (
            <Button variant="destructive" onClick={handleConfirm} disabled={busy}>
              {busy ? 'Working…' : confirmLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
