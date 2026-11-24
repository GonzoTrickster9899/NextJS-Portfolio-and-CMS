import { createNeonAuth } from '@neon/auth/next/server'

/**
 * Neon Auth (managed Better Auth) server instance.
 *
 * Use it in Server Components, Server Actions, Route Handlers and the proxy.
 * Server Components that call `auth.getSession()` must render dynamically.
 */
export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
})
