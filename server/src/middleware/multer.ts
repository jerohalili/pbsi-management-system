import multer from 'multer';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { httpError } from '../utils/access.js';

const MB = 1024 * 1024;

/**
 * Upload limits. Files are buffered in memory before they go to Cloudinary, so these also
 * protect the API server's RAM (the old 1 GB cap could take a small instance down).
 * Cloudinary's own per-file limit depends on the plan; keep these at or under it.
 */
export const UPLOAD_LIMITS = {
  /** Student submissions and teacher materials. */
  document: 10 * MB,
  /** Profile pictures. */
  avatar: 2 * MB,
  /** Quiz question images. */
  quizImage: 5 * MB,
  /** Module content (teacher-only /upload route), by kind. */
  moduleImage: 10 * MB,
  moduleFile: 10 * MB,
  moduleVideo: 100 * MB,
} as const;

export const DOCUMENT_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'odt', 'ods', 'odp',
  'txt', 'csv', 'rtf', 'zip', 'jpg', 'jpeg', 'png', 'webp',
];
export const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

const extensionOf = (name: string): string => name.split('.').pop()?.toLowerCase() ?? '';

interface FieldOptions {
  /** Multipart field name that carries the file. Default `file`. */
  field?: string;
  maxBytes: number;
  /** Lower-case extensions without the dot. Omit to accept any extension. */
  extensions?: string[];
}

/**
 * Single-file multipart upload held in memory, with a size cap and an extension allow-list.
 * Problems become friendly 4xx errors instead of a generic 500.
 */
export function uploadField({ field = 'file', maxBytes, extensions }: FieldOptions): RequestHandler {
  const handler = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxBytes, files: 1 },
    fileFilter: (_req, file, cb) => {
      if (extensions && !extensions.includes(extensionOf(file.originalname))) {
        cb(httpError(415, `This file type isn’t allowed. Allowed: ${extensions.join(', ')}.`));
        return;
      }
      cb(null, true);
    },
  }).single(field);

  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, (err: unknown) => {
      if (!err) return next();
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(httpError(413, `That file is too large. The limit is ${Math.round(maxBytes / MB)} MB.`));
        }
        return next(httpError(400, 'The upload could not be read. Send one file in the “file” field.'));
      }
      return next(err);
    });
  };
}

/** Module content upload (`/api/upload/:kind`): the limit depends on the kind. */
export const uploadSingle: RequestHandler = (req, res, next) => {
  const kind = (req.params as { kind?: string }).kind;
  const maxBytes =
    kind === 'video'
      ? UPLOAD_LIMITS.moduleVideo
      : kind === 'image'
        ? UPLOAD_LIMITS.moduleImage
        : UPLOAD_LIMITS.moduleFile;
  uploadField({ maxBytes })(req, res, next);
};
