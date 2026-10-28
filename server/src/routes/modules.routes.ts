import { Router } from 'express';
import {
  listModules,
  getModule,
  createModule,
  updateModule,
  deleteModule,
} from '../controllers/modules.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { restrictTo } from '../middleware/restrictTo.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { moduleSchema } from '../utils/validation.js';

const router = Router();

router.use(verifyToken);

router.get('/:course_id', asyncHandler(listModules));
router.get('/single/:id', asyncHandler(getModule));
router.post(
  '/',
  restrictTo('admin', 'teacher'),
  validate(moduleSchema),
  asyncHandler(createModule),
);
router.patch(
  '/:id',
  restrictTo('admin', 'teacher'),
  validate(moduleSchema.partial()),
  asyncHandler(updateModule),
);
router.delete('/:id', restrictTo('admin', 'teacher'), asyncHandler(deleteModule));

export default router;
