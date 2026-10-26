import { Router } from 'express';
import {
  login,
  logout,
  refresh,
  me,
} from '../controllers/auth.controller.js';
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

export default router;
