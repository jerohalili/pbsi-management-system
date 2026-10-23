import { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import { verifyAccessToken } from '../utils/jwt.js';
import { AuthUser } from '../types/index.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const token = req.cookies?.access_token;

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: no access token provided' });
    return;
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized: invalid or expired token' });
  }
}

export { cookieParser };
