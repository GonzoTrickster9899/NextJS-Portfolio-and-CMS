import { auth } from '@/lib/auth/server'

const handlers = auth.handler()

type RouteContext = { params: Promise<{ path: string[] }> }

/**
 * Proxies Neon Auth requests, except sign-up.
 *
 * This site has a single admin account (created in the Neon Console), so public
 * sign-up through this proxy is always refused.
 */
export async function POST(request: Request, context: RouteContext) {
  const { path } = await context.params
  if (path.some((segment) => segment.toLowerCase() === 'sign-up')) {
    return Response.json({ error: 'Sign-up is disabled' }, { status: 403 })
  }
  return handlers.POST(request, context)
}

export const { GET, PUT, PATCH, DELETE } = handlers
