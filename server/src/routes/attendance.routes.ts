import { Router } from 'express';
import {
  listAttendance,
  markAttendance,
  getAttendanceSummary,
} from '../controllers/attendance.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { restrictTo } from '../middleware/restrictTo.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { attendanceSchema } from '../utils/validation.js';

const router = Router();

router.use(verifyToken);

router.get('/', asyncHandler(listAttendance));
router.get('/summary/:student_id', asyncHandler(getAttendanceSummary));
router.post(
  '/',
  restrictTo('admin', 'teacher'),
  validate(attendanceSchema),
  asyncHandler(markAttendance),
);

export default router;
