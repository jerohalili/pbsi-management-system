import { Router } from 'express';
import {
  submitQuizAttempt,
  listQuizAttempts,
} from '../controllers/quizAttempts.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { quizAttemptSchema } from '../utils/validation.js';

const router = Router();

router.use(verifyToken);

router.post('/', validate(quizAttemptSchema), asyncHandler(submitQuizAttempt));
router.get('/:quiz_id', asyncHandler(listQuizAttempts));

export default router;
