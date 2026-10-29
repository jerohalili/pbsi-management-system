import { Router } from 'express';
import {
  listTimetable,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
} from '../controllers/timetable.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { restrictTo } from '../middleware/restrictTo.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { timetableSchema, timetableUpdateSchema } from '../utils/validation.js';

const router = Router();

router.use(verifyToken);

router.get('/', asyncHandler(listTimetable));
router.post(
  '/',
  restrictTo('admin', 'teacher'),
  validate(timetableSchema),
  asyncHandler(createTimetableEntry),
);
router.patch(
  '/:id',
  restrictTo('admin', 'teacher'),
  validate(timetableUpdateSchema),
  asyncHandler(updateTimetableEntry),
);
router.delete('/:id', restrictTo('admin', 'teacher'), asyncHandler(deleteTimetableEntry));

export default router;
