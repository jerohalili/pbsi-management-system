import { Router } from 'express';
import { listTeachers } from '../controllers/teachers.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { restrictTo } from '../middleware/restrictTo.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.use(verifyToken);

router.get('/', restrictTo('admin'), asyncHandler(listTeachers));

export default router;
