import { Router } from 'express';
import {
  listStudents,
  getStudent,
  exportStudents,
} from '../controllers/students.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { restrictTo } from '../middleware/restrictTo.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.use(verifyToken);

router.get('/', restrictTo('admin', 'teacher'), asyncHandler(listStudents));
router.get('/:id', asyncHandler(getStudent));
router.get('/export/csv', restrictTo('admin'), asyncHandler(exportStudents));

export default router;
