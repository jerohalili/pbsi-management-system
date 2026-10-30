import api from '@/lib/api.ts';

export type UploadKind = 'image' | 'video' | 'file';

export interface UploadResult {
  url: string;
  public_id: string;
  resource_type: string;
  kind: UploadKind;
}

/** Upload a file to Cloudinary via the API. `onProgress` receives 0-100. */
export async function uploadFile(
  file: File,
  kind: UploadKind,
  onProgress?: (percent: number) => void,
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<UploadResult>(`/upload/${kind}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (!onProgress) return;
      const total = event.total ?? file.size;
      if (total > 0) onProgress(Math.min(100, Math.round((event.loaded * 100) / total)));
    },
  });
  return data;
}

/** Best-effort delete of a Cloudinary asset. */
export async function deleteUploadedFile(
  publicId: string,
  resourceType: string,
): Promise<void> {
  // Public ids contain "/" (e.g. pbsi/modules/images/...), so the id must be URL-encoded.
  await api.delete(`/upload/${encodeURIComponent(publicId)}`, {
    data: { resource_type: resourceType },
  });
}

// ---- Shared rules and helpers for the Cloudinary-backed uploads (assignments, quizzes, avatars) ----
// The server enforces the same limits; checking here just gives instant feedback.

const MB = 1024 * 1024;

export interface FileRule {
  maxBytes: number;
  /** Value for <input accept>. */
  accept: string;
  /** Lower-case extensions, no dot. */
  extensions: string[];
  /** Human hint shown under the picker. */
  hint: string;
}

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const DOCUMENT_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'odt', 'ods', 'odp',
  'txt', 'csv', 'rtf', 'zip', ...IMAGE_EXTENSIONS,
];
const toAccept = (extensions: string[]) => extensions.map((e) => `.${e}`).join(',');

export const FILE_RULES = {
  /** Student submissions and teacher material files. */
  document: {
    maxBytes: 10 * MB,
    accept: toAccept(DOCUMENT_EXTENSIONS),
    extensions: DOCUMENT_EXTENSIONS,
    hint: 'PDF, Word, PowerPoint, Excel, text, ZIP or an image. Up to 10 MB.',
  },
  /** Profile pictures. */
  avatar: {
    maxBytes: 2 * MB,
    accept: toAccept(IMAGE_EXTENSIONS),
    extensions: IMAGE_EXTENSIONS,
    hint: 'JPG, PNG or WebP. Up to 2 MB.',
  },
  /** Quiz question pictures. */
  quizImage: {
    maxBytes: 5 * MB,
    accept: toAccept(IMAGE_EXTENSIONS),
    extensions: IMAGE_EXTENSIONS,
    hint: 'JPG, PNG or WebP. Up to 5 MB.',
  },
} satisfies Record<string, FileRule>;

/** A friendly problem description, or null when the file is acceptable. */
export function checkFile(file: File, rule: FileRule): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!rule.extensions.includes(ext)) return `“${file.name}” isn’t an allowed file type. ${rule.hint}`;
  if (file.size > rule.maxBytes) {
    return `“${file.name}” is ${formatBytes(file.size)}. The limit is ${Math.round(rule.maxBytes / MB)} MB.`;
  }
  if (file.size === 0) return `“${file.name}” is empty.`;
  return null;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < MB) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / MB).toFixed(1)} MB`;
}

/** Sends one file (field "file") plus optional text fields as multipart, reporting 0-100 progress. */
export async function sendFile<T>(
  method: 'post' | 'put',
  url: string,
  file: File,
  fields: Record<string, string> = {},
  onProgress?: (percent: number) => void,
): Promise<T> {
  const formData = new FormData();
  // Text fields first, so the server sees them before it starts reading the file.
  Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
  formData.append('file', file);
  const { data } = await api.request<T>({
    method,
    url,
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (!onProgress) return;
      const total = event.total ?? file.size;
      if (total > 0) onProgress(Math.min(100, Math.round((event.loaded * 100) / total)));
    },
  });
  return data;
}

/**
 * Downloads a private file. The API checks who is asking and answers with a short-lived signed
 * link (it expires in minutes), which is then followed straight away.
 */
export async function downloadPrivateFile(endpoint: string): Promise<void> {
  const { data } = await api.get<{ url: string; file_name?: string }>(endpoint);
  const link = document.createElement('a');
  link.href = data.url;
  link.rel = 'noopener noreferrer';
  if (data.file_name) link.download = data.file_name;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
