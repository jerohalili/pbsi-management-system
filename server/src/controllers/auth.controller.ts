import { Request, Response } from 'express';
import { sql } from '../config/db.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import type { AppError } from '../middleware/errorHandler.js';
import { UserRole } from '../types/index.js';

const COOKIE_OPTIONS: Record<string, unknown> = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password, role, first_name, last_name } = req.body as {
    email: string;
    password: string;
    role: UserRole;
    first_name: string;
    last_name: string;
  };

  const existing = await sql`
    SELECT id FROM users WHERE email = ${email}
  `;
  if (existing.length > 0) {
    const err = new Error('Email already registered') as AppError;
    err.statusCode = 409;
    throw err;
  }

  const password_hash = await hashPassword(password);

  const [user] = await sql`
    INSERT INTO users (email, password_hash, role)
    VALUES (${email}, ${password_hash}, ${role})
    RETURNING id, email, role, created_at
  `;

  await sql`
    INSERT INTO profiles (user_id, first_name, last_name)
    VALUES (${user.id}, ${first_name}, ${last_name})
  `;

  if (role === 'teacher') {
    await sql`
      INSERT INTO teachers (user_id, employee_id)
      VALUES (${user.id}, ${user.id})
    `;
  } else if (role === 'student') {
    await sql`
      INSERT INTO students (user_id, student_id)
      VALUES (${user.id}, ${user.id})
    `;
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

  res.status(201).json({
    user: { id: user.id, email: user.email, role: user.role },
    access_token: accessToken,
  });
}

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

  const [profile] = await sql`
    SELECT first_name, last_name, phone, date_of_birth, gender, address, avatar_url
    FROM profiles WHERE user_id = ${user.id}
  `;

  res.json({
    user: { ...user, ...profile },
  });
}
