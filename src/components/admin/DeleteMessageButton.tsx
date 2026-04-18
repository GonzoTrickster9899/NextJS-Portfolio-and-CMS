'use client'

import { useState, useTransition } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { deleteMessage } from '@/lib/actions/messages'
import { toast } from 'sonner'

export default function DeleteMessageButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  const [confirm, setConfirm] = useState(false)

  const handle = () => {
    if (!confirm) { setConfirm(true); setTimeout(() => setConfirm(false), 3000); return }
    startTransition(async () => {
      await deleteMessage(id)
      toast.success('Message deleted')
    })
  }

  return (
    <button
      onClick={handle}
      disabled={isPending}
      className={`text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1.5 transition-colors ${
        confirm
          ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
          : 'bg-muted text-muted-foreground hover:text-destructive hover:bg-muted/80'
      }`}
    >
      {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
      {confirm ? 'Confirm?' : 'Delete'}
    </button>
  )
}
