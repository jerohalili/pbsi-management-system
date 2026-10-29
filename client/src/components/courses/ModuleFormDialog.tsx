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
import { Textarea } from '@/components/ui/textarea.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { ArrowUp, ArrowDown, Trash2, Pencil, Upload } from 'lucide-react';
import api from '@/lib/api.ts';
import { getErrorMessage } from '@/lib/errors.ts';
import { uploadFile, deleteUploadedFile } from '@/lib/upload.ts';
import { useToast } from '@/components/ui/toast.tsx';

export interface ModuleFormValues {
  id: string;
  title: string;
  rich_description: string | null;
  video_url: string | null;
  attachment_url: string | null;
  order_index: number;
}

interface ModuleContent {
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

interface ModuleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  courseId: string;
  /** Suggested position for a new module. */
  nextOrderIndex: number;
  module?: ModuleFormValues | null;
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

export function ModuleFormDialog({
  open,
  onOpenChange,
  mode,
  courseId,
  nextOrderIndex,
  module,
  onSaved,
}: ModuleFormDialogProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [orderIndex, setOrderIndex] = useState('0');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Content blocks state
  const [contents, setContents] = useState<ModuleContent[]>([]);
  const [contentsBusy, setContentsBusy] = useState(false);
  const [contentsError, setContentsError] = useState('');
  // Editing a content block
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  // Type of the content block currently being edited (independent of the
  // "add new content block" form below, which keeps its own `newContentType`).
  const [editingContentType, setEditingContentType] = useState<'text' | 'video' | 'image' | 'file' | 'link'>('text');
  const [newContentType, setNewContentType] = useState<'text' | 'video' | 'image' | 'file' | 'link'>('text');
  const [newContentTitle, setNewContentTitle] = useState('');
  const [newContentContent, setNewContentContent] = useState('');
  const [newContentUrl, setNewContentUrl] = useState('');
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!open) return;
    const editing = mode === 'edit' && module;
    setTitle(editing ? module.title : '');
    setDescription(editing ? (module.rich_description ?? '') : '');
    setVideoUrl(editing ? (module.video_url ?? '') : '');
    setAttachmentUrl(editing ? (module.attachment_url ?? '') : '');
    setOrderIndex(String(editing ? module.order_index : nextOrderIndex));
    setBusy(false);
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, module]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const payload = {
      title: title.trim(),
      rich_description: description.trim(),
      video_url: videoUrl.trim(),
      attachment_url: attachmentUrl.trim(),
      order_index: Number(orderIndex),
    };
    try {
      if (mode === 'create' || !module) {
        await api.post('/modules', { ...payload, course_id: courseId });
      } else {
        await api.patch(`/modules/${module.id}`, payload);
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  // ---- Content blocks -------------------------------------------------------

  const fetchContents = async () => {
    if (!module) return;
    try {
      const { data } = await api.get<{ contents: ModuleContent[] }>(
        `/modules/${module.id}/contents`,
      );
      setContents(data.contents ?? []);
      setContentsError('');
    } catch (err) {
      setContentsError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    if (!open || mode === 'create') return;
    fetchContents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, module]);

  const isContentEditing = (id: string) => editingContentId === id;

  // Populate the shared "new content" form from an existing block so editing
  // actually pre-fills the block's current values instead of showing stale state.
  const startEditingContent = (block: ModuleContent) => {
    setEditingContentId(block.id);
    setEditingContentType(block.type);
    setNewContentTitle(block.title ?? '');
    setNewContentContent(block.content ?? '');
    setNewContentUrl(block.url ?? '');
  };

  const resetNewContentForm = () => {
    setEditingContentId(null);
    setEditingContentType('text');
    setNewContentType('text');
    setNewContentTitle('');
    setNewContentContent('');
    setNewContentUrl('');
    setUploadingFile(null);
    setUploadProgress(0);
  };

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setContentsBusy(true);
    setContentsError('');
    if (!module) return;
    try {
      let url = newContentUrl.trim();
      let cloudinaryPublicId: string | null = null;
      let resourceType: string | null = null;

      if (uploadingFile && (newContentType === 'video' || newContentType === 'image' || newContentType === 'file')) {
        setUploadProgress(0);
        const result = await uploadFile(uploadingFile, newContentType);
        url = result.url;
        cloudinaryPublicId = result.public_id;
        resourceType = result.resource_type;
      } else if (newContentType === 'link' && !isWebUrl(url)) {
        setContentsError('Please enter a valid web link (http:// or https://)');
        setContentsBusy(false);
        return;
      }

      await api.post(`/modules/${module.id}/contents`, {
        module_id: module.id,
        type: newContentType,
        title: newContentTitle.trim() || null,
        content: newContentType === 'text' ? (newContentContent.trim() || null) : null,
        url: url || null,
        cloudinary_public_id: cloudinaryPublicId,
        resource_type: resourceType,
        order_index: contents.length,
      });

      setNewContentTitle('');
      setNewContentContent('');
      setNewContentUrl('');
      setNewContentType('text');
      setUploadingFile(null);
      setUploadProgress(0);
      setEditingContentId(null);
      await fetchContents();
      toast({ title: 'Content block added', variant: 'success' });
    } catch (err) {
      setContentsError(getErrorMessage(err));
    } finally {
      setContentsBusy(false);
    }
  };

  const handleUpdateContent = async (block: ModuleContent, e: React.FormEvent) => {
    e.preventDefault();
    setContentsBusy(true);
    setContentsError('');
    try {
      const updates: Record<string, unknown> = {};
      if (editingContentId === block.id) {
        updates.type = editingContentType;
        updates.title = newContentTitle.trim() || null;
        updates.content = editingContentType === 'text' ? (newContentContent.trim() || null) : null;
        updates.url = newContentUrl.trim() || null;
      }

      await api.patch(`/modules/contents/${block.id}`, updates);
      setEditingContentId(null);
      setNewContentTitle('');
      setNewContentContent('');
      setNewContentUrl('');
      setNewContentType('text');
      setUploadingFile(null);
      setUploadProgress(0);
      await fetchContents();
      toast({ title: 'Content block updated', variant: 'success' });
    } catch (err) {
      setContentsError(getErrorMessage(err));
    } finally {
      setContentsBusy(false);
    }
  };

  const handleDeleteContent = async (block: ModuleContent) => {
    if (!window.confirm(`Delete “${block.title ?? block.type}”?`)) return;
    setContentsBusy(true);
    try {
      if (block.cloudinary_public_id && block.resource_type) {
        await deleteUploadedFile(block.cloudinary_public_id, block.resource_type);
      }
      if (!module) return;
      await api.delete(`/modules/contents/${block.id}`);
      await fetchContents();
      toast({ title: 'Content block deleted', variant: 'success' });
    } catch (err) {
      setContentsError(getErrorMessage(err));
    } finally {
      setContentsBusy(false);
    }
  };

  const handleMoveContent = async (id: string, direction: 'up' | 'down') => {
    const idx = contents.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= contents.length) return;

    const reordered = [...contents];
    [reordered[idx], reordered[targetIdx]] = [reordered[targetIdx], reordered[idx]];

    setContentsBusy(true);
    try {
      await api.patch('/modules/contents/reorder', {
        contents: reordered.map((c, i) => ({ id: c.id, order_index: i })),
      });
      await fetchContents();
    } catch (err) {
      setContentsError(getErrorMessage(err));
    } finally {
      setContentsBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent className="max-h-[90vh] w-full max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add module' : 'Edit module'}</DialogTitle>
          <DialogDescription>
            A module is one unit of the course: lesson notes plus content blocks (text, video,
            images, files, links) for students to study.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-6">
          {/* Module details */}
          <section>
            <div className="space-y-2">
              <Label htmlFor="mf-title">Title</Label>
              <Input
                id="mf-title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mf-desc">Lesson notes (optional)</Label>
              <Textarea
                id="mf-desc"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mf-video">Video link (optional)</Label>
              <Input
                id="mf-video"
                type="url"
                placeholder="https://…"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mf-attach">Material link (optional)</Label>
              <Input
                id="mf-attach"
                type="url"
                placeholder="https://…"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mf-order">Position</Label>
              <Input
                id="mf-order"
                type="number"
                min={0}
                step={1}
                required
                value={orderIndex}
                onChange={(e) => setOrderIndex(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Lower numbers appear first.</p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </section>

          {/* Content blocks */}
          <section className="border-t border-input pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Content blocks</h3>
              <span className="text-xs text-muted-foreground">
                {contents.length} block{contents.length !== 1 ? 's' : ''}
              </span>
            </div>

            {contentsError && <p className="text-sm text-destructive mb-3">{contentsError}</p>}

            {contents.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-input text-muted-foreground text-center">
                No content blocks yet. Add one below.
              </div>
            ) : (
              <div className="space-y-2">
                {contents.map((block) => (
                  <div
                    key={block.id}
                    className="flex items-start justify-between gap-3 p-3 rounded-xl border border-input bg-background hover:bg-muted transition-colors select-text"
                  >
                    <div className="flex flex-1 items-start gap-3 min-w-0">
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-xs select-text">
                          {TYPE_LABEL[block.type]}
                        </Badge>
                        {isContentEditing(block.id) ? (
                          <Button variant="ghost" size="icon" onClick={resetNewContentForm}>
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                        ) : null}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1 select-text">
                        {isContentEditing(block.id) ? (
                          <div className="space-y-2">
                            <div className="space-y-2">
                              <Label htmlFor={`ec-type-${block.id}`}>Type</Label>
                              <Select
                                name={`ec-type-${block.id}`}
                                autoComplete="off"
                                value={editingContentType}
                                onValueChange={(v) => {
                                  setEditingContentType(v as 'text' | 'video' | 'image' | 'file' | 'link');
                                }}
                              >
                                <SelectTrigger id={`ec-type-${block.id}`} className="select-text">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {(['text', 'video', 'image', 'file', 'link'] as const).map((t) => (
                                    <SelectItem key={t} value={t}>
                                      {TYPE_LABEL[t]}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`ec-title-${block.id}`}>Title</Label>
                              <Input
                                id={`ec-title-${block.id}`}
                                value={newContentTitle}
                                onChange={(e) => setNewContentTitle(e.target.value)}
                              />
                            </div>
                            {newContentType === 'text' && (
                              <div className="space-y-2">
                                <Label htmlFor={`ec-content-${block.id}`}>Content (HTML)</Label>
                                <Textarea
                                  id={`ec-content-${block.id}`}
                                  rows={4}
                                  value={newContentContent}
                                  onChange={(e) => setNewContentContent(e.target.value)}
                                />
                              </div>
                            )}
                            {(newContentType === 'video' || newContentType === 'image' || newContentType === 'file' || newContentType === 'link') && (
                              <div className="space-y-2">
                                <Label htmlFor={`ec-url-${block.id}`}>{newContentType === 'link' ? 'URL' : 'Direct URL (optional)'}</Label>
                                <Input
                                  id={`ec-url-${block.id}`}
                                  type="url"
                                  value={newContentUrl}
                                  onChange={(e) => setNewContentUrl(e.target.value)}
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            <h4 className="font-semibold truncate">{block.title ?? block.type}</h4>
                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                              <span>{block.type}</span>
                              {block.resource_type && <span>{block.resource_type}</span>}
                            </div>
                            {block.content && (
                              <p className="text-sm text-muted-foreground line-clamp-2 whitespace-pre-wrap">
                                {block.content}
                              </p>
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
                      {isContentEditing(block.id) ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e: React.MouseEvent) =>
                              handleUpdateContent(block, e as unknown as React.FormEvent)
                            }
                            disabled={contentsBusy}
                          >
                            Save
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              resetNewContentForm();
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
                              startEditingContent(block);
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
                                  handleMoveContent(block.id, 'up');
                                }}
                                disabled={contentsBusy}
                              >
                                <ArrowUp className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  handleMoveContent(block.id, 'down');
                                }}
                                disabled={contentsBusy}
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
                              handleDeleteContent(block);
                            }}
                            disabled={contentsBusy}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <hr />

            {/* Add new content block */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="mc-type">Content type</Label>
                <Select
                  name="mc-type"
                  autoComplete="off"
                  value={newContentType}
                  onValueChange={(val) => {
                    setNewContentType(val as 'text' | 'video' | 'image' | 'file' | 'link');
                  }}
                >
                  <SelectTrigger id="mc-type" className="select-text">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(['text', 'video', 'image', 'file', 'link'] as const).map((t) => (
                      <SelectItem key={t} value={t}>
                        {TYPE_LABEL[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mc-title">Title</Label>
                <Input
                  id="mc-title"
                  required
                  value={newContentTitle}
                  onChange={(e) => setNewContentTitle(e.target.value)}
                  placeholder="e.g. Week 1: Introduction"
                />
              </div>

              {newContentType === 'text' && (
                <div className="space-y-2">
                  <Label htmlFor="mc-content">Content (HTML)</Label>
                  <Textarea
                    id="mc-content"
                    rows={6}
                    value={newContentContent}
                    onChange={(e) => setNewContentContent(e.target.value)}
                    placeholder="Write your lesson here. You can use HTML tags like <table>, <ul>, <a href>, etc."
                  />
                  <p className="text-xs text-muted-foreground">
                    Supports basic HTML: tables, lists, links, bold, italic.
                  </p>
                </div>
              )}

              {(newContentType === 'video' || newContentType === 'image' || newContentType === 'file') && (
                <div className="space-y-2">
                  <Label htmlFor="mc-file-input">Upload {TYPE_LABEL[newContentType]}</Label>
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

              {newContentType === 'link' && (
                <div className="space-y-2">
                  <Label htmlFor="mc-url">Web link URL</Label>
                  <Input
                    id="mc-url"
                    type="url"
                    required
                    value={newContentUrl}
                    onChange={(e) => setNewContentUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              )}

              {(newContentType === 'video' || newContentType === 'image' || newContentType === 'file') && !uploadingFile && (
                <div className="space-y-2">
                  <Label htmlFor="mc-url-direct">Or paste a direct URL (optional)</Label>
                  <Input
                    id="mc-url-direct"
                    type="url"
                    value={newContentUrl}
                    onChange={(e) => setNewContentUrl(e.target.value)}
                    placeholder="https://…"
                  />
                </div>
              )}

              {contentsBusy && <p className="text-xs text-muted-foreground">Saving…</p>}
              <div className="flex gap-2">
                <Button type="button" variant="destructive" onClick={resetNewContentForm} disabled={contentsBusy}>
                  Cancel
                </Button>
                <Button type="button" disabled={contentsBusy || !newContentTitle.trim()} onClick={handleAddContent}>
                  {contentsBusy ? 'Adding…' : 'Add content block'}
                </Button>
              </div>
            </div>
          </section>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="destructive" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : mode === 'create' ? 'Add module' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
