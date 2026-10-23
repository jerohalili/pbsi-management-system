import { Request, Response, RequestHandler, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      next(err as Error);
    }
  };
}
