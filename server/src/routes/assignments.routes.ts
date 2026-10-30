import { Router } from 'express';
import {
  listAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  setAttachment,
  removeAttachment,
  downloadAttachment,
} from '../controllers/assignments.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { restrictTo } from '../middleware/restrictTo.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { uploadField, UPLOAD_LIMITS, DOCUMENT_EXTENSIONS } from '../middleware/multer.js';
import { uploadLimiter } from '../middleware/uploadLimiter.js';
import { createAssignmentSchema, updateAssignmentSchema } from '../utils/validation.js';

const router = Router();

router.use(verifyToken);

// GET /api/assignments?course_id=&module_id=  (everyone; shaped per viewer)
router.get('/', asyncHandler(listAssignments));
router.get('/:id', asyncHandler(getAssignment));
router.post(
  '/',
  restrictTo('admin', 'teacher'),
  validate(createAssignmentSchema),
  asyncHandler(createAssignment),
);
router.patch(
  '/:id',
  restrictTo('admin', 'teacher'),
  validate(updateAssignmentSchema),
  asyncHandler(updateAssignment),
);
router.delete('/:id', restrictTo('admin', 'teacher'), asyncHandler(deleteAssignment));

// One private material file per assignment: managers upload/remove, everyone signed in can download.
router.get('/:id/attachment', asyncHandler(downloadAttachment));
router.put(
  '/:id/attachment',
  uploadLimiter,
  restrictTo('admin', 'teacher'),
  uploadField({ maxBytes: UPLOAD_LIMITS.document, extensions: DOCUMENT_EXTENSIONS }),
  asyncHandler(setAttachment),
);
router.delete('/:id/attachment', restrictTo('admin', 'teacher'), asyncHandler(removeAttachment));

export default router;
