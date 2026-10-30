import { Router } from 'express';
import { listGrades, getGradeSummary, getStudentGPA, overrideGrade } from '../controllers/grades.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { restrictTo } from '../middleware/restrictTo.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { overrideGradeSchema } from '../utils/validation.js';

const router = Router();

router.use(verifyToken);

router.get('/', asyncHandler(listGrades));
router.get('/summary', asyncHandler(getGradeSummary));
router.get('/gpa/:student_id', asyncHandler(getStudentGPA));
router.patch(
  '/:id',
  restrictTo('admin', 'teacher'),
  validate(overrideGradeSchema),
  asyncHandler(overrideGrade),
);

export default router;
