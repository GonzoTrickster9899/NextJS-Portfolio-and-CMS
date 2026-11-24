import { auth } from './server'
import { hasPendingVerification, isVerified, type PendingStep } from './verification'

/** The configured admin email, normalized, or `null` when ADMIN_EMAIL is unset. */
export function getAdminEmail(): string | null {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase() || null
}

/**
 * Whether `email` matches the single admin account configured in `ADMIN_EMAIL`.
 * Comparison ignores case and surrounding whitespace.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  const adminEmail = getAdminEmail()
  return !!adminEmail && !!email && email.trim().toLowerCase() === adminEmail
}

/**
 * Returns the admin's Neon Auth session (password step passed), whether or not
 * the emailed code has been entered yet. Use {@link getAdminUser} for access checks.
 */
export async function getAdminSession() {
  const { data } = await auth.getSession()
  if (!data?.session || !data.user || !isAdminEmail(data.user.email)) return null
  return { session: data.session, user: data.user }
}

/**
 * Returns the signed-in user if they are the configured admin and have entered
 * the emailed verification code, otherwise `null`.
 */
export async function getAdminUser() {
  const adminSession = await getAdminSession()
  if (!adminSession || !(await isVerified(adminSession.user.id))) return null
  return adminSession.user
}

/** A sign-in that passed the password step and is waiting for the emailed code. */
export type PendingVerification = {
  step: PendingStep
  email: string
  /** Set for the `sign-in` step, where a Neon Auth session already exists. */
  userId?: string
}

/**
 * Returns the code step this browser is waiting for, or `null` when the
 * password step hasn't passed in the last 10 minutes.
 */
export async function getPendingVerification(): Promise<PendingVerification | null> {
  const adminSession = await getAdminSession()
  if (adminSession && (await hasPendingVerification('sign-in', adminSession.user.id))) {
    return {
      step: 'sign-in',
      email: adminSession.user.email.toLowerCase(),
      userId: adminSession.user.id,
    }
  }

  const adminEmail = getAdminEmail()
  if (adminEmail && (await hasPendingVerification('verify-email', adminEmail))) {
    return { step: 'verify-email', email: adminEmail }
  }

  return null
}

/**
 * Ensures the current request comes from the configured, verified admin.
 *
 * @returns The admin user
 * @throws Error('Unauthorized') if nobody is signed in, the user is not the
 * admin, or the emailed code hasn't been entered
 */
export async function assertAdmin() {
  const user = await getAdminUser()
  if (!user) throw new Error('Unauthorized')
  return user
}
