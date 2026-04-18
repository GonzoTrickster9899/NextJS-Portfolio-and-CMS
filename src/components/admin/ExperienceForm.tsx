'use client'

import { useState, useTransition } from 'react'
import { Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { createExperience } from '@/lib/actions/experience'
import { toast } from 'sonner'

export default function ExperienceForm() {
  const [isPending, startTransition] = useTransition()
  const [techInput, setTechInput] = useState('')
  const [techStack, setTechStack] = useState<string[]>([])
  const [isCurrent, setIsCurrent] = useState(false)

  const addTech = () => {
    const t = techInput.trim()
    if (t && !techStack.includes(t)) setTechStack((p) => [...p, t])
    setTechInput('')
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('techStack', JSON.stringify(techStack))
    fd.set('isCurrent', String(isCurrent))

    startTransition(async () => {
      const result = await createExperience(fd)
      if (result?.error) { toast.error('Please fill all required fields'); return }
      toast.success('Experience added')
      setTechStack([])
      setIsCurrent(false)
      ;(e.target as HTMLFormElement).reset()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="company">Company *</Label>
          <Input id="company" name="company" placeholder="Acme Corp" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="role">Role *</Label>
          <Input id="role" name="role" placeholder="Senior Engineer" required />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="duration">Duration *</Label>
          <Input id="duration" name="duration" placeholder="Jan 2022 – Present" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="order">Display Order</Label>
          <Input id="order" name="order" type="number" defaultValue={0} className="w-full" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description *</Label>
        <Textarea id="description" name="description" rows={3} placeholder="Describe your responsibilities and achievements…" required />
      </div>
      <div className="space-y-2">
        <Label>Tech Stack</Label>
        <div className="flex gap-2">
          <Input value={techInput} onChange={(e) => setTechInput(e.target.value)} placeholder="e.g. React"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTech() } }} />
          <Button type="button" variant="outline" onClick={addTech} className="shrink-0 rounded-lg">Add</Button>
        </div>
        {techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {techStack.map((t) => (
              <Badge key={t} variant="secondary" className="gap-1.5 pr-1">
                {t}
                <button type="button" onClick={() => setTechStack((p) => p.filter((x) => x !== t))}><X className="w-3 h-3" /></button>
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <Switch id="isCurrent" checked={isCurrent} onCheckedChange={setIsCurrent} />
          <Label htmlFor="isCurrent">Current position</Label>
        </div>
        <Button type="submit" disabled={isPending} className="rounded-full bg-gradient-to-r from-primary to-accent text-white gap-2">
          {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding…</> : 'Add Entry'}
        </Button>
      </div>
    </form>
  )
}
