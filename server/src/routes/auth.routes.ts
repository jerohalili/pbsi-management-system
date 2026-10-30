import { Router } from 'express';
import {
  login,
  logout,
  refresh,
  me,
} from '../controllers/auth.controller.js';
import { removeAvatar, setAvatar } from '../controllers/avatar.controller.js';
import { changeOwnPassword, updateOwnProfile } from '../controllers/profile.controller.js';
import { uploadField, UPLOAD_LIMITS, IMAGE_EXTENSIONS } from '../middleware/multer.js';
import { uploadLimiter } from '../middleware/uploadLimiter.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../middleware/validate.js';
import { loginSchema } from '../utils/validation.js';

const router = Router();

// Public self-registration is disabled: accounts are created by an administrator
// (or by a teacher, for students) through POST /api/users.
router.post('/register', (_req, res) => {
  res.status(403).json({
    error: 'Public registration is disabled. Please contact an administrator.',
  });
});
router.post('/login', validate(loginSchema), asyncHandler(login));
router.post('/logout', asyncHandler(logout));
router.post('/refresh', asyncHandler(refresh));
router.get('/me', verifyToken, asyncHandler(me));
// Settings: anyone signed in, for their own account only.
router.patch('/me', verifyToken, asyncHandler(updateOwnProfile));
router.put('/me/password', verifyToken, asyncHandler(changeOwnPassword));
router.put(
  '/me/avatar',
  uploadLimiter,
  verifyToken,
  uploadField({ maxBytes: UPLOAD_LIMITS.avatar, extensions: IMAGE_EXTENSIONS }),
  asyncHandler(setAvatar),
);
router.delete('/me/avatar', verifyToken, asyncHandler(removeAvatar));

export default router;
