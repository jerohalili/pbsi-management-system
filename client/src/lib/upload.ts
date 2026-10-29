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
