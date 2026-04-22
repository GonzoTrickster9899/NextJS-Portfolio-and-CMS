import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Clock, Eye } from 'lucide-react'
import { format } from 'date-fns'
import DeletePostButton from '@/components/admin/DeletePostButton'

export const metadata: Metadata = { title: 'Manage Blog' }

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog Posts</h1>
          <p className="text-muted-foreground mt-1">{posts.length} total</p>
        </div>
        <Button asChild className="rounded-full gap-2 bg-gradient-to-r from-primary to-accent text-white">
          <Link href="/admin/blog/new">
            <Plus className="w-4 h-4" /> New Post
          </Link>
        </Button>
      </div>

      <div className="glass-card rounded-2xl border border-primary/10 overflow-hidden">
        {posts.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <p className="text-lg font-medium">No posts yet.</p>
            <Button asChild className="mt-4 rounded-full gap-2">
              <Link href="/admin/blog/new"><Plus className="w-4 h-4" /> Write your first post</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-primary/5">
            {posts.map((post) => (
              <div key={post.id} className="flex items-center gap-4 p-4 hover:bg-primary/5 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium truncate">{post.title}</p>
                    <Badge variant={post.published ? 'default' : 'secondary'} className="text-xs shrink-0">
                      {post.published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {post.readingTime} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {post.views} views
                    </span>
                    <span>{format(post.createdAt, 'MMM d, yyyy')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {post.published && (
                    <Button asChild variant="ghost" size="icon" className="rounded-full w-8 h-8" title="View post">
                      <Link href={`/blog/${post.slug}`} target="_blank"><Eye className="w-3.5 h-3.5" /></Link>
                    </Button>
                  )}
                  <Button asChild variant="ghost" size="icon" className="rounded-full w-8 h-8">
                    <Link href={`/admin/blog/${post.id}/edit`}><Pencil className="w-3.5 h-3.5" /></Link>
                  </Button>
                  <DeletePostButton id={post.id} title={post.title} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
