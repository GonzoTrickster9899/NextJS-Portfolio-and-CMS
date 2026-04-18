'use client'

import { useState, useTransition } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { toast } from 'sonner'
import { Loader2, Eye, Code, X, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { createPost, updatePost } from '@/lib/actions/blog'
import type { BlogPost } from '@prisma/client'

type Tab = 'write' | 'preview'

export default function BlogEditor({ post }: { post?: BlogPost }) {
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<Tab>('write')
  const [content, setContent] = useState(post?.content ?? '')
  const [published, setPublished] = useState(post?.published ?? false)
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(post?.tags ?? [])
  const [thumbnail, setThumbnail] = useState(post?.thumbnail ?? '')
  const [isUploading, setIsUploading] = useState(false)

  const isEdit = Boolean(post?.id)

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t)) setTags((p) => [...p, t])
    setTagInput('')
  }

  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'blog')
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) { setThumbnail(data.url); toast.success('Thumbnail uploaded') }
      else toast.error(data.error ?? 'Upload failed')
    } catch { toast.error('Upload failed') }
    finally { setIsUploading(false) }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('content', content)
    fd.set('tags', JSON.stringify(tags))
    fd.set('published', String(published))
    fd.set('thumbnail', thumbnail)

    startTransition(async () => {
      const result = isEdit
        ? await updatePost(post!.id, fd)
        : await createPost(fd)

      if (result?.error) {
        const errors = result.error as Record<string, string[]>
        Object.entries(errors).forEach(([field, messages]) => {
          toast.error(`${field}: ${messages[0]}`)
        })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" name="title" defaultValue={post?.title} placeholder="My Awesome Post" required className="text-lg font-medium" />
      </div>

      {/* Slug & Excerpt */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug *</Label>
          <Input id="slug" name="slug" defaultValue={post?.slug} placeholder="my-awesome-post" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="excerpt">Excerpt *</Label>
          <Input id="excerpt" name="excerpt" defaultValue={post?.excerpt} placeholder="Short summary…" required />
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="e.g. nextjs, typescript"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
          />
          <Button type="button" variant="outline" onClick={addTag} className="shrink-0 rounded-lg">Add</Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <Badge key={t} variant="secondary" className="gap-1.5 pr-1">
                {t}
                <button type="button" onClick={() => setTags((p) => p.filter((x) => x !== t))}>
                  <X className="w-3 h-3 hover:text-destructive" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail */}
      <div className="space-y-2">
        <Label>Thumbnail</Label>
        <div className="flex items-center gap-3">
          <label className="cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handleThumbUpload} disabled={isUploading} />
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border hover:border-primary/50 text-sm text-muted-foreground hover:bg-primary/5 transition-all">
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {thumbnail ? 'Replace' : 'Upload thumbnail'}
            </div>
          </label>
          {thumbnail && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">{thumbnail.split('/').pop()}</span>
              <button type="button" onClick={() => setThumbnail('')} className="text-muted-foreground hover:text-destructive">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Markdown Editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Content *</Label>
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setActiveTab('write')}
              className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors ${activeTab === 'write' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Code className="w-3 h-3" /> Write
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors ${activeTab === 'preview' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Eye className="w-3 h-3" /> Preview
            </button>
          </div>
        </div>

        {activeTab === 'write' ? (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post in Markdown...

# Heading

Some **bold** text and `code`.

```javascript
const hello = 'world'
```"
            rows={20}
            className="font-mono text-sm resize-y"
            required
          />
        ) : (
          <div className="min-h-[480px] rounded-xl border border-border p-6 bg-muted/30 overflow-auto">
            {content ? (
              <div className="prose-portfolio">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm italic">Nothing to preview yet…</p>
            )}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          {content.trim().split(/\s+/).filter(Boolean).length} words ·{' '}
          {Math.ceil(content.trim().split(/\s+/).filter(Boolean).length / 200)} min read
        </p>
      </div>

      {/* Publish toggle + submit */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="flex items-center gap-2">
          <Switch id="published" checked={published} onCheckedChange={setPublished} />
          <Label htmlFor="published" className="cursor-pointer">
            {published ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Published</span>
            ) : (
              <span className="text-muted-foreground">Draft</span>
            )}
          </Label>
        </div>
        <Button
          type="submit"
          disabled={isPending || isUploading}
          className="rounded-full bg-gradient-to-r from-primary to-accent text-white gap-2 px-8"
        >
          {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : isEdit ? 'Update Post' : 'Create Post'}
        </Button>
      </div>
    </form>
  )
}
