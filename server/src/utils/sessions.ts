/**
 * True when a token was issued before the account's tokens_valid_after moment, meaning the
 * session was ended on purpose (the account was deactivated or its password was reset).
 * JWT issue times only have whole-second precision, so a token issued in the same second as
 * the revocation counts as revoked.
 */
export function isTokenRevoked(
  issuedAtSeconds: number | undefined,
  validAfter: Date | string | null | undefined,
): boolean {
  if (!validAfter) return false;
  if (typeof issuedAtSeconds !== 'number') return true;
  return issuedAtSeconds * 1000 < new Date(validAfter).getTime();
}
