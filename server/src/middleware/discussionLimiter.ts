import type { Request } from 'express';
import { rateLimit } from 'express-rate-limit';

/**
 * Posting is cheap to abuse (spam, floods), so creating threads, replies and reports shares one
 * limit per signed-in user. Reading and editing are not limited.
 */
export const discussionPostLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  keyGenerator: (req: Request) => req.user?.id ?? req.ip ?? 'anonymous',
  message: { error: 'You are posting too fast. Please wait a few minutes and try again.' },
});
