import { Router } from 'express';
import {
  listQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '../controllers/quizzes.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { restrictTo } from '../middleware/restrictTo.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { createQuizSchema, questionInputSchema, updateQuizSchema } from '../utils/validation.js';

const router = Router();

router.use(verifyToken);

// GET /api/quizzes?course_id=  (everyone; students only see published quizzes)
router.get('/', asyncHandler(listQuizzes));
router.get('/:id', asyncHandler(getQuiz));
router.post('/', restrictTo('admin', 'teacher'), validate(createQuizSchema), asyncHandler(createQuiz));
router.patch('/:id', restrictTo('admin', 'teacher'), validate(updateQuizSchema), asyncHandler(updateQuiz));
router.delete('/:id', restrictTo('admin'), asyncHandler(deleteQuiz));

router.post(
  '/:id/questions',
  restrictTo('admin', 'teacher'),
  validate(questionInputSchema),
  asyncHandler(createQuestion),
);
router.patch(
  '/:id/questions/:question_id',
  restrictTo('admin', 'teacher'),
  validate(questionInputSchema),
  asyncHandler(updateQuestion),
);
router.delete(
  '/:id/questions/:question_id',
  restrictTo('admin', 'teacher'),
  asyncHandler(deleteQuestion),
);

export default router;
