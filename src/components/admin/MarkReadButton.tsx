'use client'

import { useTransition } from 'react'
import { Loader2, MailOpen } from 'lucide-react'
import { markAsRead } from '@/lib/actions/messages'
import { toast } from 'sonner'

export default function MarkReadButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(async () => {
        await markAsRead(id)
        toast.success('Marked as read')
      })}
      disabled={isPending}
      className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors font-medium flex items-center gap-1.5"
    >
      {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <MailOpen className="w-3 h-3" />}
      Mark read
    </button>
  )
}
