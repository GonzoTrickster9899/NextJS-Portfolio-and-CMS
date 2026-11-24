import { redirect } from 'next/navigation'
import { getAdminUser, getPendingVerification } from '@/lib/auth/admin'
import LoginForm from '@/components/auth/LoginForm'

// Reads the Neon Auth session, so it must render per request
export const dynamic = 'force-dynamic'

/**
 * Admin login page. Sends a verified admin straight to `/admin`, and reopens the
 * code step when the password was accepted but the emailed code wasn't entered yet.
 */
export default async function LoginPage() {
  if (await getAdminUser()) redirect('/admin')

  const pending = await getPendingVerification()
  return <LoginForm pending={pending ? { step: pending.step, email: pending.email } : null} />
}
