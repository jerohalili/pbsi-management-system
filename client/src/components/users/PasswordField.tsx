import { useState } from 'react';
import { Eye, EyeOff, Wand2 } from 'lucide-react';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

export function generatePassword(length = 12): string {
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (n) => CHARS[n % CHARS.length]).join('');
}

interface PasswordFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
}

export function PasswordField({ id, value, onChange }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          autoComplete="new-password"
          minLength={8}
          required
          onChange={(e) => onChange(e.target.value)}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 px-3 text-muted-foreground hover:text-foreground"
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          onChange(generatePassword());
          setVisible(true);
        }}
      >
        <Wand2 className="w-4 h-4 mr-2" /> Generate
      </Button>
    </div>
  );
}
