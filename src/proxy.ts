import { auth } from '@/lib/auth/server'

/**
 * Protects `/admin/*`: refreshes the Neon Auth session and redirects signed-out
 * visitors to `/login`.
 *
 * This only checks that someone is signed in. The admin-email check and the
 * emailed verification code are enforced in the admin layout and in every
 * Server Action / API route via `getAdminUser()` / `assertAdmin()`.
 */
export default auth.middleware({ loginUrl: '/login' })

export const config = {
  matcher: ['/admin/:path*'],
}
