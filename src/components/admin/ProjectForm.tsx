'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Loader2, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { createProject, updateProject } from '@/lib/actions/projects'
import type { Project } from '@prisma/client'

const CATEGORIES = ['FRONTEND', 'BACKEND', 'FULLSTACK', 'DEVOPS', 'MOBILE', 'OTHER'] as const
type Category = typeof CATEGORIES[number]

export default function ProjectForm({ project }: { project?: Project }) {
  const [isPending, startTransition] = useTransition()
  const [techInput, setTechInput] = useState('')
  const [techStack, setTechStack] = useState<string[]>(project?.techStack ?? [])
  const [imageUrl, setImageUrl] = useState(project?.imageUrl ?? '')
  const [isUploading, setIsUploading] = useState(false)
  const [isFeatured, setIsFeatured] = useState(project?.isFeatured ?? false)
  const [category, setCategory] = useState<Category>(project?.category ?? 'FULLSTACK')
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  const isEdit = Boolean(project?.id)

  const addTech = () => {
    const t = techInput.trim()
    if (t && !techStack.includes(t)) setTechStack((p) => [...p, t])
    setTechInput('')
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'projects')
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) { setImageUrl(data.url); toast.success('Image uploaded') }
      else toast.error(data.error ?? 'Upload failed')
    } catch { toast.error('Upload failed') }
    finally { setIsUploading(false) }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('techStack', JSON.stringify(techStack))
    fd.set('imageUrl', imageUrl)
    fd.set('isFeatured', String(isFeatured))
    fd.set('category', category)

    startTransition(async () => {
      const result = isEdit
        ? await updateProject(project!.id, fd)
        : await createProject(fd)
      if (result?.error) {
        setErrors(result.error as Record<string, string[]>)
        toast.error('Please fix the errors below')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title & Slug */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" name="title" defaultValue={project?.title} required />
          {errors.title && <p className="text-xs text-destructive">{errors.title[0]}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug *</Label>
          <Input id="slug" name="slug" defaultValue={project?.slug} placeholder="my-project" required />
          {errors.slug && <p className="text-xs text-destructive">{errors.slug[0]}</p>}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Description *</Label>
        <Textarea id="description" name="description" defaultValue={project?.description} rows={4} required />
      </div>

      {/* Image */}
      <div className="space-y-2">
        <Label>Cover Image *</Label>
        {imageUrl && (
          <div className="relative h-44 rounded-xl overflow-hidden border border-primary/20">
            <Image src={imageUrl} alt="Preview" fill className="object-cover" />
            <button
              type="button"
              onClick={() => setImageUrl('')}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <label className="cursor-pointer block">
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-all text-sm text-muted-foreground">
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {isUploading ? 'Uploading…' : imageUrl ? 'Replace image' : 'Upload image (max 5MB)'}
          </div>
        </label>
        {errors.imageUrl && <p className="text-xs text-destructive">{errors.imageUrl[0]}</p>}
      </div>

      {/* Tech Stack */}
      <div className="space-y-2">
        <Label>Tech Stack *</Label>
        <div className="flex gap-2">
          <Input
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            placeholder="e.g. React, Node.js"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTech() } }}
          />
          <Button type="button" variant="outline" onClick={addTech} className="rounded-lg shrink-0">Add</Button>
        </div>
        {techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {techStack.map((t) => (
              <Badge key={t} variant="secondary" className="gap-1.5 pr-1">
                {t}
                <button type="button" onClick={() => setTechStack((p) => p.filter((x) => x !== t))} className="hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        {errors.techStack && <p className="text-xs text-destructive">{errors.techStack[0]}</p>}
      </div>

      {/* Links */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="githubLink">GitHub URL</Label>
          <Input id="githubLink" name="githubLink" type="url" defaultValue={project?.githubLink ?? ''} placeholder="https://github.com/…" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="liveLink">Live URL</Label>
          <Input id="liveLink" name="liveLink" type="url" defaultValue={project?.liveLink ?? ''} placeholder="https://…" />
        </div>
      </div>

      {/* Category, Order, Featured */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-1.5 flex-1 min-w-[160px]">
          <Label>Category</Label>
          <Select value={category} onValueChange={(value: Category) => setCategory(value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="order">Display Order</Label>
          <Input id="order" name="order" type="number" defaultValue={project?.order ?? 0} className="w-24" />
        </div>
        <div className="flex items-center gap-2 pb-0.5">
          <Switch id="isFeatured" checked={isFeatured} onCheckedChange={setIsFeatured} />
          <Label htmlFor="isFeatured">Featured</Label>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending || isUploading || !imageUrl}
        className="w-full rounded-full bg-gradient-to-r from-primary to-accent text-white gap-2"
        size="lg"
      >
        {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : isEdit ? 'Update Project' : 'Create Project'}
      </Button>
    </form>
  )
}
