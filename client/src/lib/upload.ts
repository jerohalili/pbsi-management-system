import api from '@/lib/api.ts';

export type UploadKind = 'image' | 'video' | 'file';

export interface UploadResult {
  url: string;
  public_id: string;
  resource_type: string;
  kind: UploadKind;
}

/** Upload a file to Cloudinary via the API. */
export async function uploadFile(file: File, kind: UploadKind): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<UploadResult>(`/upload/${kind}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/** Best-effort delete of a Cloudinary asset. */
export async function deleteUploadedFile(
  publicId: string,
  resourceType: string,
): Promise<void> {
  await api.delete(`/upload/${publicId}`, { data: { resource_type: resourceType } });
}
