import { cloudinary } from '../config/cloudinary.js';

export type UploadResourceType = 'image' | 'video' | 'raw';

/** Upload a buffer to Cloudinary and return the secure URL + public_id. */
export function uploadToCloudinary(
  buffer: Buffer,
  filename: string,
  folder: string,
  resourceType: UploadResourceType,
): Promise<{ url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        public_id: filename.replace(/\.[^/.]+$/, ''), // strip extension for public_id
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
): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch {
    // Swallow: a missing Cloudinary asset must never block a local delete.
  }
}
