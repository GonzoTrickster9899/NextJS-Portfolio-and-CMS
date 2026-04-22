'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createSkill, updateSkill } from '@/lib/actions/skills'
import { toast } from 'sonner'

const CATEGORIES = [
  { value: 'FRONTEND', label: 'Frontend' },
  { value: 'BACKEND', label: 'Backend' },
  { value: 'DATABASE', label: 'Database' },
  { value: 'DEVOPS', label: 'DevOps' },
  { value: 'TOOLS', label: 'Tools' },
  { value: 'LANGUAGES', label: 'Languages' },
  { value: 'MOBILE', label: 'Mobile' },
  { value: 'OTHER', label: 'Other' },
]

const SUGGESTED_ICONS = ['⚡','🎨','🗄️','🚀','🔧','💻','📱','🔷','🐍','☕','🦀','🐹','🟨','🟦','⚛️','🎯','🌐','🔒','📦','🛠️','🔥','✨','🌿','⚙️']

interface Skill {
  id: string
  name: string
  category: string
  icon: string
  proficiency: number
  order: number
}

interface Props {
  skill?: Skill
  onSuccess?: () => void
}

export default function SkillForm({ skill, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition()
  const [category, setCategory] = useState(skill?.category ?? 'FRONTEND')
  const [icon, setIcon] = useState(skill?.icon ?? '⚡')
  const [proficiency, setProficiency] = useState(skill?.proficiency ?? 80)
  const [iconInput, setIconInput] = useState(skill?.icon ?? '⚡')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('category', category)
    fd.set('icon', icon)
    fd.set('proficiency', String(proficiency))

    startTransition(async () => {
      const result = skill
        ? await updateSkill(skill.id, fd)
        : await createSkill(fd)

      if (result?.error) {
        toast.error('Please fill all required fields correctly')
        return
      }
      toast.success(skill ? 'Skill updated!' : 'Skill added!')
      if (!skill) {
        setCategory('FRONTEND')
        setIcon('⚡')
        setIconInput('⚡')
        setProficiency(80)
        ;(e.target as HTMLFormElement).reset()
      }
      onSuccess?.()
    })
  }

  const selectIcon = (i: string) => {
    setIcon(i)
    setIconInput(i)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name + Icon */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Skill Name *</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g. React"
            defaultValue={skill?.name}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="icon">Icon / Emoji</Label>
          <div className="flex gap-2">
            <Input
              id="icon"
              name="icon"
              value={iconInput}
              onChange={(e) => { setIconInput(e.target.value); setIcon(e.target.value) }}
              placeholder="⚡"
              className="w-20 text-center text-lg"
              maxLength={4}
            />
            <div className="flex flex-wrap gap-1 flex-1">
              {SUGGESTED_ICONS.slice(0, 12).map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectIcon(i)}
                  className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all hover:scale-110 ${
                    icon === i
                      ? 'bg-primary/20 border border-primary/40 shadow-sm'
                      : 'hover:bg-primary/10 border border-transparent'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Category + Order */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Category *</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="order">Display Order</Label>
          <Input
            id="order"
            name="order"
            type="number"
            defaultValue={skill?.order ?? 0}
          />
        </div>
      </div>

      {/* Proficiency slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="proficiency">Proficiency</Label>
          <span className="text-sm font-semibold text-primary tabular-nums">{proficiency}%</span>
        </div>
        <input
          id="proficiency"
          name="proficiency"
          type="range"
          min={1}
          max={100}
          value={proficiency}
          onChange={(e) => setProficiency(Number(e.target.value))}
          className="w-full accent-primary h-2 rounded-full cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Beginner</span>
          <span>Intermediate</span>
          <span>Expert</span>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-xl border border-primary/15 bg-primary/5 p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center text-xl shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground">Preview</p>
          <p className="text-xs text-muted-foreground">
            {icon} · {CATEGORIES.find((c) => c.value === category)?.label ?? category} · {proficiency}% proficiency
          </p>
        </div>
        <div className="text-right">
          <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
              style={{ width: `${proficiency}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <Button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-gradient-to-r from-primary to-accent text-white gap-2 shadow-lg shadow-primary/20"
        >
          {isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> {skill ? 'Saving…' : 'Adding…'}</>
          ) : (
            skill ? 'Save Changes' : 'Add Skill'
          )}
        </Button>
      </div>
    </form>
  )
}
