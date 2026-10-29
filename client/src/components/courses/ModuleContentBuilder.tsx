import { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, Trash2, Pencil, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import api from '@/lib/api.ts';
import { getErrorMessage } from '@/lib/errors.ts';
import { uploadFile, deleteUploadedFile } from '@/lib/upload.ts';
import { useToast } from '@/components/ui/toast.tsx';

export interface ModuleContent {
  id: string;
  module_id: string;
  type: 'text' | 'video' | 'image' | 'file' | 'link';
  title: string | null;
  content: string | null;
  url: string | null;
  cloudinary_public_id: string | null;
  resource_type: string | null;
  order_index: number;
  created_at: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleId: string;
  onSaved: () => void;
}

const TYPE_LABEL: Record<string, string> = {
  text: 'Text / Rich content',
  video: 'Video',
  image: 'Image',
  file: 'File / PDF',
  link: 'Web link',
};

function isWebUrl(value: string | null | undefined): value is string {
  return !!value && /^https?:\/\//i.test(value);
}

export function ModuleContentBuilder({
  open,
  onOpenChange,
  moduleId,
  onSaved,
}: Props) {
  const { toast } = useToast();
  const [contents, setContents] = useState<ModuleContent[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newType, setNewType] = useState<'text' | 'video' | 'image' | 'file' | 'link'>('text');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!open) return;
    fetchContents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const fetchContents = async () => {
    try {
      const { data } = await api.get<{ contents: ModuleContent[] }>(
        `/modules/${moduleId}/contents`,
      );
      setContents(data.contents ?? []);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      let url = newUrl.trim();
      let cloudinaryPublicId: string | null = null;
      let resourceType: string | null = null;

      // Handle file upload for video/image/file types
      if (uploadingFile && (newType === 'video' || newType === 'image' || newType === 'file')) {
        setUploadProgress(0);
        const result = await uploadFile(uploadingFile, newType);
        url = result.url;
        cloudinaryPublicId = result.public_id;
        resourceType = result.resource_type;
      } else if (newType === 'link' && !isWebUrl(url)) {
        setError('Please enter a valid web link (http:// or https://)');
        setBusy(false);
        return;
      }

      await api.post(`/modules/${moduleId}/contents`, {
        module_id: moduleId,
        type: newType,
        title: newTitle.trim() || null,
        content: newType === 'text' ? (newContent.trim() || null) : null,
        url: url || null,
        cloudinary_public_id: cloudinaryPublicId,
        resource_type: resourceType,
        order_index: contents.length,
      });

      setNewTitle('');
      setNewContent('');
      setNewUrl('');
      setNewType('text');
      setUploadingFile(null);
      setUploadProgress(0);
      setEditingId(null);
      await fetchContents();
      onSaved();
      toast({ title: 'Content block added', variant: 'success' });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleUpdateBlock = async (block: ModuleContent, e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const updates: Record<string, unknown> = {};
      if (editingId === block.id) {
        updates.title = newTitle.trim() || null;
        updates.content = newType === 'text' ? (newContent.trim() || null) : null;
        updates.url = newUrl.trim() || null;
      }

      await api.patch(`/modules/contents/${block.id}`, updates);
      setEditingId(null);
      setNewTitle('');
      setNewContent('');
      setNewUrl('');
      setNewType('text');
      setUploadingFile(null);
      setUploadProgress(0);
      await fetchContents();
      onSaved();
      toast({ title: 'Content block updated', variant: 'success' });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteBlock = async (block: ModuleContent) => {
    if (!window.confirm(`Delete “${block.title ?? block.type}”?`)) return;
    setBusy(true);
    try {
      if (block.cloudinary_public_id && block.resource_type) {
        await deleteUploadedFile(block.cloudinary_public_id, block.resource_type);
      }
      await api.delete(`/modules/contents/${block.id}`);
      await fetchContents();
      onSaved();
      toast({ title: 'Content block deleted', variant: 'success' });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    const idx = contents.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= contents.length) return;

    const reordered = [...contents];
    [reordered[idx], reordered[targetIdx]] = [reordered[targetIdx], reordered[idx]];

    setBusy(true);
    try {
      await api.patch('/modules/contents/reorder', {
        contents: reordered.map((c, i) => ({ id: c.id, order_index: i })),
      });
      await fetchContents();
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const isEditing = (id: string) => editingId === id;

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent className="max-h-[90vh] w-full max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Module content</DialogTitle>
          <DialogDescription>
            Add and arrange text, videos, images, files, and links for students to study.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Existing blocks list */}
          <div className="space-y-2">
            {contents.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-input text-muted-foreground text-center">
                No content blocks yet. Add one below.
              </div>
            ) : (
              contents.map((block) => (
                <div
                  key={block.id}
                  className="flex items-start justify-between gap-3 p-3 rounded-xl border border-input bg-background hover:bg-muted transition-colors select-text"
                >
                  <div className="flex flex-1 items-start gap-3 min-w-0">
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-xs select-text">
                        {TYPE_LABEL[block.type]}
                      </Badge>
                      {isEditing(block.id) ? (
                        <Button variant="ghost" size="icon" onClick={() => setEditingId(null)}>
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1 select-text">
                      {isEditing(block.id) ? (
                        <EditForm block={block} />
                      ) : (
                        <>
                          <h4 className="font-semibold truncate">{block.title ?? block.type}</h4>
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span>{block.type}</span>
                            {block.resource_type && <span>{block.resource_type}</span>}
                          </div>
                          {block.content && (
                            <div className="text-sm text-muted-foreground whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                              {block.content}
                            </div>
                          )}
                          {block.url && isWebUrl(block.url) && block.type !== 'text' && (
                            <a
                              href={block.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary break-all whitespace-normal inline-block max-w-full hover:underline title={block.url}"
                            >
                              {block.url}
                            </a>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {isEditing(block.id) ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            handleUpdateBlock(block, e as unknown as React.FormEvent);
                          }}
                          disabled={busy}
                        >
                          Save
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            setEditingId(null);
                          }}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            setEditingId(block.id);
                          }}
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {contents.length > 1 && (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                handleMove(block.id, 'up');
                              }}
                              disabled={busy}
                            >
                              <ArrowUp className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                handleMove(block.id, 'down');
                              }}
                              disabled={busy}
                            >
                              <ArrowDown className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            handleDeleteBlock(block);
                          }}
                          disabled={busy}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <hr />

          {/* Add new block form */}
          <form onSubmit={handleAddBlock} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="mc-type">Content type</Label>
              <select
                id="mc-type"
                name="mc-type"
                value={newType}
                onChange={(e) => {
                  setNewType(
                    e.target.value as 'text' | 'video' | 'image' | 'file' | 'link',
                  );
                }}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {(['text', 'video', 'image', 'file', 'link'] as const).map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mc-title">Title</Label>
              <Input
                id="mc-title"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Week 1: Introduction"
              />
            </div>

            {newType === 'text' && (
              <div className="space-y-2">
                <Label htmlFor="mc-content">Content (HTML)</Label>
                <Textarea
                  id="mc-content"
                  rows={6}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Write your lesson here. You can use HTML tags like <table>, <ul>, <a href>, etc."
                />
                <p className="text-xs text-muted-foreground">
                  Supports basic HTML: tables, lists, links, bold, italic.
                </p>
              </div>
            )}

            {(newType === 'video' || newType === 'image' || newType === 'file') && (
              <div className="space-y-2">
                <Label htmlFor="mc-file-input">Upload {TYPE_LABEL[newType]}</Label>
                {uploadingFile ? (
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{uploadingFile.name}</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('mc-file-input') as HTMLInputElement | null;
                      input?.click();
                    }}
                    className="flex items-center gap-2 w-full py-3 rounded-xl border border-dashed border-input text-primary hover:bg-primary/5 transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Choose file</span>
                    <input
                      id="mc-file-input"
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setUploadingFile(file);
                      }}
                    />
                  </button>
                )}
                {uploadingFile && (
                  <p className="text-xs text-muted-foreground">
                    {uploadingFile.name} ({(uploadingFile.size / 1024 / 1024).toFixed(1)} MB)
                  </p>
                )}
              </div>
            )}

            {newType === 'link' && (
              <div className="space-y-2">
                <Label htmlFor="mc-url">Web link URL</Label>
                <Input
                  id="mc-url"
                  type="url"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            )}

            {(newType === 'video' || newType === 'image' || newType === 'file') && !uploadingFile && (
              <div className="space-y-2">
                <Label htmlFor="mc-url-direct">Or paste a direct URL (optional)</Label>
                <Input
                  id="mc-url-direct"
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://…"
                />
              </div>
            )}

            {busy && <p className="text-xs text-muted-foreground">Saving…</p>}
            <DialogFooter>
              <Button type="button" variant="destructive" onClick={() => onOpenChange(false)} disabled={busy}>
                Exit
              </Button>
              <Button type="submit" disabled={busy || !newTitle.trim()}>
                {busy ? 'Adding…' : 'Add content block'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditForm({ block }: { block: ModuleContent }) {
  const [title, setTitle] = useState(block.title ?? '');
  const [content, setContent] = useState(block.content ?? '');
  const [url, setUrl] = useState(block.url ?? '');
  const [type, setType] = useState<'text' | 'video' | 'image' | 'file' | 'link'>(block.type);

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        <Label htmlFor={`ec-type-${block.id}`}>Type</Label>
        <select
          id={`ec-type-${block.id}`}
          name={`ec-type-${block.id}`}
          value={type}
          onChange={(e) => {
            setType(e.target.value as 'text' | 'video' | 'image' | 'file' | 'link');
          }}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          {(['text', 'video', 'image', 'file', 'link'] as const).map((t) => (
            <option key={t} value={t}>
              {TYPE_LABEL[t]}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`ec-title-${block.id}`}>Title</Label>
        <Input
          id={`ec-title-${block.id}`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      {type === 'text' && (
        <div className="space-y-2">
          <Label htmlFor={`ec-content-${block.id}`}>Content (HTML)</Label>
          <Textarea
            id={`ec-content-${block.id}`}
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
      )}
      {(type === 'video' || type === 'image' || type === 'file' || type === 'link') && (
        <div className="space-y-2">
          <Label htmlFor={`ec-url-${block.id}`}>{type === 'link' ? 'URL' : 'Direct URL (optional)'}</Label>
          <Input
            id={`ec-url-${block.id}`}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
