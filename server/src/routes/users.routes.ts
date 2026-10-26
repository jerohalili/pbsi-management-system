import { Router } from 'express';
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deactivateUser,
  reactivateUser,
  resetPassword,
  deleteUser,
} from '../controllers/users.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { restrictTo } from '../middleware/restrictTo.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
} from '../utils/validation.js';

const router = Router();

router.use(verifyToken);

// Admins manage every account; teachers manage student accounts only.
// The per-account rules are enforced inside the controller.
router.get('/', restrictTo('admin', 'teacher'), asyncHandler(listUsers));
router.post(
  '/',
  restrictTo('admin', 'teacher'),
  validate(createUserSchema),
  asyncHandler(createUser),
);
router.get('/:id', asyncHandler(getUser));
router.patch(
  '/:id',
  restrictTo('admin', 'teacher'),
  validate(updateUserSchema),
  asyncHandler(updateUser),
);
router.patch(
  '/:id/deactivate',
  restrictTo('admin', 'teacher'),
  asyncHandler(deactivateUser),
);
router.patch(
  '/:id/reactivate',
  restrictTo('admin', 'teacher'),
  asyncHandler(reactivateUser),
);
router.post(
  '/:id/reset-password',
  restrictTo('admin', 'teacher'),
  validate(resetPasswordSchema),
  asyncHandler(resetPassword),
);
router.delete('/:id', restrictTo('admin'), asyncHandler(deleteUser));

export default router;
