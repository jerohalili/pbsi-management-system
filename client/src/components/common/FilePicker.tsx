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

/**
 * One file input. The browser's own "Choose file" button can't be themed, so the real input is
 * hidden and the app's Button opens it. The label still points at the input for screen readers.
 */
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
        tabIndex={-1}
        className="sr-only"
        // Let the same file be picked again after it was cleared.
        onClick={(e) => {
          e.currentTarget.value = '';
        }}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="default"
          className="h-10 px-4"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          <FileUp className="mr-2 h-4 w-4" />
          {file ? 'Change file' : 'Choose file'}
        </Button>
        {file ? (
          <>
            <span className="min-w-0 max-w-full truncate text-sm">{file.name}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(file.size)}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remove chosen file"
              onClick={clear}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">No file chosen</span>
        )}
      </div>
      {!file && <p className="text-xs text-muted-foreground">{rule.hint}</p>}
    </div>
  );
}
