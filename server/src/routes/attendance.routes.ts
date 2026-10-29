import { Router } from 'express';
import {
  listAttendance,
  getRoster,
  markAttendance,
  markAttendanceBulk,
  getAttendanceSummary,
} from '../controllers/attendance.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { restrictTo } from '../middleware/restrictTo.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { attendanceSchema, bulkAttendanceSchema } from '../utils/validation.js';

const router = Router();

router.use(verifyToken);

router.get('/', asyncHandler(listAttendance));
router.get('/roster', restrictTo('admin', 'teacher'), asyncHandler(getRoster));
router.get('/summary/:student_id', asyncHandler(getAttendanceSummary));
router.post(
  '/',
  restrictTo('admin', 'teacher'),
  validate(attendanceSchema),
  asyncHandler(markAttendance),
);
router.post(
  '/bulk',
  restrictTo('admin', 'teacher'),
  validate(bulkAttendanceSchema),
  asyncHandler(markAttendanceBulk),
);

export default router;
