import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { FolderKanban, FileText, Inbox, Briefcase, ArrowRight, Mail } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export const metadata: Metadata = { title: 'Admin Dashboard' }

async function getStats() {
  const [totalProjects, totalPosts, publishedPosts, unreadMessages, totalExperiences, recentMessages] =
    await Promise.all([
      prisma.project.count(),
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { published: true } }),
      prisma.message.count({ where: { isRead: false } }),
      prisma.experience.count(),
      prisma.message.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ])

  return { totalProjects, totalPosts, publishedPosts, unreadMessages, totalExperiences, recentMessages }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const STAT_CARDS = [
    {
      label: 'Total Projects',
      value: stats.totalProjects,
      icon: FolderKanban,
      href: '/admin/projects',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      label: 'Blog Posts',
      value: `${stats.publishedPosts} / ${stats.totalPosts}`,
      sub: 'published',
      icon: FileText,
      href: '/admin/blog',
      color: 'from-green-500 to-emerald-600',
    },
    {
      label: 'Unread Messages',
      value: stats.unreadMessages,
      icon: Inbox,
      href: '/admin/inbox',
      color: stats.unreadMessages > 0 ? 'from-rose-500 to-pink-600' : 'from-emerald-500 to-green-600',
      alert: stats.unreadMessages > 0,
    },
    {
      label: 'Experiences',
      value: stats.totalExperiences,
      icon: Briefcase,
      href: '/admin/experience',
      color: 'from-green-600 to-teal-700',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back. Here&apos;s what&apos;s going on with your portfolio.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group glass-card rounded-2xl p-5 border border-primary/10 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
                </div>
                {card.alert && (
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {/* Recent Messages */}
      <div className="glass-card rounded-2xl border border-primary/10 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-primary/10">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            <h2 className="font-semibold">Recent Messages</h2>
          </div>
          <Link
            href="/admin/inbox"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {stats.recentMessages.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No messages yet.
          </div>
        ) : (
          <div className="divide-y divide-primary/5">
            {stats.recentMessages.map((msg) => (
              <Link
                key={msg.id}
                href="/admin/inbox"
                className="flex items-start gap-4 p-4 hover:bg-primary/5 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary uppercase">
                    {msg.name[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{msg.name}</p>
                    {!msg.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{msg.subject}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatDistanceToNow(msg.createdAt, { addSuffix: true })}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wider">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/admin/projects/new', label: '+ New Project' },
            { href: '/admin/blog/new', label: '+ New Post' },
            { href: '/admin/inbox', label: 'Check Inbox' },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="px-4 py-2 rounded-full glass-card border border-primary/20 hover:border-primary/40 hover:bg-primary/5 text-sm font-medium text-muted-foreground hover:text-primary transition-all hover:-translate-y-0.5"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
