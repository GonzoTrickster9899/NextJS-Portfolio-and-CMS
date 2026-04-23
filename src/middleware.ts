import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — do NOT remove this, it keeps auth cookies alive
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isAdminRoute = path.startsWith('/admin')
  const isLoginRoute = path === '/login'

  const adminEmail = process.env.ADMIN_EMAIL
  const isAdminUser = !!user && !!adminEmail && user.email === adminEmail

  // Debug logging — development only
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] ${path} | user=${user?.email ?? 'none'} | isAdmin=${isAdminUser}`)
  }

  // Redirect unauthenticated / non-admin users away from /admin
  if (isAdminRoute && !isAdminUser) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies
      .getAll()
      .forEach((c) => redirectResponse.cookies.set(c.name, c.value))
    return redirectResponse
  }

  // Redirect already-logged-in admin away from /login
  if (isLoginRoute && isAdminUser) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies
      .getAll()
      .forEach((c) => redirectResponse.cookies.set(c.name, c.value))
    return redirectResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}
