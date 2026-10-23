import { Router } from 'express';
import { listGrades, createGrade, getStudentGPA } from '../controllers/grades.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { restrictTo } from '../middleware/restrictTo.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.use(verifyToken);

router.get('/', asyncHandler(listGrades));
router.post('/', restrictTo('admin', 'teacher'), asyncHandler(createGrade));
router.get('/gpa/:student_id', asyncHandler(getStudentGPA));

export default router;
