import { Router } from 'express';
import {
  listThreads,
  getThread,
  createThread,
  updateThread,
  deleteThread,
  reportThread,
  listReplies,
  createReply,
  updateReply,
  deleteReply,
  reportReply,
} from '../controllers/discussions.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { discussionPostLimiter } from '../middleware/discussionLimiter.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.use(verifyToken);

// Fixed paths first, so 'threads' and 'replies' are never read as ids.
router.get('/threads/:thread_id', asyncHandler(getThread));
router.patch('/threads/:thread_id', asyncHandler(updateThread));
router.delete('/threads/:thread_id', asyncHandler(deleteThread));
router.post('/threads/:thread_id/report', discussionPostLimiter, asyncHandler(reportThread));

router.patch('/replies/:reply_id', asyncHandler(updateReply));
router.delete('/replies/:reply_id', asyncHandler(deleteReply));
router.post('/replies/:reply_id/report', discussionPostLimiter, asyncHandler(reportReply));

router.get('/:course_id', asyncHandler(listThreads));
router.post('/', discussionPostLimiter, asyncHandler(createThread));
router.get('/:thread_id/replies', asyncHandler(listReplies));
router.post('/:thread_id/replies', discussionPostLimiter, asyncHandler(createReply));

export default router;
