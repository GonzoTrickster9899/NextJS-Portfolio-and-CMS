'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Inbox,
  Briefcase,
  LogOut,
  Code2,
  ExternalLink,
  FileDown,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/projects', label: 'Projects', icon: FolderKanban, exact: false },
  { href: '/admin/blog', label: 'Blog', icon: FileText, exact: false },
  { href: '/admin/inbox', label: 'Inbox', icon: Inbox, exact: false },
  { href: '/admin/experience', label: 'Experience', icon: Briefcase, exact: false },
  { href: '/admin/skills', label: 'Skills', icon: Sparkles, exact: false },
  { href: '/admin/resume', label: 'Resume', icon: FileDown, exact: false },
]

interface Props {
  userEmail: string
}

export default function AdminSidebar({ userEmail }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-72 shrink-0 hidden lg:flex flex-col h-screen sticky top-0 border-r border-primary/10 bg-card/50 backdrop-blur-sm">
      {/* Brand */}
      <div className="p-6 border-b border-primary/10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <Code2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-none gradient-text">Admin</p>
            <p className="text-xs text-muted-foreground mt-0.5">Dashboard</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-primary/5'
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="admin-nav-pill"
                  className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <Icon className="w-4 h-4 relative" />
              <span className="relative">{item.label}</span>
            </Link>
          )
        })}

        <div className="pt-4 mt-4 border-t border-primary/10">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Site
          </Link>
        </div>
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-primary/10">
        <div className="glass-card rounded-xl p-3 flex items-center gap-3 border border-primary/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
            <span className="text-white text-xs font-bold uppercase">
              {userEmail[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{userEmail}</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
