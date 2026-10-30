import { Request, Response } from 'express';
import { sql } from '../config/db.js';
import { httpError } from '../utils/access.js';
import { recordAudit } from '../utils/audit.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { changePasswordSchema, updateOwnProfileSchema } from '../utils/validation.js';

/**
 * PATCH /api/auth/me — change your own name and contact details.
 * Email, role and school ids are deliberately not editable here: they identify the account and
 * stay under administrator control.
 */
export async function updateOwnProfile(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) throw httpError(401, 'Not authenticated');

  const input = updateOwnProfileSchema.parse(req.body);

  // Optional text fields: undefined = leave unchanged, '' = clear.
  const phoneProvided = input.phone !== undefined;
  const dobProvided = input.date_of_birth !== undefined;
  const addressProvided = input.address !== undefined;

  const [profile] = await sql`
    UPDATE profiles
    SET first_name = COALESCE(${input.first_name ?? null}, first_name),
        last_name = COALESCE(${input.last_name ?? null}, last_name),
        phone = CASE WHEN ${phoneProvided}::boolean THEN ${input.phone || null} ELSE phone END,
        date_of_birth = CASE WHEN ${dobProvided}::boolean THEN ${input.date_of_birth || null} ELSE date_of_birth END,
        address = CASE WHEN ${addressProvided}::boolean THEN ${input.address || null} ELSE address END
    WHERE user_id = ${user.id}
    RETURNING first_name, last_name, phone, date_of_birth, gender, address, avatar_url
  `;
  if (!profile) throw httpError(404, 'Profile not found');

  // Only the names of the changed fields are logged, never the values (phone, address are personal data).
  await recordAudit(req, 'profile.update', 'user', user.id, null, {
    fields: Object.keys(input).filter((key) => input[key as keyof typeof input] !== undefined),
  });

  res.json({ profile });
}

/**
 * PUT /api/auth/me/password — change your own password.
 * Needs the current password, and ends every session (this one included), the same way an
 * administrator's password reset does, so a stolen session cannot outlive the change.
 */
export async function changeOwnPassword(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) throw httpError(401, 'Not authenticated');

  const { current_password: current, new_password: next } = changePasswordSchema.parse(req.body);

  const [account] = await sql`SELECT password_hash FROM users WHERE id = ${user.id}`;
  // 400, not 401: a 401 would make the app think the session expired and sign the person out.
  if (!account || !(await comparePassword(current, account.password_hash as string))) {
    throw httpError(400, 'Your current password is incorrect');
  }
  if (current === next) throw httpError(400, 'Choose a password that is different from your current one');

  const passwordHash = await hashPassword(next);
  await sql`UPDATE users SET password_hash = ${passwordHash}, tokens_valid_after = now() WHERE id = ${user.id}`;
  await recordAudit(req, 'password.change', 'user', user.id, null, null);

  res.json({ message: 'Password changed. Please sign in again.' });
}
