import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { formatDistanceToNow } from 'date-fns'
import { Mail, MailOpen, Trash2 } from 'lucide-react'
import MarkReadButton from '@/components/admin/MarkReadButton'
import DeleteMessageButton from '@/components/admin/DeleteMessageButton'

export const metadata: Metadata = { title: 'Inbox' }

export default async function InboxPage() {
  const messages = await prisma.message.findMany({
    orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
  })

  const unread = messages.filter((m) => !m.isRead).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
        <p className="text-muted-foreground mt-1">
          {messages.length} total · {unread} unread
        </p>
      </div>

      <div className="glass-card rounded-2xl border border-primary/10 overflow-hidden">
        {messages.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No messages yet.</p>
            <p className="text-sm mt-1">Messages from your contact form will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-primary/5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-5 transition-colors ${!msg.isRead ? 'bg-primary/5 hover:bg-primary/8' : 'hover:bg-primary/5'}`}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm uppercase ${!msg.isRead ? 'bg-gradient-to-br from-primary to-accent text-white' : 'bg-muted text-muted-foreground'}`}>
                    {msg.name[0]}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`font-semibold text-sm ${!msg.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {msg.name}
                      </span>
                      {!msg.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                      <span className="text-xs text-muted-foreground ml-auto shrink-0">
                        {formatDistanceToNow(msg.createdAt, { addSuffix: true })}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground mb-1">{msg.email}</p>
                    <p className={`text-sm font-medium mb-2 ${!msg.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {msg.subject}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {msg.message}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      <a
                        href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                        className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
                      >
                        Reply via Email
                      </a>
                      {!msg.isRead && <MarkReadButton id={msg.id} />}
                      <DeleteMessageButton id={msg.id} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
