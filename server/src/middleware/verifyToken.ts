import { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import { sql } from '../config/db.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { isTokenRevoked } from '../utils/sessions.js';
import { AuthUser } from '../types/index.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token =
    req.cookies?.access_token ??
    req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: no access token provided' });
    return;
  }

  let decoded: { sub: string; email: string; role: AuthUser['role']; iat?: number };
  try {
    decoded = verifyAccessToken(token);
  } catch {
    res.status(401).json({ error: 'Unauthorized: invalid or expired token' });
    return;
  }

  try {
    // Checked on every request so deactivating an account (or resetting its password) ends
    // its sessions straight away instead of when the 15-minute token runs out.
    const [account] = await sql`
      SELECT is_active, tokens_valid_after FROM users WHERE id = ${decoded.sub}
    `;
    if (!account || !account.is_active || isTokenRevoked(decoded.iat, account.tokens_valid_after)) {
      res.status(401).json({ error: 'Unauthorized: this session has ended, please sign in again' });
      return;
    }

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (err) {
    next(err as Error);
  }
}

export { cookieParser };
