import { Router } from 'express';
import {
  listNotifications,
  markNotificationRead,
  createNotification,
} from '../controllers/notifications.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { restrictTo } from '../middleware/restrictTo.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { notificationSchema } from '../utils/validation.js';

const router = Router();

router.use(verifyToken);

router.get('/', asyncHandler(listNotifications));
router.patch('/:id/read', asyncHandler(markNotificationRead));
router.post(
  '/',
  restrictTo('admin', 'teacher'),
  validate(notificationSchema),
  asyncHandler(createNotification),
);

export default router;
