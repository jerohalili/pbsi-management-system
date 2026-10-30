import { useId, useRef } from 'react';
import { FileUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Label } from '@/components/ui/label.tsx';
import { formatBytes, type FileRule } from '@/lib/upload.ts';

interface FilePickerProps {
  label: string;
  rule: FileRule;
  file: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

/** One file input with its allowed types, the chosen file, and a clear button. */
export function FilePicker({ label, rule, file, onChange, disabled }: FilePickerProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const clear = () => {
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={rule.accept}
        disabled={disabled}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="block w-full text-sm file:mr-3 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-accent disabled:opacity-50"
      />
      {file ? (
        <div className="flex items-center gap-2 text-sm">
          <FileUp className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 truncate">{file.name}</span>
          <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(file.size)}</span>
          <Button type="button" variant="ghost" size="icon" aria-label="Remove chosen file" onClick={clear} disabled={disabled}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">{rule.hint}</p>
      )}
    </div>
  );
}
