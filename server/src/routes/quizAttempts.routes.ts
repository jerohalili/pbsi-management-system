import { Router } from 'express';
import {
  submitQuizAttempt,
  getQuizAttempt,
  listQuizAttempts,
} from '../controllers/quizAttempts.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { restrictTo } from '../middleware/restrictTo.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { submitQuizAttemptSchema } from '../utils/validation.js';

const router = Router();

router.use(verifyToken);

// GET /api/quiz-attempts?quiz_id=  (teachers/admins: the whole class for one quiz)
router.get('/', restrictTo('admin', 'teacher'), asyncHandler(listQuizAttempts));
router.get('/:id', asyncHandler(getQuizAttempt));
router.post('/', restrictTo('student'), validate(submitQuizAttemptSchema), asyncHandler(submitQuizAttempt));

export default router;
