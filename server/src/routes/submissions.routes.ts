import { Router } from 'express';
import {
  listSubmissions,
  getSubmission,
  createSubmission,
  createFileSubmission,
  downloadSubmission,
  gradeSubmission,
} from '../controllers/submissions.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { restrictTo } from '../middleware/restrictTo.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { uploadField, UPLOAD_LIMITS, DOCUMENT_EXTENSIONS } from '../middleware/multer.js';
import { uploadLimiter } from '../middleware/uploadLimiter.js';
import { gradeSubmissionSchema, submitAssignmentSchema } from '../utils/validation.js';

const router = Router();

router.use(verifyToken);

// GET /api/submissions?assignment_id=  (teachers/admins: everyone in the class for one assignment)
router.get('/', restrictTo('admin', 'teacher'), asyncHandler(listSubmissions));
router.get('/:id', asyncHandler(getSubmission));
// Signed, short-lived link to the uploaded file (owner, or the course's teacher/admin).
router.get('/:id/download', asyncHandler(downloadSubmission));
router.post('/', restrictTo('student'), validate(submitAssignmentSchema), asyncHandler(createSubmission));
// Hand in a file instead of a link: multipart with `assignment_id` and `file`.
router.post(
  '/file',
  uploadLimiter,
  restrictTo('student'),
  uploadField({ maxBytes: UPLOAD_LIMITS.document, extensions: DOCUMENT_EXTENSIONS }),
  asyncHandler(createFileSubmission),
);
router.patch(
  '/:id/grade',
  restrictTo('admin', 'teacher'),
  validate(gradeSubmissionSchema),
  asyncHandler(gradeSubmission),
);

export default router;
