import { Router } from 'express';
import {
  listUsers,
  getUser,
  updateUserRole,
  deactivateUser,
} from '../controllers/users.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { restrictTo } from '../middleware/restrictTo.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.use(verifyToken);

router.get('/', restrictTo('admin', 'teacher'), asyncHandler(listUsers));
router.get('/:id', asyncHandler(getUser));
router.patch(
  '/:id/role',
  restrictTo('admin'),
  asyncHandler(updateUserRole),
);
router.patch(
  '/:id/deactivate',
  restrictTo('admin'),
  asyncHandler(deactivateUser),
);

export default router;
