import { Router } from 'express';
import {
  register,
  login,
  logout,
  refresh,
  me,
} from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, registerSchema } from '../utils/validation.js';

const router = Router();

router.post('/register', validate(registerSchema), asyncHandler(register));
router.post('/login', validate(loginSchema), asyncHandler(login));
router.post('/logout', asyncHandler(logout));
router.post('/refresh', asyncHandler(refresh));
router.get('/me', verifyToken, asyncHandler(me));

export default router;
