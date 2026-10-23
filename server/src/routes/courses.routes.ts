import { Router } from 'express';
import {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/courses.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { restrictTo } from '../middleware/restrictTo.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { courseSchema } from '../utils/validation.js';

const router = Router();

router.use(verifyToken);

router.get('/', asyncHandler(listCourses));
router.get('/:id', asyncHandler(getCourse));
router.post(
  '/',
  restrictTo('admin', 'teacher'),
  validate(courseSchema),
  asyncHandler(createCourse),
);
router.patch(
  '/:id',
  restrictTo('admin', 'teacher'),
  validate(courseSchema.partial()),
  asyncHandler(updateCourse),
);
router.delete('/:id', restrictTo('admin'), asyncHandler(deleteCourse));

export default router;
