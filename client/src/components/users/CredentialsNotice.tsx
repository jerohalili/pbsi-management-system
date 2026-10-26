import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';

interface CredentialsNoticeProps {
  email: string;
  password: string;
}

/** Shown once after creating an account or resetting a password. */
export function CredentialsNotice({ email, password }: CredentialsNoticeProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`Email: ${email}\nPassword: ${password}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be unavailable (e.g. insecure context); the values are visible to copy by hand.
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Share these credentials with the user. The password is not stored in readable form and
        cannot be shown again after you close this window.
      </p>
      <div className="rounded-lg border border-input bg-muted/40 p-4 text-sm space-y-1 font-mono break-all">
        <div>Email: {email}</div>
        <div>Password: {password}</div>
      </div>
      <Button type="button" variant="outline" onClick={copy}>
        {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
        {copied ? 'Copied' : 'Copy credentials'}
      </Button>
    </div>
  );
}
