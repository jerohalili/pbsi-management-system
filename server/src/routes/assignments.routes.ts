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
import { assignmentSchema } from '../utils/validation.js';

const router = Router();

router.use(verifyToken);

router.get('/:module_id', asyncHandler(listAssignments));
router.get('/:id', asyncHandler(getAssignment));
router.post(
  '/',
  restrictTo('admin', 'teacher'),
  validate(assignmentSchema),
  asyncHandler(createAssignment),
);
router.patch(
  '/:id',
  restrictTo('admin', 'teacher'),
  validate(assignmentSchema.partial()),
  asyncHandler(updateAssignment),
);
router.delete('/:id', restrictTo('admin'), asyncHandler(deleteAssignment));

export default router;
