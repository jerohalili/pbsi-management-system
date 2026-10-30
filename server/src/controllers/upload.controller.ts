import { Request, Response } from 'express';
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  type UploadResourceType,
} from '../utils/upload.js';
import { uploadSingle } from '../middleware/multer.js';
import type { AppError } from '../middleware/errorHandler.js';

const FOLDER = 'pbsi/modules';

function resourceTypeFor(kind: 'image' | 'video' | 'file'): UploadResourceType {
  if (kind === 'image') return 'image';
  if (kind === 'video') return 'video';
  return 'raw';
}

/** Multer middleware bound to a single file field named "file". */
export const uploadMiddleware = uploadSingle;

/** POST /api/upload/:kind — kind in image | video | file */
export async function uploadFile(req: Request, res: Response): Promise<void> {
  const kind = (req.params as { kind: string }).kind;
  if (!['image', 'video', 'file'].includes(kind)) {
    const err = new Error('Invalid upload kind') as AppError;
    err.statusCode = 400;
    throw err;
  }

  const file = req.file;
  if (!file) {
    const err = new Error('No file uploaded') as AppError;
    err.statusCode = 400;
    throw err;
  }

  const resourceType = resourceTypeFor(kind as 'image' | 'video' | 'file');
  const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
  const { url, public_id } = await uploadToCloudinary(
    file.buffer,
    filename,
    `${FOLDER}/${kind}s`,
    resourceType,
  );

  res.status(201).json({ url, public_id, resource_type: resourceType, kind });
}

/** DELETE /api/upload/:publicId — best-effort Cloudinary cleanup. Body: { resource_type } */
export async function deleteFile(req: Request, res: Response): Promise<void> {
  const publicId = req.params.publicId as string;
  // This generic endpoint may only touch module media. Submissions, materials, avatars and quiz
  // images are cleaned up by the code that owns them, never by an arbitrary public id.
  if (!publicId.startsWith(`${FOLDER}/`) || publicId.includes('..')) {
    const err = new Error('Only module uploads can be deleted here') as AppError;
    err.statusCode = 403;
    throw err;
  }
  const { resource_type } = (req.body ?? {}) as { resource_type?: UploadResourceType };
  const type = resource_type ?? 'raw';

  await deleteFromCloudinary(publicId, type);
  res.json({ message: 'Deleted' });
}
