import { Router } from 'express';
import {
  listSubmissions,
  getSubmission,
  createSubmission,
  gradeSubmission,
} from '../controllers/submissions.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { restrictTo } from '../middleware/restrictTo.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { gradeSchema } from '../utils/validation.js';

const router = Router();

router.use(verifyToken);

router.get('/:assignment_id', asyncHandler(listSubmissions));
router.get('/:id', asyncHandler(getSubmission));
router.post('/', asyncHandler(createSubmission));
router.patch(
  '/:id/grade',
  restrictTo('admin', 'teacher'),
  validate(gradeSchema),
  asyncHandler(gradeSubmission),
);

export default router;
