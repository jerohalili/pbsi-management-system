import { Router } from 'express';
import { uploadMiddleware, uploadFile, deleteFile } from '../controllers/upload.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { restrictTo } from '../middleware/restrictTo.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { uploadLimiter } from '../middleware/uploadLimiter.js';

const router = Router();

router.use(verifyToken);

// Upload an image / video / file to Cloudinary.
router.post('/:kind', uploadLimiter, restrictTo('admin', 'teacher'), uploadMiddleware, asyncHandler(uploadFile));

// Best-effort Cloudinary cleanup.
router.delete('/:publicId', restrictTo('admin', 'teacher'), asyncHandler(deleteFile));

export default router;
