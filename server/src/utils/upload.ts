import { randomUUID } from 'node:crypto';
import { cloudinary } from '../config/cloudinary.js';

export type UploadResourceType = 'image' | 'video' | 'raw';

/** `upload` = public CDN link; `authenticated` = only reachable through a signed, expiring URL. */
export type DeliveryType = 'upload' | 'authenticated';

export interface UploadOptions {
  /** Delivery type. Default `upload` (public). */
  type?: DeliveryType;
  /** Use this exact public_id (inside `folder`) instead of deriving one from the filename. */
  publicId?: string;
  /** Replace an existing asset with the same public_id. */
  overwrite?: boolean;
  /** Purge CDN copies when overwriting. */
  invalidate?: boolean;
  /** Incoming transformation, applied once at upload time (the stored original is the result). */
  transformation?: Record<string, string | number>[];
}

/**
 * Upload a buffer to Cloudinary and return the secure URL + public_id.
 *
 * Raw assets keep their file extension in the public_id (that is how Cloudinary names raw files);
 * images and videos get the extension stripped because Cloudinary tracks their format separately.
 */
export function uploadToCloudinary(
  buffer: Buffer,
  filename: string,
  folder: string,
  resourceType: UploadResourceType,
  options: UploadOptions = {},
): Promise<{ url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const baseName = options.publicId ?? filename;
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        type: options.type ?? 'upload',
        public_id: resourceType === 'raw' ? baseName : baseName.replace(/\.[^/.]+$/, ''),
        overwrite: options.overwrite,
        invalidate: options.invalidate,
        transformation: options.transformation,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (!result) {
          reject(new Error('Cloudinary upload returned no result'));
          return;
        }
        resolve({ url: result.secure_url, public_id: result.public_id });
      },
    );
    stream.end(buffer);
  });
}

/** Delete an asset from Cloudinary by public_id. Best-effort; never throws. */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: UploadResourceType,
  type: DeliveryType = 'upload',
): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, type, invalidate: true });
  } catch {
    // Swallow: a missing Cloudinary asset must never block a local delete.
  }
}

/** Delete many private raw files (submissions, materials, question images). Best-effort. */
export async function deleteManyFromCloudinary(
  publicIds: (string | null | undefined)[],
  resourceType: UploadResourceType,
  type: DeliveryType = 'upload',
): Promise<void> {
  const ids = publicIds.filter((id): id is string => !!id);
  await Promise.allSettled(ids.map((id) => deleteFromCloudinary(id, resourceType, type)));
}

/**
 * Signed, expiring download link for a private (`authenticated`) asset.
 * Generated per request after our own access check, so the link itself is the only thing that leaks.
 */
export function signedDownloadUrl(
  publicId: string,
  resourceType: UploadResourceType = 'raw',
  ttlSeconds = 300,
): string {
  return cloudinary.utils.private_download_url(publicId, '', {
    resource_type: resourceType,
    type: 'authenticated',
    attachment: true,
    expires_at: Math.floor(Date.now() / 1000) + ttlSeconds,
  });
}

/**
 * A safe, readable file name for use inside a public_id and for display:
 * no paths, no spaces or odd characters, bounded length, extension preserved.
 */
export function safeFileName(original: string): string {
  const base = original.split(/[\\/]/).pop() ?? 'file';
  const dot = base.lastIndexOf('.');
  const ext = dot > 0 ? base.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) : '';
  const stem = (dot > 0 ? base.slice(0, dot) : base)
    .normalize('NFKD')
    .replace(/[^A-Za-z0-9._-]+/g, '_')
    .replace(/^[._-]+|[._-]+$/g, '')
    .slice(0, 60);
  return `${stem || 'file'}${ext ? `.${ext}` : ''}`;
}

/** Unique public_id leaf for an uploaded file: `<random>-<safe name>`. */
export function uniqueFileName(original: string): string {
  return `${randomUUID().slice(0, 8)}-${safeFileName(original)}`;
}

/** True when the bytes really are a JPEG, PNG or WebP image (the extension alone can be faked). */
export function sniffImage(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  const jpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const png =
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47 &&
    buffer[4] === 0x0d && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a;
  const webp = buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
  return jpeg || png || webp;
}
