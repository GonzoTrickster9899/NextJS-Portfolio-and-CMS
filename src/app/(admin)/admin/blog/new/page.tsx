import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import BlogEditor from '@/components/admin/BlogEditor'

export const metadata: Metadata = { title: 'New Post' }

export default function NewBlogPostPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link href="/admin/blog"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Post</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Write a new blog post with Markdown</p>
        </div>
      </div>
      <div className="glass-card rounded-2xl border border-primary/10 p-6">
        <BlogEditor />
      </div>
    </div>
  )
}
