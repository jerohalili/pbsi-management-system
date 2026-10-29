import multer from 'multer';

/** In-memory storage: files are small enough (videos go straight to Cloudinary). */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1 GB
});

export const uploadSingle = upload.single('file');
