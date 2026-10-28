import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Label } from '@/components/ui/label.tsx';
import api from '@/lib/api.ts';
import { getErrorMessage } from '@/lib/errors.ts';
import { PasswordField } from './PasswordField.tsx';
import { CredentialsNotice } from './CredentialsNotice.tsx';

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: { id: string; email: string; name: string } | null;
}

export function ResetPasswordDialog({ open, onOpenChange, target }: ResetPasswordDialogProps) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) {
      setPassword('');
      setBusy(false);
      setError('');
      setDone(false);
    }
  }, [open]);

  if (!target) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post(`/users/${target.id}/reset-password`, { password });
      setDone(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>
            Set a new password for {target.name} ({target.email}).
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <>
            <CredentialsNotice email={target.email} password={password} />
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-password">New password</Label>
              <PasswordField id="reset-password" value={password} onChange={setPassword} />
              <p className="text-xs text-muted-foreground">At least 8 characters.</p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="destructive" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy || password.length < 8}>
                {busy ? 'Saving…' : 'Reset password'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
