'use server'

import { auth } from '@/lib/auth/server'
import { getPendingVerification, isAdminEmail } from '@/lib/auth/admin'
import {
  beginVerification,
  clearVerification,
  completeVerification,
  type PendingStep,
} from '@/lib/auth/verification'

const INVALID_CREDENTIALS = 'Invalid email or password'
const SIGN_IN_EXPIRED = 'Your sign-in expired. Enter your password again.'

type AuthError = { status: number; code?: string }

export type SignInResult = { error: string } | { step: 'code'; reason: PendingStep }

export type VerifyCodeResult =
  | { error: string; restart?: boolean }
  /** The code was correct; the admin area is now accessible. */
  | { status: 'verified' }
  /** The email is now verified; send the password again to finish signing in. */
  | { status: 'email-verified' }

/**
 * Emails a one-time code to the admin through Neon Auth.
 *
 * Sign-in uses the `email-verification` OTP type because, unlike `sign-in`, its
 * codes can't be used to sign in without a password. `forget-password` codes
 * can only set a new password.
 */
async function sendCode(
  email: string,
  type: 'email-verification' | 'forget-password' = 'email-verification'
): Promise<{ error?: string }> {
  const { error } = await auth.emailOtp.sendVerificationOtp({ email, type })
  if (!error) return {}
  console.error('[SEND_VERIFICATION_CODE]', error)
  if (error.status === 429) return { error: 'Too many codes requested. Wait a minute, then try again.' }
  return { error: 'Could not send the verification code. Try again shortly.' }
}

async function startCodeStep(step: PendingStep, subject: string, email: string): Promise<SignInResult> {
  await beginVerification(step, subject)
  const { error } = await sendCode(email)
  if (error) {
    await clearVerification()
    return { error }
  }
  return { step: 'code', reason: step }
}

function codeErrorMessage(error: AuthError): string {
  switch (error.code) {
    case 'INVALID_OTP':
      return 'Incorrect code. Check the email and try again.'
    case 'OTP_EXPIRED':
      return 'This code has expired. Send a new one.'
    case 'TOO_MANY_ATTEMPTS':
      return 'Too many incorrect attempts. Send a new code.'
    default:
      if (error.status >= 500) return 'Verification service unavailable. Try again shortly.'
      return 'Could not verify the code. Try again.'
  }
}

/**
 * Step 1 of admin sign-in: checks the email and password with Neon Auth, then
 * emails a one-time code that {@link verifyCodeAction} must confirm before the
 * admin area opens.
 *
 * Non-admin emails are rejected before contacting Neon Auth, with the same
 * generic message as a wrong password so the admin address is not revealed.
 *
 * @returns `{ step: 'code' }` once the code is sent, or `{ error }` to show the user
 */
export async function signInAction(email: string, password: string): Promise<SignInResult> {
  const normalizedEmail = email.trim().toLowerCase()
  if (!isAdminEmail(normalizedEmail) || !password) return { error: INVALID_CREDENTIALS }

  try {
    await clearVerification()
    const { data, error } = await auth.signIn.email({ email: normalizedEmail, password })

    if (error) {
      // Neon Auth checks the password before email verification, so this means
      // the password was right but the address must be verified first.
      if (error.code === 'EMAIL_NOT_VERIFIED') {
        return startCodeStep('verify-email', normalizedEmail, normalizedEmail)
      }
      // Transport failures (e.g. wrong NEON_AUTH_BASE_URL) come back as 502
      if (error.status >= 500) {
        console.error('[SIGN_IN]', error)
        return { error: 'Authentication service unavailable. Try again shortly.' }
      }
      return { error: INVALID_CREDENTIALS }
    }

    return startCodeStep('sign-in', data.user.id, normalizedEmail)
  } catch (err) {
    console.error('[SIGN_IN]', err)
    return { error: 'Sign in failed. Try again.' }
  }
}

/**
 * Step 2 of admin sign-in: checks the emailed code.
 *
 * Codes are single use: Neon Auth deletes a code once it is accepted or after too
 * many wrong attempts. Entering it also marks the admin email as verified.
 */
