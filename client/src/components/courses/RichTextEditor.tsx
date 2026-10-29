import { useEffect, useState } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TableKit } from '@tiptap/extension-table';
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Underline as UnderlineIcon,
  Undo2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Input } from '@/components/ui/input.tsx';
import { cn } from '@/lib/utils.ts';

interface RichTextEditorProps {
  /** Initial HTML. The editor owns its content afterwards, so remount (key) to load a new value. */
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
}

interface ToolbarButtonProps {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function ToolbarButton({ label, icon: Icon, active, disabled, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      // Keep the selection in the editor when the button is pressed.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors',
        'hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-40',
        active && 'bg-primary/15 text-primary',
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function normalizeHref(raw: string): string {
  const value = raw.trim();
  if (!value) return '';
  return /^(https?:\/\/|mailto:)/i.test(value) ? value : `https://${value}`;
}

function Toolbar({ editor, disabled }: { editor: Editor; disabled?: boolean }) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState('');

  // The editor does not re-render React on every keystroke, so read the active state explicitly.
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      underline: e.isActive('underline'),
      h2: e.isActive('heading', { level: 2 }),
      h3: e.isActive('heading', { level: 3 }),
      bullet: e.isActive('bulletList'),
      ordered: e.isActive('orderedList'),
      quote: e.isActive('blockquote'),
      link: e.isActive('link'),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const openLink = () => {
    setLinkValue((editor.getAttributes('link').href as string | undefined) ?? '');
    setLinkOpen((open) => !open);
  };

  const applyLink = () => {
    const href = normalizeHref(linkValue);
    if (!href) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else if (editor.state.selection.empty && !editor.isActive('link')) {
      // Nothing selected: setLink would change nothing, so insert the address as the link text.
      editor
        .chain()
        .focus()
        .insertContent({ type: 'text', text: href, marks: [{ type: 'link', attrs: { href } }] })
        .run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
    }
    setLinkOpen(false);
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setLinkOpen(false);
  };

  return (
    <div className="border-b border-input">
      <div className="flex flex-wrap items-center gap-0.5 p-1.5">
        <ToolbarButton label="Bold" icon={Bold} active={state.bold} disabled={disabled}
          onClick={() => editor.chain().focus().toggleBold().run()} />
        <ToolbarButton label="Italic" icon={Italic} active={state.italic} disabled={disabled}
          onClick={() => editor.chain().focus().toggleItalic().run()} />
        <ToolbarButton label="Underline" icon={UnderlineIcon} active={state.underline} disabled={disabled}
          onClick={() => editor.chain().focus().toggleUnderline().run()} />
        <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
        <ToolbarButton label="Heading" icon={Heading2} active={state.h2} disabled={disabled}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
        <ToolbarButton label="Subheading" icon={Heading3} active={state.h3} disabled={disabled}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
        <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
        <ToolbarButton label="Bulleted list" icon={List} active={state.bullet} disabled={disabled}
          onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <ToolbarButton label="Numbered list" icon={ListOrdered} active={state.ordered} disabled={disabled}
          onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <ToolbarButton label="Quote" icon={Quote} active={state.quote} disabled={disabled}
          onClick={() => editor.chain().focus().toggleBlockquote().run()} />
        <ToolbarButton label="Link" icon={Link2} active={state.link || linkOpen} disabled={disabled}
          onClick={openLink} />
        <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
        <ToolbarButton label="Undo" icon={Undo2} disabled={disabled || !state.canUndo}
          onClick={() => editor.chain().focus().undo().run()} />
        <ToolbarButton label="Redo" icon={Redo2} disabled={disabled || !state.canRedo}
          onClick={() => editor.chain().focus().redo().run()} />
      </div>

      {linkOpen && (
        <div className="flex flex-wrap items-center gap-2 border-t border-input p-2">
          <Input
            type="text"
            inputMode="url"
            autoFocus
            value={linkValue}
            placeholder="https://example.com"
            aria-label="Link address"
            className="h-8 min-w-0 flex-1"
            onChange={(e) => setLinkValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                applyLink();
              }
            }}
          />
          <button type="button" onClick={applyLink}
            className="h-8 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground">
            Apply
          </button>
          {state.link && (
            <button type="button" onClick={removeLink}
              className="h-8 rounded-md px-3 text-xs font-medium text-destructive hover:bg-destructive/10">
              Remove link
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function RichTextEditor({ value, onChange, disabled }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: false },
      }),
      // Registered so tables in older content are kept (and editable) instead of being dropped.
      TableKit,
    ],
    content: value,
    editable: !disabled,
    editorProps: {
      attributes: {
        class: 'rich-content min-h-[160px] max-h-[360px] overflow-y-auto px-3 py-2 focus:outline-none',
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? '' : e.getHTML()),
  });

  // `editable` is only read at creation, so follow later changes (e.g. while saving).
  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  if (!editor) return null;

  return (
    <div
      className={cn(
        'rounded-md border border-input bg-background ring-offset-background',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        disabled && 'opacity-60',
      )}
    >
      <Toolbar editor={editor} disabled={disabled} />
      <EditorContent editor={editor} />
    </div>
  );
}
