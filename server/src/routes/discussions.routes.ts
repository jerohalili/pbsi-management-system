import { Router } from 'express';
import {
  listThreads,
  createThread,
  listReplies,
  createReply,
} from '../controllers/discussions.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.use(verifyToken);

router.get('/:course_id', asyncHandler(listThreads));
router.post('/', asyncHandler(createThread));
router.get('/:thread_id/replies', asyncHandler(listReplies));
router.post('/:thread_id/replies', asyncHandler(createReply));

export default router;
