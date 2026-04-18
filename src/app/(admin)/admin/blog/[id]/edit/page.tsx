import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import BlogEditor from '@/components/admin/BlogEditor'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = { title: 'Edit Post' }

export default async function EditBlogPostPage({ params }: { params: { id: string } }) {
  const post = await prisma.blogPost.findUnique({ where: { id: params.id } })
  if (!post) notFound()

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link href="/admin/blog"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Post</h1>
          <p className="text-muted-foreground text-sm mt-0.5 truncate max-w-md">{post.title}</p>
        </div>
      </div>
      <div className="glass-card rounded-2xl border border-border/50 p-6">
        <BlogEditor post={post} />
      </div>
    </div>
  )
}
