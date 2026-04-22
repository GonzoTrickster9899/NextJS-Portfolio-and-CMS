'use client'

import { useState, useTransition, useRef } from 'react'
import { Loader2, Upload, X, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createSkill, updateSkill } from '@/lib/actions/skills'
import { toast } from 'sonner'
import Image from 'next/image'

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

interface Skill {
  id: string
  name: string
  category: string
  iconUrl: string
  order: number
}

interface Props {
  skill?: Skill
  onSuccess?: () => void
}

/**
 * Render a form for creating or editing a skill, including category selection, icon upload/URL, display order, and a live badge preview.
 *
 * Handles client-side icon validation (JPEG, PNG, WebP, GIF, AVIF, SVG; max 5 MB), uploads selected files to the admin upload endpoint, and submits form data to create or update a skill.
 *
 * @param skill - Optional existing skill used to prefill the form when editing.
 * @param onSuccess - Optional callback invoked after a successful create or update operation.
 * @returns The skill form React element.
 */
export default function SkillForm({ skill, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition()
  const [isUploading, setIsUploading] = useState(false)
  const [category, setCategory] = useState(skill?.category ?? 'FRONTEND')
  const [iconUrl, setIconUrl] = useState(skill?.iconUrl ?? '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml']
    if (!allowed.includes(file.type)) {
      toast.error('Use JPEG, PNG, WebP, GIF, or SVG files.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB.')
      return
    }

    setIsUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'skills')
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Upload failed')
      }
      const { url } = await res.json()
      setIconUrl(url)
      toast.success('Icon uploaded!')
    } catch (err: any) {
      toast.error(err.message ?? 'Upload failed')
    } finally {
      setIsUploading(false)
      // Reset so same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('category', category)
    fd.set('iconUrl', iconUrl)

    startTransition(async () => {
      const result = skill
        ? await updateSkill(skill.id, fd)
        : await createSkill(fd)

      if (result?.error) {
        toast.error('Please fill all required fields correctly.')
        return
      }
      toast.success(skill ? 'Skill updated!' : 'Skill added!')
      if (!skill) {
        setCategory('FRONTEND')
        setIconUrl('')
        ;(e.target as HTMLFormElement).reset()
      }
      onSuccess?.()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name + Category */}
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
      </div>

      {/* Icon upload */}
      <div className="space-y-2">
        <Label>Skill Icon</Label>
        <div className="flex items-start gap-4">
          {/* Preview box */}
          <div className="w-16 h-16 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-center shrink-0 overflow-hidden">
            {iconUrl ? (
              <div className="relative w-full h-full">
                <Image
                  src={iconUrl}
                  alt="Skill icon preview"
                  fill
                  className="object-contain p-1.5"
                  unoptimized
                />
              </div>
            ) : (
              <ImageIcon className="w-7 h-7 text-muted-foreground/40" />
            )}
          </div>

          <div className="flex-1 space-y-2">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml"
              className="hidden"
              onChange={handleIconUpload}
            />

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 rounded-lg"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</>
                ) : (
                  <><Upload className="w-3.5 h-3.5" /> {iconUrl ? 'Replace Icon' : 'Upload Icon'}</>
                )}
              </Button>

              {iconUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 rounded-lg text-muted-foreground hover:text-destructive"
                  onClick={() => setIconUrl('')}
                >
                  <X className="w-3.5 h-3.5" /> Remove
                </Button>
              )}
            </div>

            {/* URL fallback input */}
            <Input
              name="iconUrl"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              placeholder="Or paste an image URL…"
              className="text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Accepts JPEG, PNG, WebP, GIF, SVG — max 5 MB. Use a transparent PNG or SVG for best results.
            </p>
          </div>
        </div>
      </div>

      {/* Display Order */}
      <div className="space-y-1.5 max-w-xs">
        <Label htmlFor="order">Display Order</Label>
        <Input
          id="order"
          name="order"
          type="number"
          defaultValue={skill?.order ?? 0}
        />
      </div>

      {/* Preview badge */}
      <div className="rounded-xl border border-primary/15 bg-primary/5 p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
          {iconUrl ? (
            <div className="relative w-full h-full">
              <Image
                src={iconUrl}
                alt="preview"
                fill
                className="object-contain p-1.5"
                unoptimized
              />
            </div>
          ) : (
            <ImageIcon className="w-5 h-5 text-muted-foreground/50" />
          )}
        </div>
        <div>
          <p className="font-semibold text-sm text-foreground">Badge Preview</p>
          <p className="text-xs text-muted-foreground">
            {CATEGORIES.find((c) => c.value === category)?.label ?? category}
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <Button
          type="submit"
          disabled={isPending || isUploading}
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
