import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth/admin'
import AdminSidebar from '@/components/layout/AdminSidebar'

// Reads the Neon Auth session, so every admin page must render per request
export const dynamic = 'force-dynamic'

/**
 * Renders the admin layout and enforces that the current user is the configured admin.
 *
 * If there is no authenticated user or the user's email does not match `process.env.ADMIN_EMAIL`, the request is redirected to `/login`.
 *
 * @param children - Content to render in the layout's main area
 * @returns The layout element containing the admin sidebar and the main content area
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAdminUser()
  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar userEmail={user.email} />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 lg:p-10 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
