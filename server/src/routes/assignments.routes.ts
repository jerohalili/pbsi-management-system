import { Router } from 'express';
import {
  listAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from '../controllers/assignments.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { restrictTo } from '../middleware/restrictTo.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
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
router.delete('/:id', restrictTo('admin'), asyncHandler(deleteAssignment));

export default router;
