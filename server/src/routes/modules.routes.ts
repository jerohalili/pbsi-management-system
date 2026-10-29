import { Router } from 'express';
import {
  listModules,
  getModule,
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
  listModuleContents,
  createModuleContent,
  updateModuleContent,
  deleteModuleContent,
  reorderModuleContents,
} from '../controllers/modules.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { restrictTo } from '../middleware/restrictTo.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  moduleContentSchema,
  moduleSchema,
  updateModuleContentSchema,
} from '../utils/validation.js';

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
  '/course/:course_id/reorder',
  restrictTo('admin', 'teacher'),
  asyncHandler(reorderModules),
);
router.patch(
  '/:id',
  restrictTo('admin', 'teacher'),
  validate(moduleSchema.partial()),
  asyncHandler(updateModule),
);
router.delete('/:id', restrictTo('admin', 'teacher'), asyncHandler(deleteModule));

// ---- Module content blocks ------------------------------------------------

router.get('/:module_id/contents', asyncHandler(listModuleContents));
router.post(
  '/:module_id/contents',
  restrictTo('admin', 'teacher'),
  validate(moduleContentSchema),
  asyncHandler(createModuleContent),
);
router.patch(
  '/contents/reorder',
  restrictTo('admin', 'teacher'),
  asyncHandler(reorderModuleContents),
);
router.patch(
  '/contents/:id',
  restrictTo('admin', 'teacher'),
  validate(updateModuleContentSchema),
  asyncHandler(updateModuleContent),
);
router.delete('/contents/:id', restrictTo('admin', 'teacher'), asyncHandler(deleteModuleContent));

export default router;
