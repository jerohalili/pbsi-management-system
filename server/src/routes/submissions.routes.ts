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
import { gradeSubmissionSchema, submitAssignmentSchema } from '../utils/validation.js';

const router = Router();

router.use(verifyToken);

// GET /api/submissions?assignment_id=  (teachers/admins: everyone in the class for one assignment)
router.get('/', restrictTo('admin', 'teacher'), asyncHandler(listSubmissions));
router.get('/:id', asyncHandler(getSubmission));
router.post('/', restrictTo('student'), validate(submitAssignmentSchema), asyncHandler(createSubmission));
router.patch(
  '/:id/grade',
  restrictTo('admin', 'teacher'),
  validate(gradeSubmissionSchema),
  asyncHandler(gradeSubmission),
);

export default router;