export async function verifyCodeAction(code: string): Promise<VerifyCodeResult> {
  const otp = code.replace(/\s+/g, '')
  if (!/^\d{4,10}$/.test(otp)) return { error: 'Enter the code from the email.' }

  try {
    const pending = await getPendingVerification()
    if (!pending) return { error: SIGN_IN_EXPIRED, restart: true }

    const { error } = await auth.emailOtp.verifyEmail({ email: pending.email, otp })
    if (error) {
      if (error.status >= 500) console.error('[VERIFY_CODE]', error)
      return { error: codeErrorMessage(error) }
    }

    if (pending.step === 'verify-email' || !pending.userId) {
      await clearVerification()
      return { status: 'email-verified' }
    }

    await completeVerification(pending.userId)
    return { status: 'verified' }
  } catch (err) {
    console.error('[VERIFY_CODE]', err)
    return { error: 'Could not verify the code. Try again.' }
  }
}

/**
 * Emails a new code for the sign-in waiting in this browser and restarts its
 * 10-minute window.
 */
export async function resendCodeAction(): Promise<{ error?: string; restart?: boolean }> {
  try {
    const pending = await getPendingVerification()
    if (!pending) return { error: SIGN_IN_EXPIRED, restart: true }

    const { error } = await sendCode(pending.email)
    if (error) return { error }

    await beginVerification(pending.step, pending.userId ?? pending.email)
    return {}
  } catch (err) {
    console.error('[RESEND_CODE]', err)
    return { error: 'Could not send the verification code. Try again shortly.' }
  }
}

const MIN_PASSWORD_LENGTH = 12
const MAX_PASSWORD_LENGTH = 128

/**
 * Step 1 of setting or resetting the admin password: emails a one-time code.
 *
 * Accounts created in the Neon Console have no password, so this is also how
 * the first password is set. Other emails get the same response without an
 * email being sent, so the admin address is not revealed.
 */
export async function requestPasswordResetAction(email: string): Promise<{ error?: string }> {
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail) return { error: 'Enter your email.' }
  if (!isAdminEmail(normalizedEmail)) return {}

  try {
    return await sendCode(normalizedEmail, 'forget-password')
  } catch (err) {
    console.error('[REQUEST_PASSWORD_RESET]', err)
    return { error: 'Could not send the code. Try again shortly.' }
  }
}

/**
 * Step 2 of setting or resetting the admin password: checks the emailed code
 * and saves the new password. Neon Auth adds a password login to accounts that
 * don't have one yet. The usual two-step sign-in still follows.
 */
export async function resetPasswordAction(
  email: string,
  code: string,
  newPassword: string
): Promise<{ error?: string }> {
  const normalizedEmail = email.trim().toLowerCase()
  const otp = code.replace(/\s+/g, '')
  if (!/^\d{4,10}$/.test(otp)) return { error: 'Enter the code from the email.' }
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return { error: `Use at least ${MIN_PASSWORD_LENGTH} characters.` }
  }
  if (newPassword.length > MAX_PASSWORD_LENGTH) {
    return { error: `Use at most ${MAX_PASSWORD_LENGTH} characters.` }
  }
  // No code was sent to other emails, so answer as for a wrong code
  if (!isAdminEmail(normalizedEmail)) return { error: codeErrorMessage({ status: 400, code: 'INVALID_OTP' }) }

  try {
    const { error } = await auth.emailOtp.resetPassword({
      email: normalizedEmail,
      otp,
      password: newPassword,
    })
    if (error) {
      if (error.code === 'PASSWORD_TOO_SHORT' || error.code === 'PASSWORD_TOO_LONG') {
        return { error: error.message || 'Choose a different password length.' }
      }
      if (error.status >= 500) console.error('[RESET_PASSWORD]', error)
      return { error: codeErrorMessage(error) }
    }
    await clearVerification()
    return {}
  } catch (err) {
    console.error('[RESET_PASSWORD]', err)
    return { error: 'Could not save the password. Try again.' }
  }
}

/**
 * Signs the current user out, clearing the Neon Auth session cookies and the
 * verification cookies.
 */
export async function signOutAction(): Promise<void> {
  await clearVerification()
  await auth.signOut()
}
