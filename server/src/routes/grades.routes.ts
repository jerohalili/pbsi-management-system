import { Router } from 'express';
import { listGrades, getStudentGPA } from '../controllers/grades.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.use(verifyToken);

router.get('/', asyncHandler(listGrades));
router.get('/gpa/:student_id', asyncHandler(getStudentGPA));

export default router;
