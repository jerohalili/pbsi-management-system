import { Request, Response } from 'express';
import { sql } from '../config/db.js';
import { deleteFromCloudinary, sniffImage, uploadToCloudinary } from '../utils/upload.js';
import { httpError } from '../utils/access.js';

const AVATAR_FOLDER = 'pbsi/avatars';

/** One avatar per user at a fixed public_id, so a new picture replaces the old one (no orphans). */
export const avatarPublicId = (userId: string): string => `${AVATAR_FOLDER}/${userId}`;

/** PUT /api/auth/me/avatar — multipart field "file". Anyone signed in can change their own picture. */
export async function setAvatar(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) throw httpError(401, 'Not authenticated');
  const file = req.file;
  if (!file) throw httpError(400, 'Choose an image to upload');
  if (!sniffImage(file.buffer)) {
    throw httpError(400, 'That file isn’t a valid JPG, PNG or WebP image.');
  }

  // Stored once at 256×256, centred on a face when there is one, so it is cheap to show everywhere.
  const { url } = await uploadToCloudinary(file.buffer, user.id, AVATAR_FOLDER, 'image', {
    overwrite: true,
    invalidate: true,
    transformation: [{ width: 256, height: 256, crop: 'fill', gravity: 'face', quality: 'auto' }],
  });

  const [profile] = await sql`
    UPDATE profiles SET avatar_url = ${url} WHERE user_id = ${user.id} RETURNING user_id
  `;
  if (!profile) throw httpError(404, 'Profile not found');

  res.json({ avatar_url: url });
}

/** DELETE /api/auth/me/avatar */
export async function removeAvatar(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) throw httpError(401, 'Not authenticated');

  await sql`UPDATE profiles SET avatar_url = NULL WHERE user_id = ${user.id}`;
  await deleteFromCloudinary(avatarPublicId(user.id), 'image');
  res.json({ avatar_url: null });
}
