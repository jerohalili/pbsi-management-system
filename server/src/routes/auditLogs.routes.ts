import { Router } from 'express';
import { listAuditLogs, createAuditLog } from '../controllers/auditLogs.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { restrictTo } from '../middleware/restrictTo.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.use(verifyToken);

router.get('/', restrictTo('admin'), asyncHandler(listAuditLogs));
router.post('/', restrictTo('admin'), asyncHandler(createAuditLog));

export default router;
