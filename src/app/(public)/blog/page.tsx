import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import BlogCard from '@/components/public/BlogCard'
import SectionHeading from '@/components/public/SectionHeading'
import { FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Articles on software engineering, tools, and the craft of building things.',
}

export const revalidate = 60

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
  })

  return (
    <div className="pt-28 pb-24">
      <div className="section-container">
        <SectionHeading
          label="Blog"
          title="Writing &amp; Thoughts"
          subtitle="Deep dives, tutorials, and opinions on software engineering."
        />

        {posts.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No posts yet.</p>
            <p className="text-sm mt-1">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <BlogCard key={post.id} post={post} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
