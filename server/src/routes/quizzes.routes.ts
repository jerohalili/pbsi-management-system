import { Router } from 'express';
import {
  listQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
} from '../controllers/quizzes.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { restrictTo } from '../middleware/restrictTo.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { quizSchema } from '../utils/validation.js';

const router = Router();

router.use(verifyToken);

router.get('/:course_id', asyncHandler(listQuizzes));
router.get('/:id', asyncHandler(getQuiz));
router.post(
  '/',
  restrictTo('admin', 'teacher'),
  validate(quizSchema),
  asyncHandler(createQuiz),
);
router.patch(
  '/:id',
  restrictTo('admin', 'teacher'),
  validate(quizSchema.partial()),
  asyncHandler(updateQuiz),
);
router.delete('/:id', restrictTo('admin'), asyncHandler(deleteQuiz));

export default router;
