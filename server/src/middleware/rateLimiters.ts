import { createHash } from 'node:crypto';
import type { Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import { verifyAccessToken } from '../utils/jwt.js';

/**
 * Rate limiting that should never lock out someone who is doing nothing wrong.
 *
 * The rules behind the numbers:
 *  - Only the requests that can be abuse use up a budget: wrong passwords for logins (not
 *    successful logins, and not server errors).
 *  - Many students share one school network, so a network address alone is never the only key.
 *    Logins are counted per address AND email; signed-in traffic is counted per person.
 *  - Every limit has a generous ceiling and a clear message saying how long to wait.
 */
const WINDOW_MS = 15 * 60 * 1000;

export const LIMITS = {
  /** Wrong passwords for one email from one network. */
  loginFailuresPerAccount: 10,
  /** Wrong passwords from one network across all emails (credential stuffing). A whole class can mistype. */
  loginFailuresPerNetwork: 300,
  /** Requests by one signed-in person. Normal use is far below this. */
  requestsPerUser: 1000,
  /** Requests from a network with no valid sign-in (the login page, expired tokens). */
  requestsPerAnonymousNetwork: 300,
  /** Token refreshes by one session. A browser needs about one every 15 minutes. */
  refreshesPerSession: 60,
  /** File uploads by one person. */
  uploadsPerUser: 60,
};

const callerKeys = new WeakMap<Request, string>();

/** The signed-in person when the request carries a valid access token, otherwise the network address. */
export function callerKey(req: Request): string {
  const cached = callerKeys.get(req);
  if (cached) return cached;

  let key = `ip:${req.ip ?? 'unknown'}`;
  const token = req.cookies?.access_token ?? req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      if (typeof decoded?.sub === 'string') key = `user:${decoded.sub}`;
    } catch {
      // Expired or invalid: treated like any anonymous caller.
    }
  }
  callerKeys.set(req, key);
  return key;
}

function minutesUntilReset(req: Request): number {
  const info = (req as Request & { rateLimit?: { resetTime?: Date } }).rateLimit;
  const ms = (info?.resetTime?.getTime() ?? Date.now() + WINDOW_MS) - Date.now();
  return Math.max(1, Math.ceil(ms / 60000));
}

function tooMany(message: string) {
  return (req: Request, res: Response): void => {
    const minutes = minutesUntilReset(req);
    res.status(429).json({
      error: `${message} Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
      retry_after_minutes: minutes,
    });
  };
}

/** Only a rejected login counts as a failure. Successes and server errors never use up the budget. */
const loginWasNotRejected = (_req: Request, res: Response): boolean =>
  res.statusCode !== 401 && res.statusCode !== 403;

function normalizedEmail(req: Request): string {
  const email = (req.body as { email?: unknown } | undefined)?.email;
  return typeof email === 'string' ? email.trim().toLowerCase().slice(0, 254) : '';
}

/** Brute-force guard for one account: counted per network address and email, failures only. */
export const loginAccountLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: LIMITS.loginFailuresPerAccount,
  skipSuccessfulRequests: true,
  requestWasSuccessful: loginWasNotRejected,
  keyGenerator: (req) => `${req.ip ?? 'unknown'}|${normalizedEmail(req)}`,
  handler: tooMany('Too many failed sign-in attempts for this account from this network.'),
});

/** Wider guard against one network trying many accounts. High enough for a class that mistypes. */
export const loginNetworkLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: LIMITS.loginFailuresPerNetwork,
  skipSuccessfulRequests: true,
  requestWasSuccessful: loginWasNotRejected,
  keyGenerator: (req) => req.ip ?? 'unknown',
  handler: tooMany('Too many failed sign-in attempts from this network.'),
});

/** Everything else under /api: per signed-in person, per network only for callers who are not signed in. */
export const apiLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: (req) => (callerKey(req).startsWith('user:') ? LIMITS.requestsPerUser : LIMITS.requestsPerAnonymousNetwork),
  keyGenerator: callerKey,
  skip: (req) => {
    const path = req.originalUrl.split('?')[0];
    // Health checks are the platform's; login and refresh have their own limits above and below.
    return path === '/api/health' || path === '/api/auth/login' || path === '/api/auth/refresh';
  },
  handler: tooMany('You are sending requests too quickly.'),
});

/**
 * Token refresh is cookie-only (there is no usable access token), so it is counted per session
 * cookie instead of per network: one student's browser cannot use up the budget of their classmates.
 */
export const refreshLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: LIMITS.refreshesPerSession,
  keyGenerator: (req) => {
    const token = req.cookies?.refresh_token;
    return typeof token === 'string' && token
      ? `session:${createHash('sha256').update(token).digest('hex').slice(0, 32)}`
      : `ip:${req.ip ?? 'unknown'}`;
  },
  handler: tooMany('Your session is refreshing too often.'),
});

/** Uploads are the expensive requests, so they get their own limit, per person. */
export const uploadLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: LIMITS.uploadsPerUser,
  keyGenerator: callerKey,
  handler: tooMany('You are uploading too many files.'),
});
