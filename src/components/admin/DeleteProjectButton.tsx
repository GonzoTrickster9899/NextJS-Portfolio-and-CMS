'use client'

import { useState, useTransition } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteProject } from '@/lib/actions/projects'
import { toast } from 'sonner'

interface Props {
  id: string
  title: string
}

export default function DeleteProjectButton({ id, title }: Props) {
  const [isPending, startTransition] = useTransition()
  const [confirm, setConfirm] = useState(false)

  const handleDelete = () => {
    if (!confirm) {
      setConfirm(true)
      setTimeout(() => setConfirm(false), 3000)
      return
    }
    startTransition(async () => {
      await deleteProject(id)
      toast.success(`"${title}" deleted`)
    })
  }

  return (
    <Button
      variant={confirm ? 'destructive' : 'ghost'}
      size="icon"
      className="rounded-full w-8 h-8"
      onClick={handleDelete}
      disabled={isPending}
      title={confirm ? 'Click again to confirm delete' : 'Delete project'}
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Trash2 className="w-3.5 h-3.5" />
      )}
    </Button>
  )
}
