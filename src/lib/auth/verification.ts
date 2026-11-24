import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

/**
 * State for the admin's second sign-in step. After the password is accepted,
 * Neon Auth emails a one-time code, and admin pages, Server Actions and API
 * routes only accept the session once that code has been entered.
 *
 * The state lives in two httpOnly cookies, HMAC-signed with
 * NEON_AUTH_COOKIE_SECRET so they can't be forged:
 * - pending:  this browser passed the password step and is waiting for a code
 * - verified: this browser entered the emailed code for this user
 *
 * Setting or clearing them only works in Server Actions and Route Handlers.
 */

const PENDING_COOKIE = 'admin_pending_verification'
const VERIFIED_COOKIE = 'admin_verified'

/** How long the emailed code can be entered after the password step. */
const PENDING_TTL_SECONDS = 10 * 60
/** How long a verified sign-in lasts before a new code is required. */
const VERIFIED_TTL_SECONDS = 12 * 60 * 60

/**
 * What the code step is waiting for:
 * - `sign-in`: the password was accepted; the code completes the sign-in
 * - `verify-email`: the password was accepted but Neon Auth requires the email
 *   to be verified first; the code verifies it, then the password is sent again
 */
export type PendingStep = 'sign-in' | 'verify-email'

type Purpose = PendingStep | 'verified'

function signature(purpose: Purpose, subject: string, expiresAt: number): string {
  const secret = process.env.NEON_AUTH_COOKIE_SECRET
  if (!secret) throw new Error('NEON_AUTH_COOKIE_SECRET is not set')
  return createHmac('sha256', secret)
    .update(`admin-verification|${purpose}|${subject}|${expiresAt}`)
    .digest('base64url')
}

function createToken(purpose: Purpose, subject: string, ttlSeconds: number): string {
  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds
  return `${purpose}.${expiresAt}.${signature(purpose, subject, expiresAt)}`
}

function tokenMatches(token: string | undefined, purpose: Purpose, subject: string): boolean {
  const [tokenPurpose, expiresAtText, tokenSignature] = token?.split('.') ?? []
  if (tokenPurpose !== purpose || !expiresAtText || !tokenSignature) return false

  const expiresAt = Number(expiresAtText)
  if (!Number.isInteger(expiresAt) || expiresAt < Date.now() / 1000) return false

  const expected = Buffer.from(signature(purpose, subject, expiresAt))
  const actual = Buffer.from(tokenSignature)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  }
}

/**
 * Records that the password step passed and a code was sent, and drops any
 * earlier verification so the new code is required.
 *
 * @param subject - The user id for `sign-in`, the normalized email for `verify-email`
 */
export async function beginVerification(step: PendingStep, subject: string): Promise<void> {
  const store = await cookies()
  store.delete(VERIFIED_COOKIE)
  store.set(PENDING_COOKIE, createToken(step, subject, PENDING_TTL_SECONDS), cookieOptions(PENDING_TTL_SECONDS))
}

/** Whether this browser is waiting for a code for `step` and `subject`. */
export async function hasPendingVerification(step: PendingStep, subject: string): Promise<boolean> {
  const store = await cookies()
  return tokenMatches(store.get(PENDING_COOKIE)?.value, step, subject)
}

/** Marks `userId` as verified in this browser after a correct code. */
export async function completeVerification(userId: string): Promise<void> {
  const store = await cookies()
  store.delete(PENDING_COOKIE)
  store.set(VERIFIED_COOKIE, createToken('verified', userId, VERIFIED_TTL_SECONDS), cookieOptions(VERIFIED_TTL_SECONDS))
}

/** Whether this browser entered a valid code for `userId` within the last 12 hours. */
export async function isVerified(userId: string): Promise<boolean> {
  const store = await cookies()
  return tokenMatches(store.get(VERIFIED_COOKIE)?.value, 'verified', userId)
}

/** Removes both verification cookies (sign-out, restarting sign-in). */
export async function clearVerification(): Promise<void> {
  const store = await cookies()
  store.delete(PENDING_COOKIE)
  store.delete(VERIFIED_COOKIE)
}
