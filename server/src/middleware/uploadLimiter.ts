import { rateLimit } from 'express-rate-limit';

/** Uploads are the expensive requests (memory + Cloudinary quota), so they get their own, tighter limit. */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { error: 'Too many uploads, please try again in a few minutes' },
});
