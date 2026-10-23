import { Router } from 'express';
import {
  listTimetable,
  createTimetableEntry,
  deleteTimetableEntry,
} from '../controllers/timetable.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { restrictTo } from '../middleware/restrictTo.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { timetableSchema } from '../utils/validation.js';

const router = Router();

router.use(verifyToken);

router.get('/', asyncHandler(listTimetable));
router.post(
  '/',
  restrictTo('admin'),
  validate(timetableSchema),
  asyncHandler(createTimetableEntry),
);
router.delete('/:id', restrictTo('admin'), asyncHandler(deleteTimetableEntry));

export default router;
