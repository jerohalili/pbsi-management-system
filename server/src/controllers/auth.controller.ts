import { Request, Response } from 'express';
import { sql } from '../config/db.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js';
import { comparePassword } from '../utils/password.js';
import { isTokenRevoked } from '../utils/sessions.js';
import type { AppError } from '../middleware/errorHandler.js';

const COOKIE_OPTIONS: Record<string, unknown> = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email: string; password: string };

  const [user] = await sql`
    SELECT id, email, password_hash, role, is_active
    FROM users WHERE email = ${email}
  `;

  if (!user || !(await comparePassword(password, user.password_hash))) {
    const err = new Error('Invalid email or password') as AppError;
    err.statusCode = 401;
    throw err;
  }

  if (!user.is_active) {
    const err = new Error('Account is deactivated') as AppError;
    err.statusCode = 403;
    throw err;
  }

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  const refreshToken = signRefreshToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  res.cookie('access_token', accessToken, COOKIE_OPTIONS);
  res.cookie('refresh_token', refreshToken, COOKIE_OPTIONS);

  res.json({
    user: { id: user.id, email: user.email, role: user.role },
    access_token: accessToken,
  });
}

const CLEAR_COOKIE_OPTIONS: Record<string, unknown> = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
};

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie('access_token', CLEAR_COOKIE_OPTIONS);
  res.clearCookie('refresh_token', CLEAR_COOKIE_OPTIONS);
  res.json({ message: 'Logged out successfully' });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.refresh_token;
  if (!token) {
    const err = new Error('No refresh token') as AppError;
    err.statusCode = 401;
    throw err;
  }

  try {
    const decoded = verifyRefreshToken(token);
    const [account] = await sql`
      SELECT is_active, tokens_valid_after FROM users WHERE id = ${decoded.sub}
    `;
    if (!account || !account.is_active) {
      throw new Error('Account is not active');
    }
    if (isTokenRevoked(decoded.iat, account.tokens_valid_after)) {
      throw new Error('Session has ended');
    }
    const accessToken = signAccessToken({
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    });
    res.cookie('access_token', accessToken, COOKIE_OPTIONS);
    res.json({ access_token: accessToken });
  } catch {
    const err = new Error('Invalid or expired refresh token') as AppError;
    err.statusCode = 401;
    throw err;
  }
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) {
    const err = new Error('Not authenticated') as AppError;
    err.statusCode = 401;
    throw err;
  }

  const [account] = await sql`
    SELECT is_active FROM users WHERE id = ${user.id}
  `;
  if (!account || !account.is_active) {
    const err = new Error('Account is not active') as AppError;
    err.statusCode = 401;
    throw err;
  }

  const [profile] = await sql`
    SELECT first_name, last_name, phone, date_of_birth, gender, address, avatar_url
    FROM profiles WHERE user_id = ${user.id}
  `;

  res.json({
    user: { ...user, ...profile },
  });
}
