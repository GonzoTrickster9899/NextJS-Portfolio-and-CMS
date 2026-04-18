'use client'

import { useState, useTransition } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteExperience } from '@/lib/actions/experience'
import { toast } from 'sonner'

export default function DeleteExperienceButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  const [confirm, setConfirm] = useState(false)

  const handle = () => {
    if (!confirm) { setConfirm(true); setTimeout(() => setConfirm(false), 3000); return }
    startTransition(async () => {
      await deleteExperience(id)
      toast.success('Entry deleted')
    })
  }

  return (
    <button
      onClick={handle}
      disabled={isPending}
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 ${confirm ? 'bg-destructive/10 text-destructive' : 'text-muted-foreground hover:text-destructive hover:bg-muted'}`}
      title={confirm ? 'Click again to confirm' : 'Delete'}
    >
      {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
    </button>
  )
}
