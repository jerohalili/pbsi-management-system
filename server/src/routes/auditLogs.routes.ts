import { Router } from 'express';
import { listAuditLogs } from '../controllers/auditLogs.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { restrictTo } from '../middleware/restrictTo.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.use(verifyToken);

// Read-only on purpose: an audit trail that can be written through the API can be forged.
router.get('/', restrictTo('admin'), asyncHandler(listAuditLogs));

export default router;
