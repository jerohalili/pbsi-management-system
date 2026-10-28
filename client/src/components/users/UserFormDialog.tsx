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
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import api from '@/lib/api.ts';
import { getErrorMessage } from '@/lib/errors.ts';
import { PasswordField, generatePassword } from './PasswordField.tsx';
import { CredentialsNotice } from './CredentialsNotice.tsx';

export type ManagedRole = 'admin' | 'teacher' | 'student';

/** The fields of an account that this dialog can show and edit. */
export interface ManagedUser {
  id: string;
  email: string;
  role: ManagedRole;
  first_name: string;
  last_name: string;
  phone?: string | null;
  date_of_birth?: string | null;
  address?: string | null;
  student_id?: string | null;
  employee_id?: string | null;
}

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  /** Roles the signed-in person may create (a single entry hides the role picker). */
  allowedRoles: ManagedRole[];
  user?: ManagedUser | null;
  /** Called after a successful save so the caller can refresh its list. */
  onSaved: () => void;
}

interface FormState {
  email: string;
  password: string;
  role: ManagedRole;
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth: string;
  address: string;
  id_number: string;
}

const ROLE_LABEL: Record<ManagedRole, string> = {
  admin: 'Administrator',
  teacher: 'Teacher',
  student: 'Student',
};

function initialState(
  mode: 'create' | 'edit',
  allowedRoles: ManagedRole[],
  user?: ManagedUser | null,
): FormState {
  if (mode === 'edit' && user) {
    return {
      email: user.email,
      password: '',
      role: user.role,
      first_name: user.first_name ?? '',
      last_name: user.last_name ?? '',
      phone: user.phone ?? '',
      date_of_birth: user.date_of_birth ? user.date_of_birth.slice(0, 10) : '',
      address: user.address ?? '',
      id_number: (user.role === 'student' ? user.student_id : user.employee_id) ?? '',
    };
  }
  return {
    email: '',
    password: generatePassword(),
    role: allowedRoles[0] ?? 'student',
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: '',
    address: '',
    id_number: '',
  };
}

export function UserFormDialog({
  open,
  onOpenChange,
  mode,
  allowedRoles,
  user,
  onSaved,
}: UserFormDialogProps) {
  const [form, setForm] = useState<FormState>(() => initialState(mode, allowedRoles, user));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);

  useEffect(() => {
    if (open) {
      setForm(initialState(mode, allowedRoles, user));
      setBusy(false);
      setError('');
      setCreated(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, user]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const idLabel = form.role === 'student' ? 'Student ID' : form.role === 'teacher' ? 'Employee ID' : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');

    const profile = {
      email: form.email.trim(),
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      phone: form.phone.trim(),
      date_of_birth: form.date_of_birth,
      address: form.address.trim(),
    };
    const idNumber = form.id_number.trim();
    const idFields =
      idNumber === ''
        ? {}
        : form.role === 'student'
          ? { student_id: idNumber }
          : form.role === 'teacher'
            ? { employee_id: idNumber }
            : {};

    try {
      if (mode === 'create') {
        await api.post('/users', {
          ...profile,
          ...idFields,
          password: form.password,
          role: form.role,
        });
        setCreated({ email: profile.email, password: form.password });
        onSaved();
      } else if (user) {
        await api.patch(`/users/${user.id}`, { ...profile, ...idFields });
        onSaved();
        onOpenChange(false);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const title = mode === 'create' ? `Add ${allowedRoles.length === 1 ? ROLE_LABEL[allowedRoles[0]].toLowerCase() : 'user'}` : 'Edit account';

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{created ? 'Account created' : title}</DialogTitle>
          <DialogDescription>
            {created
              ? 'The account is ready to use.'
              : mode === 'create'
                ? 'Create the account and share the login details with the user.'
                : 'Update this account’s details. Use “Reset password” to change the password.'}
          </DialogDescription>
        </DialogHeader>

        {created ? (
          <>
            <CredentialsNotice email={created.email} password={created.password} />
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {mode === 'create' && allowedRoles.length > 1 && (
              <div className="space-y-2">
                <Label htmlFor="uf-role">Role</Label>
                <select
                  id="uf-role"
                  value={form.role}
                  onChange={(e) => set('role', e.target.value as ManagedRole)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {allowedRoles.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABEL[r]}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="uf-first">First name</Label>
                <Input id="uf-first" required value={form.first_name} onChange={(e) => set('first_name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uf-last">Last name</Label>
                <Input id="uf-last" required value={form.last_name} onChange={(e) => set('last_name', e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="uf-email">Email</Label>
              <Input id="uf-email" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} />
            </div>

            {mode === 'create' && (
              <div className="space-y-2">
                <Label htmlFor="uf-password">Initial password</Label>
                <PasswordField id="uf-password" value={form.password} onChange={(v) => set('password', v)} />
                <p className="text-xs text-muted-foreground">
                  At least 8 characters. You’ll be able to copy it after the account is created.
                </p>
              </div>
            )}

            {idLabel && (
              <div className="space-y-2">
                <Label htmlFor="uf-idnum">{idLabel}</Label>
                <Input
                  id="uf-idnum"
                  value={form.id_number}
                  placeholder={mode === 'create' ? 'Leave blank to generate automatically' : ''}
                  onChange={(e) => set('id_number', e.target.value)}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="uf-phone">Phone (optional)</Label>
                <Input id="uf-phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uf-dob">Date of birth (optional)</Label>
                <Input id="uf-dob" type="date" value={form.date_of_birth} onChange={(e) => set('date_of_birth', e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="uf-address">Address (optional)</Label>
              <Input id="uf-address" value={form.address} onChange={(e) => set('address', e.target.value)} />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <Button type="button" variant="destructive" onClick={() => onOpenChange(false)} disabled={busy}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? 'Saving…' : mode === 'create' ? 'Create account' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
